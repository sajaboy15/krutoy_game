"""Собирает rsrc_windows_amd64.syso с иконкой «Ёдгора» из PNG (16…256 px) для Go."""
import struct, sys, pathlib

pngs = [pathlib.Path(p).read_bytes() for p in sys.argv[1:]]
LANG = 1033
res = {3: {}, 14: {}}
grp = struct.pack('<HHH', 0, 1, len(pngs))
for i, png in enumerate(pngs, 1):
    w, h = struct.unpack('>II', png[16:24])
    res[3][i] = (LANG, png)
    grp += struct.pack('<BBBBHHIH', w if w < 256 else 0, h if h < 256 else 0, 0, 0, 1, 32, len(png), i)
res[14][1] = (LANG, grp)

types = sorted(res)
# раскладка секции: каталоги, записи данных, потом данные
dirs = bytearray()
def d_header(n):
    return struct.pack('<IIHHHH', 0, 0, 0, 0, 0, n)
# считаем размеры
n_types = len(types)
lvl1 = 16 + 8 * n_types
lvl2_sizes = [16 + 8 * len(res[t]) for t in types]
n_leaves = sum(len(res[t]) for t in types)
lvl3_size = 16 + 8  # один язык на имя
off_lvl2 = lvl1
off_lvl3 = off_lvl2 + sum(lvl2_sizes)
off_data_entries = off_lvl3 + n_leaves * lvl3_size
off_blobs = off_data_entries + 16 * n_leaves

out = bytearray()
relocs = []
# уровень 1
out += d_header(n_types)
cur2 = off_lvl2
for t, sz in zip(types, lvl2_sizes):
    out += struct.pack('<II', t, 0x80000000 | cur2); cur2 += sz
# уровень 2
leaf = 0
for t in types:
    out += d_header(len(res[t]))
    for rid in sorted(res[t]):
        out += struct.pack('<II', rid, 0x80000000 | (off_lvl3 + leaf * lvl3_size)); leaf += 1
# уровень 3
leaf = 0
for t in types:
    for rid in sorted(res[t]):
        lang, _ = res[t][rid]
        out += d_header(1) + struct.pack('<II', lang, off_data_entries + 16 * leaf); leaf += 1
# записи данных
blob_off = off_blobs
blobs = []
for t in types:
    for rid in sorted(res[t]):
        _, blob = res[t][rid]
        relocs.append(len(out))  # поле OffsetToData
        out += struct.pack('<IIII', blob_off, len(blob), 0, 0)
        blobs.append(blob)
        blob_off += (len(blob) + 7) & ~7
for blob in blobs:
    out += blob + b'\0' * (((len(blob) + 7) & ~7) - len(blob))

# COFF
hdr_size = 20 + 40
raw_ptr = hdr_size
reloc_ptr = raw_ptr + len(out)
sym_ptr = reloc_ptr + 10 * len(relocs)
coff = struct.pack('<HHIIIHH', 0x8664, 1, 0, sym_ptr, 1, 0, 0)
section = b'.rsrc\0\0\0' + struct.pack('<IIIIIIHHI', 0, 0, len(out), raw_ptr, reloc_ptr, 0, len(relocs), 0, 0x40000040)
rel = b''.join(struct.pack('<IIH', r, 0, 3) for r in relocs)  # IMAGE_REL_AMD64_ADDR32NB к символу 0
sym = b'.rsrc\0\0\0' + struct.pack('<IhHBB', 0, 1, 0, 3, 0)
strtab = struct.pack('<I', 4)
pathlib.Path('rsrc_windows_amd64.syso').write_bytes(coff + section + out + rel + sym + strtab)
print('types', types, 'icons', len(res.get(3, {})), 'syso bytes', len(coff + section + out + rel + sym + strtab))

/* 89s_world_big.js — bigger regions and more to find in them.
   - Every open region is wider: the three hubs (the Tail, the Memory Bazaar, the Ark) about twice as wide, the rest
     by a third; the karez-type regions get more rooms. Everything placed by fraction (people, stalls, exits, quests)
     spreads out with them.
   - The generator leans toward height: more towers, cliffs, bridges, terraces and islands, so a region is climbed and
     searched, not only crossed.
   - Along the new length: hook towers with a cache on the roof (the hook comes in Act I: come back for them), sealed
     houses with a cracked wall (a secret room), houses with a barred back door (a shortcut, a chest inside),
     loose chests and caches. Every one has a stable id: once opened, it stays open.
   The hubs also get more of the city: extra stalls, a second house of trade, a courtyard. */
{
  const W2 = G.WORLD2, D = G.Biomes && G.Biomes.defs;
  if (!W2 || !D) { console.warn('[big] no world'); }
  const HUB = { tail: 1.9, bazaar: 2.1, ark: 2.0 };
  const K_OTHER = { surface: 1.35, under: 1.3, heights: 1.35, deep: 1.25, dream: 1.2 };
  const VERT = ['tower', 'cliff', 'bridge', 'terrace', 'islands'];
  const scaled = new Set();
  const biomesOf = def => !def.biome ? [] : typeof def.biome === 'string' ? [def.biome] : Object.values(def.biome);
  for (const id in (W2 && W2.regions) || {}) {
    const def = W2.regions[id];
    if (!def || !def.tier || def.lair || def.arena) continue;
    const k = HUB[id] || K_OTHER[def.tier] || 1.3;
    def._bigK = k;
    for (const b of biomesOf(def)) {
      const bd = D[b]; if (!bd || !bd.gen || scaled.has(b)) continue;
      scaled.add(b);
      const g = bd.gen;
      if (g.width) g.width = Math.round(g.width * k);
      else if (g.cols) g.cols = Math.round(g.cols * Math.min(1.5, k));
      if (g.segments) for (const s of VERT) if (g.segments[s] != null) g.segments[s] = +(g.segments[s] * 1.4).toFixed(2);
    }
  }

  // the hubs by day are the city's living rooms: fewer enemies on the streets (the night keeps its own)
  for (const b of ['w_tail_day', 'w_bazaar_day', 'w_ark']) { const bd = D && D[b]; if (bd && bd.gen && bd.gen.enemies) bd.gen.enemies = [0, 1]; }

  /* ---------------------------------------------------------------- more to find along the new length */
  const add = (region, ...objs) => { const r = W2.regions[region]; if (r && r.objects) r.objects.push(...objs); };
  const SEQ = ['hook', 'sealed', 'house', 'chest', 'hook', 'cache', 'house', 'sealed'];
  function fill(region, n, from, to) {
    for (let i = 0; i < n; i++) {
      const frac = +(from + (to - from) * (i + 0.5) / n).toFixed(3), kind = SEQ[i % SEQ.length], id = 'big' + i;
      if (kind === 'hook') add(region, { kind: 'hooktower', id: 'bigt' + i, at: { frac }, h: 10 + (i % 3) * 2, w: 5, top: [{ kind: 'cache', dx: -1.6 }] });
      else if (kind === 'sealed') add(region, { kind: 'sealed', id: 'bigs' + i, at: { frac }, side: i % 2 ? 'e' : 'w' });
      else if (kind === 'house') add(region, { kind: 'house', id: 'bigh' + i, at: { frac }, w: 11 + (i % 3) * 2, h: 5, doors: i % 2 ? { w: 'open', e: 'shortcut' } : { w: 'shortcut', e: 'open' }, inside: [{ kind: 'chest', dx: 0.5 }] });
      else if (kind === 'chest') add(region, { kind: 'chest', id, at: { frac } });
      else add(region, { kind: 'cache', id, at: { frac } });
    }
  }
  if (W2 && W2.regions) {
    for (const id in W2.regions) {
      const def = W2.regions[id];
      if (!def || !def.tier || def.lair || def.arena || !def._bigK) continue;
      const roomy = biomesOf(def).some(b => D[b] && D[b].gen && D[b].gen.cols);
      if (roomy) continue;                      // the karez-type rooms keep their own grates and wells
      const n = HUB[id] ? 8 : def.tier === 'dream' ? 3 : 5;
      fill(id, n, 0.05, 0.95);
    }
    // the hubs: more of the city itself
    add('bazaar',
      { kind: 'stall', id: 'spice', shop: 'bazaar', at: { frac: 0.24 }, kinds: ['consumable', 'material', 'charm'] },
      { kind: 'stall', id: 'silk', shop: 'bazaar', night: 'secret', at: { frac: 0.82 }, kinds: ['armour', 'charm', 'consumable'], nightKinds: ['mod', 'tumar', 'charm'] },
      { kind: 'house', id: 'tradehouse', at: { frac: 0.63 }, w: 20, h: 6, doors: { w: 'open', e: 'open' }, inside: [{ kind: 'chest', dx: 0.8 }] },
      { kind: 'spot', id: 'gate_e', at: { frac: 0.96 } }, { kind: 'spot', id: 'fountain', at: { frac: 0.3 } }, { kind: 'spot', id: 'rows', at: { frac: 0.7 } }
    );
    add('tail',
      { kind: 'house', id: 'courtyard', at: { frac: 0.44 }, w: 18, h: 5, doors: { w: 'open', e: 'shortcut' }, inside: [{ kind: 'chest', dx: 0.3 }] },
      { kind: 'spot', id: 'well_sq', at: { frac: 0.55 } }, { kind: 'spot', id: 'alley', at: { frac: 0.8 } }, { kind: 'spot', id: 'steps', at: { frac: 0.2 } }
    );
    add('ark',
      { kind: 'stall', id: 'jeweller', shop: 'bazaar', at: { frac: 0.36 }, kinds: ['charm', 'mod', 'armour'] },
      { kind: 'house', id: 'archive', at: { frac: 0.72 }, w: 18, h: 6, doors: { w: 'shortcut', e: 'open' }, inside: [{ kind: 'chest', dx: 0.5 }] },
      { kind: 'spot', id: 'parade', at: { frac: 0.5 } }, { kind: 'spot', id: 'garden', at: { frac: 0.25 } }, { kind: 'spot', id: 'gate_w', at: { frac: 0.05 } }
    );
  }
  G.WORLD_BIG = { HUB, K_OTHER };
}

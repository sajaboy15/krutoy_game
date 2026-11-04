/* =====================================================================
   Saves: the autosave (start of every land, and right after a boss),
   plus three slots — save from the pause menu, load from the main menu.
   A slot keeps the journey as it was at the start of the current land.
   ===================================================================== */
const SLOT_KEY = n => 'yodgor2_slot_' + n;
const readSlot = n => {
  try { const c = JSON.parse(localStorage.getItem(SLOT_KEY(n)) || 'null'); return c && c.v === 2 && c.run && c.rpg ? c : null; } catch (e) { return null; }
};
const slotLabel = (n, c) => {
  const head = tf(`Slot {n}|Ячейка {n}|Katak {n}`, { n });
  if (!c) return head + ' · ' + t(`empty|пусто|bo'sh`);
  const d = new Date(c.at || 0);
  const pad = x => String(x).padStart(2, '0');
  const when = pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  const mode = c.run.mode === 'souls' ? t(`The Oath|Клятва|Qasam`) : t(`Pilgrim|Путник|Yo'lchi`);
  return head + ' · ' + LANG.T(c.land || '') + ' · ' + mode + ' · ' + when;
};
G.SAVE_MENU = () => {
  if (!G.run) return;
  if (G.run.mode === 'classic') { toast(t(`No Return: this road cannot be saved.|Без возврата: эту дорогу не сохранить.|Qaytishsiz: bu yo'lni saqlab bo'lmaydi.`), C.danger); return; }
  const cp = readCP();
  if (!cp) { toast(t(`Nothing to save yet.|Пока нечего сохранять.|Hozircha saqlanadigan narsa yo'q.`), C.danger); return; }
  const opts = [1, 2, 3].map(n => ({ label: slotLabel(n, readSlot(n)), value: n }));
  opts.push({ label: t(`Back|Назад|Orqaga`), value: null, color: '#9a8a78' });
  G.UI.choice({
    title: t(`Save the journey|Сохранить поход|Safarni saqlash`), cancel: true, options: opts,
    onPick: n => {
      if (!n) return;
      try { localStorage.setItem(SLOT_KEY(n), JSON.stringify(readCP())); } catch (e) { toast(t(`Could not save.|Не удалось сохранить.|Saqlab bo'lmadi.`), C.danger); return; }
      sfx('scroll');
      toast(tf(`Saved to slot {n}: you will return to the start of this land.|Сохранено в ячейку {n}: вернёшься в начало этой земли.|{n}-katakka saqlandi: shu yerning boshiga qaytasan.`, { n }), C.know);
      menuSlots();
    }
  });
};
G.LOAD_MENU = () => {
  const opts = [];
  const auto = readCP();
  if (auto) opts.push({ label: t(`Autosave|Автосохранение|Avtosaqlash`) + ' · ' + LANG.T(auto.land || ''), value: 'auto' });
  for (const n of [1, 2, 3]) { const c = readSlot(n); opts.push({ label: slotLabel(n, c), value: c ? n : 'none' }); }
  opts.push({ label: t(`Back|Назад|Orqaga`), value: null, color: '#9a8a78' });
  G.UI.choice({
    title: t(`Load a journey|Загрузить поход|Safarni yuklash`), cancel: true, options: opts,
    onPick: n => {
      if (n === 'none') { toast(t(`This slot is empty.|Эта ячейка пуста.|Bu katak bo'sh.`), C.danger); G.LOAD_MENU(); return; }
      const c = n === 'auto' ? readCP() : n && readSlot(n);
      if (!c) return;
      G.Game.fadeTo(() => { try { continueRun(c); } catch (e) { console.error('[yodgor]', e); } }, 0.035);
    }
  });
};
function menuSlots() {
  const M = G.MAIN_MENU;
  if (!Array.isArray(M)) return;
  const any = true; // always offered: shows the autosave and the three slots
  const label = t(`Load game|Загрузить|Yuklash`);
  const i = M.findIndex(x => x && x.act === 'load');
  if (any) {
    if (i < 0) { const at = M.findIndex(x => x && x.label === 'Новый поход'); M.splice(at + 1, 0, { label, act: 'load' }); } else M[i].label = label;
  } else if (i >= 0) M.splice(i, 1);
}
LANG.onChange(menuSlots);
G.Events.on('state', st => { if (st === 'title') menuSlots(); });
menuSlots();

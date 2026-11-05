/* 89o_enemies.js — Stage 8b: enemy families, elites, group behaviour (GDD ch. 16).
   1. New types that the families of ch. 16 call for and the game did not have (20): each has its own role in a group
      (rock thrower, mob, chorister, mentor who heals, shield-bearer, net-thrower, captain, oil-thrower, fence who runs
      with the loot, clay crawler, fireflies, salt snake, convict, vulture, mask, burner, snow-leopard cub, stone guard
      of the vertebra, shade of the Year of Sand, nightmare flame). Their names and lines are in the bestiary (89l).
   2. Elite modifiers (1–2 per elite): Burning, Shadow, Shielded, Leader, Hollow, Vengeful, Possessed.
   3. Group behaviour: no more than two enemies start an attack at the same time on Normal (one on Easy, three on Hard):
      the rest hold their swing a moment (fair, not turn-based). Enemies of the Divan and of Those Who Remember fight
      each other when they meet. */
{
  const EK = G.EK, ED = G.Enemies.defs, U = G.U, KIT = G.BossKit;
  const pl = () => G.world && G.world.player;
  const C = (base, id, name, over, look) => { if (!ED[base]) { console.warn('[8b] no base', base); return null; } const d = EK.clone(base, id, Object.assign({ name: N(name) }, over || {}), look); return d; };
  const wrapUpd = (d, fn) => { const u0 = d.update; d.update = function (e) { if (fn(e) === true) return; if (u0) u0.call(this, e); }; };
  const wrapInit = (d, fn) => { const i0 = d.init; d.init = function (e, o) { if (i0) i0.call(this, e, o); fn(e, o); }; };
  const mark = (x, y, w, life, color) => { try { return G.world.add(new KIT.Marker({ x, y, w, life, color: color || '#ff3a2a', style: 'floor', hgt: 20 })); } catch (e) { return null; } };
  const near = (e, r) => G.world.enemies.filter(o => o !== e && !o.dead && !o.isBossPart && Math.abs(o.x - e.x) < r && Math.abs(o.cy - e.cy) < r * 0.6);
  const ring = (x, y, r, col) => { try { G.FX.ring(x, y, 4, r, col, 18); } catch (e) { /* ignore */ } };

  /* ================================================================ 1. new types */
  // the Hollow: a porter who throws stones in an arc
  const porter = C('zindan_prisoner', 'yd_porter', `Hollow porter|Пустой носильщик|Bo'sh hammol`, { hp: 44, biomes: ['yd_tail', 'w_tail_night', 'w_potters', 'yd_tail2'], weight: 5, codexAs: null }, { sat: .2, light: .85, hue: 30 });
  if (porter) EK.volley(porter, { count: 1, spread: 0, speed: 3.2, grav: 0.12, every: [130, 200], range: 220, minRange: 50, windup: 34, color: '#8a7a6a', glow: '#c8b8a0', dmgMul: 0.9, r: 3, sfx: 'throw' });
  // the mob: four or five Hollow who come together and try to surround you
  const mob = C('yd_hollow', 'yd_mob', `Hollow crowd|Толпа Пустых|Bo'shlar to'dasi`, { hp: 40, biomes: ['yd_tail', 'w_tail_night', 'yd_streets'], weight: 3 }, { sat: .2, light: .8, hue: 210 });
  if (mob) {
    // the crowd gathers on its first step (not inside the spawn itself)
    wrapUpd(mob, e => {
      if (e._mobDone) return; e._mobDone = true;
      for (let i = 0; i < 3 + (Math.random() < .5 ? 1 : 0); i++) { const c = G.Enemies.spawn('yd_hollow', e.x + (i % 2 ? 1 : -1) * (14 + i * 9), e.y); if (c) c._mobOf = e; }
    });
    // they flank: the Hollow of a crowd walk to the side of the hero they are not already on
    wrapUpd(ED.yd_hollow, e => {
      if (!e._mobOf || !e.aggro || e.state !== 'chase' || e.t % 40) return;
      const p = pl(); if (!p) return;
      const sides = near(e, 160).filter(o => o._mobOf === e._mobOf || o === e._mobOf).map(o => Math.sign(o.x - p.x));
      if (sides.filter(s => s < 0).length > sides.filter(s => s > 0).length + 1) e.data.flank = 1; else e.data.flank = 0;
      if (e.data.flank && Math.abs(p.x - e.x) < 70) e.vx = 2.2 * Math.sign(p.x - e.x || 1);
    });
  }
  // the Singers: a chorister whose song hits a circle and adds Hollowness
  function songPulse(d, o) {
    wrapUpd(d, e => {
      const p = pl(); if (!e.aggro || !p || p.dead) return;
      const s = e.data.song || (e.data.song = { cd: 120 + Math.random() * 80, w: 0 });
      if (s.w > 0) {
        e.stop && e.stop(.4);
        if (--s.w === 0) {
          ring(e.x, e.cy, o.r, o.col);
          try { G.Audio.sfx('magic', { x: e.x, pitch: .7 }); } catch (x) { /* ignore */ }
          if (Math.abs(p.x - e.x) < o.r && Math.abs(p.cy - e.cy) < o.r * .7 && !(p.invulnT > 0)) { G.Combat.hit(e, p, { dmg: e.dmg * o.k, kbx: 1, kby: -1, dir: Math.sign(p.x - e.x) || 1, type: 'magic' }); if (o.void) addVoid(o.void, `a Singer's note|нота Певца|xonanda notasi`); }
        }
        return true;
      }
      if (--s.cd <= 0 && Math.abs(p.x - e.x) < o.r * 1.6 && !(e.teleT > 0)) { s.w = o.windup; s.cd = o.every[0] + Math.random() * (o.every[1] - o.every[0]); e.telegraph(o.windup); mark(e.x, e.y, o.r * 2, o.windup + 2, o.col); return true; }
    });
  }
  const chor = C('yd_acolyte', 'yd_chorister', `Chorister of the Well|Хорист Колодца|Quduq xorchisi`, { hp: 48, biomes: ['yd_cloister', 'yd_well'], weight: 5 }, { sat: .6, light: 1.1, hue: 220 });
  if (chor) songPulse(chor, { r: 64, col: '#c9b4ff', k: .8, void: 1, windup: 40, every: [200, 280] });
  // the mentor: heals and steadies the others near him
  const mentor = C('frost_shaman', 'yd_mentor', `Mentor of the Singers|Наставник Певцов|Xonandalar ustozi`, { hp: 70, biomes: ['yd_cloister', 'yd_well'], weight: 3 }, { sat: .4, light: 1.15, hue: 40 });
  if (mentor) wrapUpd(mentor, e => {
    if (!e.aggro || e.t % 240 !== 120) return;
    const L = near(e, 150).filter(o => o.hp < o.maxHp);
    for (const o of L) { o.hp = Math.min(o.maxHp, o.hp + o.maxHp * 0.15); try { G.FX.text(o.x, o.top - 8, '+', '#9cf0a0', { size: 8 }); } catch (x) { /* ignore */ } }
    if (L.length) { ring(e.x, e.cy, 60, '#9cf0a0'); try { G.Audio.sfx('heal', { x: e.x }); } catch (x) { /* ignore */ } }
  });
  // the Divan: shield-bearer (blocks in front), net-thrower (slows), captain (always leads)
  const shield = C('guard', 'yd_shieldman', `Divan shield-bearer|Щитоносец Дивана|Devon qalqondori`, { hp: 120, biomes: ['yd_ark', 'w_bazaar_day', 'yd_bazaar'], weight: 4, poise: .7 }, { sat: .5, light: .9, hue: -10 });
  if (shield) wrapInit(shield, e => {
    const m0 = e.modDamageIn;
    e.modDamageIn = function (dmg, hit) {
      let v = m0 ? m0.call(this, dmg, hit) : dmg;
      const p = pl(), front = p && Math.sign(p.x - e.x) === e.facing;
      if (front && hit && !hit.heavy && hit.type !== 'magic' && !(e.st && e.st.stun) && e.state !== 'atk' && !(e.teleT > 0)) { v *= 0.25; if (!e._clang || G.frame - e._clang > 12) { e._clang = G.frame; try { G.Audio.sfx('shield_block', { x: e.x }); G.FX.sparks(e.x + e.facing * 6, e.cy, 5, -e.facing, { color: '#ffe7a6' }); } catch (x) { /* ignore */ } } }
      return v;
    };
  });
  const net = C('guard', 'yd_netman', `Divan net-thrower|Ловчий Дивана с сетью|Devon to'rchisi`, { hp: 80, biomes: ['yd_ark', 'w_bazaar_night', 'yd_streets'], weight: 3 }, { sat: .3, light: .95, hue: 60 });
  if (net) EK.volley(net, { count: 1, spread: 0, speed: 3, grav: 0.05, every: [200, 280], range: 200, minRange: 30, windup: 30, color: '#c8b890', glow: '#e8d8a8', dmgMul: 0.3, r: 5, status: { slow: { t: 150 } }, sfx: 'throw' });
  const captain = C('yd_divan_merc', 'yd_captain', `Divan captain|Капитан Дивана|Devon sardori`, { hp: 150, biomes: ['yd_ark', 'yd_streets'], weight: 1.5 }, { sat: .7, light: 1.05, hue: 15 });
  if (captain) wrapInit(captain, e => { e._mods = ['leader']; });
  // smugglers and thieves: oil-thrower, fence (runs away with what he took), mask (fast daggers)
  const oil = C('assassin', 'yd_oilthrower', `Oil-thrower|Метатель масла|Moy otuvchi`, { hp: 46, biomes: ['w_bazaar_night', 'yd_karez', 'yd_bazaar'], weight: 3 }, { sat: .5, light: .8, hue: 25 });
  if (oil) {
    EK.volley(oil, { count: 1, spread: 0, speed: 2.8, grav: 0.1, every: [180, 260], range: 230, minRange: 50, windup: 32, color: '#d89a2a', glow: '#ffb060', dmgMul: 0.5, r: 3, sfx: 'throw' });
    // the jar breaks where it lands and the oil burns
    wrapInit(oil, e => { const sh = e.shoot.bind(e); e.shoot = o => { const pr = sh(Object.assign({}, o, { onDie: q => { try { EK.pool(e, q.x, q.y, { kind: 'fire', w: 26, life: 140 }); } catch (x) { /* ignore */ } } })); return pr; }; });
  }
  const fence = C('yd_scavenger', 'yd_fence', `Fence|Скупщик краденого|O'g'irlik xaridori`, { hp: 50, biomes: ['w_bazaar_night', 'yd_karez', 'w_tail_day'], weight: 2, gold: [6, 14] }, { sat: .6, light: 1.0, hue: 90 });
  if (fence) wrapUpd(fence, e => {
    const p = pl(); if (!p || !e.aggro) return;
    // he does not fight: he runs from you, and if he gets far enough away he is gone with the goods
    const d = p.x - e.x;
    if (Math.abs(d) < 220) { e.walk(-Math.sign(d) || 1, e.speed * 1.6); e.facing = -Math.sign(d) || 1; e._fenceT = 0; }
    else if ((e._fenceT = (e._fenceT || 0) + 1) > 240) { e.dead = true; e.remove = true; try { G.FX.text(e.x, e.top - 8, t(`gone|ушёл|ketdi`), '#c8b8a0', { size: 7 }); } catch (x) { /* ignore */ } }
    return true;
  });
  const mask = C('assassin', 'yd_mask', `Mask of Those Who Remember|Маска Помнящих|Eslovchilar niqobi`, { hp: 52, biomes: ['yd_old', 'yd_streets', 'w_tail_night'], weight: 3 }, { sat: .3, light: .55, hue: 250 });
  if (mask) EK.haste(mask, 1.35);
  const burner = C('frost_shaman', 'yd_burner', `Burner of Those Who Remember|Сжигатель Помнящих|Eslovchilar kuydiruvchisi`, { hp: 60, biomes: ['yd_old', 'yd_heart'], weight: 2 }, { sat: .7, light: .7, hue: 160 });
  if (burner) EK.volley(burner, { count: 3, spread: .18, speed: 3, grav: .01, every: [170, 240], range: 250, windup: 34, color: '#ff8a3a', glow: '#ffb060', dmgMul: .55, status: { burn: { t: 120, dps: 2 } }, sfx: 'fire' });
  // the karez: clay crawler, firefly swarm (the mourners)
  C('yd_leech', 'yd_claycrawler', `Clay crawler|Глиняный ползун|Loy sudralib yuruvchi`, { hp: 60, biomes: ['yd_karez', 'w_potters'], weight: 3, poise: .5 }, { sat: .7, light: .9, hue: 20 });
  const ff = C('jinn', 'yd_fireflies', `Mourning fireflies|Светляки-плакальщики|Yig'ichi yaltiroqqo'ng'izlar`, { hp: 24, biomes: ['yd_karez', 'yd_well'], weight: 3 }, { sat: .9, light: 1.3, hue: 70, scale: .7 });
  if (ff) wrapUpd(ff, e => { if (e._swarmDone) return; e._swarmDone = true; if (e._swarm) return; for (let i = 0; i < 2; i++) { const c = G.Enemies.spawn('yd_fireflies', e.x + (i ? 18 : -18), e.y - 10); if (c) { c._swarm = true; c._swarmDone = true; } } });
  // salt and sand: salt snake (poison), convict (heavy, slow), vulture (flies, dives)
  const ss = C('snake', 'yd_saltsnake', `Salt snake|Соляная змея|Tuz iloni`, { hp: 22, biomes: ['yd_salt', 'yd_streets'], weight: 4 }, { sat: .1, light: 1.5 });
  if (ss) wrapInit(ss, e => { const h0 = e.hitPlayer.bind(e); e.hitPlayer = (b, o) => h0(b, Object.assign({}, o || {}, { status: { poison: { t: 180, dps: 1.6, max: 4 } } })); });
  C('zindan_prisoner', 'yd_convict', `Salt convict|Каторжник соляных копей|Tuz koni mahbusi`, { hp: 90, dmg: 16, biomes: ['yd_salt', 'yd_streets'], weight: 3, poise: .5 }, { sat: .2, light: 1.2, hue: 10, scale: 1.12 });
  C('kempir_crow', 'yd_vulture', `Vulture of the dakhma|Стервятник дахмы|Daxma tasqarasi`, { hp: 40, dmg: 12, biomes: ['yd_salt', 'yd_sand'], weight: 3 }, { sat: .3, light: .8, hue: 15, scale: 1.4 });
  // the Spine: snow-leopard cub, stone guard of the vertebra
  C('sher', 'yd_cub', `Snow-leopard cub|Детёныш снежного барса|Qor qoploni bolasi`, { hp: 60, biomes: ['yd_spine'], weight: 4 }, { sat: .05, light: 1.6, scale: .75 });
  C('balbal_golem', 'yd_vertguard', `Stone guard of the vertebra|Каменный страж позвонка|Umurtqaning tosh soqchisi`, { hp: 170, biomes: ['yd_spine'], weight: 2 }, { sat: .3, light: .9, hue: 190 });
  // the dream: shade of the Year of Sand, nightmare flame
  C('yd_shade', 'yd_sandshade', `Shade of the Year of Sand|Тень Года Песка|Qum yili soyasi`, { hp: 60, biomes: ['yd_sand', 'yd_dream'], weight: 4 }, { sat: .6, light: 1.1, hue: 40 });
  const nf = C('yd_ember', 'yd_nightflame', `Nightmare flame|Пламя кошмара|Dahshat alangasi`, { hp: 54, biomes: ['yd_house', 'yd_dream'], weight: 3 }, { sat: .8, light: .7, hue: 260 });
  if (nf) EK.trailHazard(nf, { kind: 'fire', every: 50, w: 14, life: 100, dmgMul: .25 });

  /* ---------------------------------------------------------------- the bestiary knows them (89l: family, a line, the weak spot) */
  const BX = [
    ['yd_porter', 'hollow', `A Hollow who carried loads all his life and still does: now it's stones, and he throws them at whatever moves.|Пустой, всю жизнь носивший тяжести, носит и теперь: камни. И бросает их во всё, что движется.|Butun umri yuk tashigan bo'sh, hozir ham tashiydi: toshlar. Qimirlagan narsaga otadi.`, `The throw is slow and high. Run under it; up close he has nothing.|Бросок медленный и высокий. Пробегай под ним; вблизи у него ничего нет.|Otishi sekin va baland. Uning ostidan yugurib o't; yaqinda unda hech narsa yo'q.`],
    ['yd_mob', 'hollow', `A crowd of the Hollow, walking together the way they once walked to the bazaar. They close round you without meaning to.|Толпа Пустых: идут вместе, как когда-то ходили на базар. Окружают тебя, сами того не желая.|Bo'shlar to'dasi: bir paytlar bozorga borgandek birga yurishadi. Istamagan holda seni o'rab olishadi.`, `Never stand in the middle. Back to a wall, and take them from one side.|Никогда не стой в середине. Спиной к стене — и бери их с одной стороны.|Hech qachon o'rtada turma. Devorga orqa ber va ularni bir tomondan ol.`],
    ['yd_chorister', 'singers', `A chorister of the Well: a voice trained to take. Its note fills a circle, and what it touches forgets a little.|Хорист Колодца: голос, обученный забирать. Его нота заполняет круг, и всё, чего она касается, немного забывает.|Quduq xorchisi: olishga o'rgatilgan ovoz. Notasi bir doirani to'ldiradi, tekkan narsa ozgina unutadi.`, `The circle is marked on the floor before the note. Step out of it, then strike while it breathes in.|Круг отмечается на полу до ноты. Выйди из него и бей, пока он набирает воздух.|Doira notadan oldin polda belgilanadi. Undan chiq va u nafas olayotganda ur.`],
    ['yd_mentor', 'singers', `A mentor of the Singers. He doesn't fight; he keeps the others standing.|Наставник Певцов. Сам не дерётся — держит на ногах остальных.|Xonandalar ustozi. O'zi urishmaydi — boshqalarni oyoqda ushlab turadi.`, `Kill him first, whatever is in the way.|Убей его первым, что бы ни стояло на пути.|Yo'lda nima bo'lmasin, avval uni o'ldir.`],
    ['yd_shieldman', 'divan', `A Divan shield-bearer. The shield has the Divan's seal on it, and the Divan doesn't like it scratched.|Щитоносец Дивана. На щите печать Дивана, а Диван не любит, когда её царапают.|Devon qalqondori. Qalqonda Devon muhri bor, Devon esa uning tirnalishini yoqtirmaydi.`, `Front blows barely touch him. Heavy strikes, magic, or his back.|Удары спереди его почти не берут. Тяжёлые удары, магия или спина.|Oldidan zarbalar unga deyarli o'tmaydi. Og'ir zarba, sehr yoki orqasi.`],
    ['yd_netman', 'divan', `A Divan net-thrower, sent to bring debtors in alive. He is very good at alive.|Ловчий Дивана: его посылают привести должника живым. Живым он умеет.|Devon to'rchisi: qarzdorni tirik olib kelish uchun yuboriladi. Tirik olib kelishni yaxshi biladi.`, `The net flies slowly. Jump it; then he has nothing in his hands.|Сеть летит медленно. Перепрыгни её — и в руках у него пусто.|To'r sekin uchadi. Ustidan sakra — keyin qo'li bo'sh qoladi.`],
    ['yd_captain', 'divan', `A Divan captain. While he stands, his people fight better than they're paid to.|Капитан Дивана. Пока он стоит, его люди дерутся лучше, чем им платят.|Devon sardori. U tik turar ekan, odamlari maoshidan yaxshiroq urishadi.`, `Take the captain and the rest lose heart.|Возьми капитана — и остальные падут духом.|Sardorni ol — qolganlarning shashti tushadi.`],
    ['yd_oilthrower', 'thieves', `An oil-thrower of the night Bazaar. His jars break where they land and the ground burns.|Метатель масла с ночного Базара. Его кувшины разбиваются там, где падают, и земля горит.|Tungi Bozorning moy otuvchisi. Ko'zalari tushgan joyida sinadi va yer yonadi.`, `Don't fight on the fire. Bring him to clean ground.|Не дерись в огне. Выведи его на чистую землю.|Olovda urishma. Uni toza yerga olib chiq.`],
    ['yd_fence', 'thieves', `A fence: he buys what the thieves cut. He never fights, and he never stops running.|Скупщик краденого: покупает то, что срезали воры. Никогда не дерётся и никогда не перестаёт бежать.|O'g'irlik xaridori: o'g'rilar kesganini sotib oladi. Hech qachon urishmaydi va hech qachon qochishdan to'xtamaydi.`, `Cut off his way, or use something that reaches. If he gets away, so does his purse.|Перекрой ему путь или бей тем, что достаёт издалека. Уйдёт он — уйдёт и кошель.|Yo'lini to's yoki uzoqqa yetadigan narsa bilan ur. U qochsa, hamyoni ham ketadi.`],
    ['yd_mask', 'old', `A Mask of Those Who Remember: quick hands, two daggers, no face anyone could describe.|Маска Помнящих: быстрые руки, два кинжала, лицо, которое никто не сможет описать.|Eslovchilar niqobi: chaqqon qo'llar, ikki xanjar, hech kim ta'riflay olmaydigan yuz.`, `Faster than you. Don't trade blows: parry, then punish.|Быстрее тебя. Не размен ударами: парируй, потом наказывай.|Sendan tez. Zarba almashma: qaytar, keyin jazola.`],
    ['yd_burner', 'old', `A Burner of Those Who Remember. Burns memories, not houses; the fire is the same.|Сжигатель Помнящих. Жжёт воспоминания, а не дома; огонь тот же.|Eslovchilar kuydiruvchisi. Uylarni emas, xotiralarni yoqadi; olov o'sha.`, `Three bolts in a fan. Go through the gap in the middle, toward him.|Три снаряда веером. Иди сквозь щель посередине — к нему.|Yelpig'ichdek uchta o'q. O'rtadagi tirqishdan — unga qarab o't.`],
    ['yd_claycrawler', 'karez', `A clay crawler: wet clay from the karez walls that learned to move by watching the leeches.|Глиняный ползун: мокрая глина со стен кяриза, которая научилась двигаться, глядя на пиявок.|Loy sudralib yuruvchi: korez devorlaridan zuluklarga qarab harakatlanishni o'rgangan ho'l loy.`, `Heavy strikes break it apart. Light ones just stick.|Тяжёлые удары его разбивают. Лёгкие — просто вязнут.|Og'ir zarbalar uni parchalaydi. Yengillari shunchaki yopishib qoladi.`],
    ['yd_fireflies', 'karez', `Mourning fireflies: the karez folk say they are the last lamps of the drowned. They come in threes.|Светляки-плакальщики: в кяризах говорят, это последние лампы утопленников. Летают по трое.|Yig'ichi yaltiroqqo'ng'izlar: korezda aytishlaricha, cho'kkanlarning so'nggi chiroqlari. Uchtadan uchadi.`, `Fragile. One sweep through the swarm finishes most of it.|Хрупкие. Один размашистый удар сквозь рой добивает почти всех.|Mo'rt. To'da orqali bitta keng zarba ko'pini tugatadi.`],
    ['yd_saltsnake', 'salt', `A salt snake, white as the flats. Its bite is poison that tastes like a dry mouth.|Соляная змея, белая, как солончак. Её укус — яд со вкусом пересохшего рта.|Sho'rxokdek oq tuz iloni. Chaqishi — qurigan og'iz ta'midagi zahar.`, `Kill it from above. Carry an antidote.|Бей сверху. Держи при себе противоядие.|Tepadan ur. Yoningda panzahr olib yur.`],
    ['yd_convict', 'salt', `A convict of the salt mines. The chain is long and he has had years to learn how to swing it.|Каторжник соляных копей. Цепь длинная, и у него были годы, чтобы научиться ею махать.|Tuz konlari mahbusi. Zanjir uzun, uni silkitishni o'rganishga yillari bo'lgan.`, `After a swing the chain drags. That is your moment.|После взмаха цепь волочится. Это твой момент.|Silkitgandan keyin zanjir sudraladi. Bu sening paytingdir.`],
    ['yd_vulture', 'salt', `A vulture of the dakhma, bigger than a dog. It has eaten yodchi before.|Стервятник дахмы, крупнее собаки. Ёдчи он уже ел.|Itdan katta daxma tasqarasi. Yodchilarni avval ham yegan.`, `Slings and bows bring it down; on the ground it is clumsy.|Праща и лук сбивают его; на земле он неуклюж.|Sopqon va kamon uni yiqitadi; yerda u qo'pol.`],
    ['yd_cub', 'spine', `A snow-leopard cub, half grown and all teeth. Somewhere near, its mother is listening.|Детёныш снежного барса, наполовину вырос и весь в зубах. Где-то рядом слушает мать.|Qor qoploni bolasi, yarmi o'sgan va tishdan iborat. Yaqin atrofda onasi quloq solyapti.`, `Quick, light, reckless. Let it overshoot, then strike.|Быстрый, лёгкий, безрассудный. Дай ему проскочить мимо — и бей.|Tez, yengil, beparvo. O'tib ketsin, keyin ur.`],
    ['yd_vertguard', 'spine', `A stone guard of the vertebra, carved by the first pilgrims and woken by the Sleeper's turning.|Каменный страж позвонка: вырезан первыми паломниками и разбужен ворочанием Спящего.|Umurtqaning tosh soqchisi: birinchi ziyoratchilar o'ygan, Uxlovchining ag'darilishidan uyg'ongan.`, `Fire and heavy blows crack it; swords only chip.|Огонь и тяжёлые удары его колют; сабли лишь откалывают крошку.|Olov va og'ir zarbalar uni yoradi; qilichlar faqat ushatadi.`],
    ['yd_sandshade', 'dream', `A shade of the Year of Sand: someone who stayed because they had forgotten how to be afraid.|Тень Года Песка: тот, кто остался, потому что забыл, как бояться.|Qum yili soyasi: qo'rqishni unutgani uchun qolgan kimdir.`, `It isn't afraid of you either. Light slows it; lure it to a lamp.|Тебя она тоже не боится. Свет её замедляет — заманивай к лампе.|Sendan ham qo'rqmaydi. Yorug'lik uni sekinlashtiradi — chiroqqa chorla.`],
    ['yd_nightflame', 'dream', `A flame of nightmare. It leaves a burning trail, the way a bad dream leaves a mood.|Пламя кошмара. Оставляет горящий след — как дурной сон оставляет настроение.|Dahshat alangasi. Yomon tush kayfiyat qoldirgandek, yonayotgan iz qoldiradi.`, `Never chase it along its own trail. Wait for it to come to you.|Не гонись за ним по его же следу. Жди, пока придёт к тебе сам.|Uning o'z izi bo'ylab quvma. O'zi kelishini kut.`]
  ];
  if (G.CODEX) for (const b of BX) if (ED[b[0]]) G.CODEX.addBeast(b);

  /* ================================================================ 2. elite modifiers */
  const MODS = G.ELITE_MODS = {
    burning: { name: `Burning|Горящий|Yonuvchi`, col: '#ff8a3a' },
    shadow: { name: `Shadow|Теневой|Soyaviy`, col: '#9a8ab8' },
    shielded: { name: `Shielded|Щитоносный|Qalqonli`, col: '#9fe4ff' },
    leader: { name: `Leader|Вожак|Boshchi`, col: '#ffd76a' },
    hollow: { name: `Hollow|Пустой|Bo'sh`, col: '#c9b4ff' },
    vengeful: { name: `Vengeful|Мстительный|Qasoskor`, col: '#ff5a3a' },
    possessed: { name: `Possessed|Вселённый|Jin urgan`, col: '#8ff6ef' }
  };
  const MKEYS = Object.keys(MODS);
  // NG+ (Stage 10) may add new ones; the count grows with the act
  function rollMods(e) {
    const n = (G.run && (G.run.ngPlus || 0) > 0) ? 2 : (R().act || 1) >= 2 && Math.random() < .5 ? 2 : 1;
    const out = [];
    while (out.length < n) { const k = MKEYS[Math.floor(Math.random() * MKEYS.length)]; if (!out.includes(k)) out.push(k); }
    return out;
  }
  {
    const sp0 = G.Enemies.spawn;
    G.Enemies.spawn = function (id, x, y, o) {
      const e = sp0.apply(this, arguments);
      try { if (e && e.elite && !e.isBoss && !e.def.miniboss && !(o && o.noMods)) { e._mods = (e._mods || []).concat(rollMods(e).filter(k => !(e._mods || []).includes(k))); } if (e && e._mods && e._mods.length) setupMods(e); } catch (x) { console.error('[8b] mods', x); }
      return e;
    };
  }
  function setupMods(e) {
    if (e._modsSet) return; e._modsSet = true;
    const has = k => e._mods.includes(k);
    if (has('shielded')) { e._shield = e.maxHp * 0.3; e._shieldMax = e._shield; e._shieldT = 0; }
    const m0 = e.modDamageIn;
    e.modDamageIn = function (dmg, hit) {
      let v = m0 ? m0.call(this, dmg, hit) : dmg;
      if (has('shielded') && e._shield > 0) { const a = Math.min(e._shield, v * 0.85); e._shield -= a; v -= a; e._shieldT = 0; if (e._shield <= 0) { try { G.FX.sparks(e.x, e.cy, 10, 1, { color: '#9fe4ff' }); G.Audio.sfx('break', { x: e.x }); } catch (x) { /* ignore */ } } }
      if (e._ledBy && !e._ledBy.dead) v *= 0.85;
      return v;
    };
    const h0 = e.hitPlayer.bind(e);
    e.hitPlayer = (b, o) => {
      const r = h0(b, o);
      if (r) {
        const p = pl();
        if (has('burning') && p) { try { EK.pool(e, p.x, p.y, { kind: 'fire', w: 22, life: 110 }); } catch (x) { /* ignore */ } }
        if (has('hollow') && (!e._hollowT || G.frame - e._hollowT > 120)) { e._hollowT = G.frame; addVoid(1, `a Hollow elite's touch|касание пустой элиты|bo'sh elitaning tegishi`); }
      }
      return r;
    };
  }
  // per-frame: shield regrows after 4 s untouched; shadow steps behind you; the leader steadies his people;
  // the possessed copies your techniques
  {
    const u0 = G.Enemy.prototype.update;
    G.Enemy.prototype.update = function () {
      u0.apply(this, arguments);
      const e = this;
      if (!e._mods || e.dead) return;
      const p = pl();
      if (e._shieldMax) { if (++e._shieldT > 240 && e._shield < e._shieldMax) e._shield = Math.min(e._shieldMax, e._shield + e._shieldMax / 60); }
      if (e._mods.includes('shadow') && e.aggro && p && !p.dead) {
        e._shT = (e._shT || 300) - 1;
        if (e._shT <= 0 && Math.abs(p.x - e.x) < 240 && !(e.teleT > 0)) {
          e._shT = 360 + Math.random() * 180;
          const nx = p.x - (p.facing || 1) * 34;
          if (G.level && !G.level.solidPx(nx, e.y - 6) && G.level.groundBelow(nx, e.y - 20, 60) !== null) {
            try { G.FX.burst(e.x, e.cy, 12, { color: '#4a3a5a', speed: 1.5, life: 26, size: 2 }); } catch (x) { /* ignore */ }
            e.x = nx; e.facing = Math.sign(p.x - nx) || 1; e.vx = 0; e.atkCD = Math.max(e.atkCD, 30);
            try { G.FX.burst(e.x, e.cy, 12, { color: '#4a3a5a', speed: 1.5, life: 26, size: 2 }); G.Audio.sfx('whoosh', { x: e.x }); } catch (x) { /* ignore */ }
          }
        }
      }
      if (e._mods.includes('leader') && e.t % 30 === 0) {
        for (const o of near(e, 170)) { if (o._dmg0 == null) o._dmg0 = o.dmg; o._ledBy = e; o.dmg = o._dmg0 * 1.2; }
      }
    };
    // when a leader falls, his people lose the edge
    G.Events.on('kill', d => { try { if (d && d._mods && d._mods.includes('leader')) for (const o of G.world.enemies) if (o._ledBy === d && o._dmg0 != null) { o.dmg = o._dmg0; o._ledBy = null; } } catch (x) { /* ignore */ } });
  }
  // vengeful: bursts a moment after death (marked on the floor)
  G.Events.on('kill', e => {
    try {
      if (!e || !e._mods || !e._mods.includes('vengeful') || !G.world) return;
      const x = e.x, y = e.y, dmg = e.dmg * 1.1;
      mark(x, y, 70, 46, '#ff5a3a');
      let tk = 0;
      const tick = () => {
        if (++tk < 46) return false;
        try { G.FX.explosion(x, y - 10, { size: 's', pal: 'fire' }); } catch (x2) { ring(x, y - 10, 40, '#ff8a3a'); }
        const p = pl(); if (p && !p.dead && Math.abs(p.x - x) < 36 && Math.abs(p.cy - (y - 10)) < 30) G.Combat.hit({ x, y, faction: 'enemy', dmg }, p, { dmg, kbx: 4, kby: -3, dir: Math.sign(p.x - x) || 1, type: 'magic' });
        return true;
      };
      VTICK.push(tick);
    } catch (x) { console.error('[8b] vengeful', x); }
  });
  const VTICK = [];
  if (typeof TICK_STAGE !== 'undefined') TICK_STAGE.push(() => { for (let i = VTICK.length - 1; i >= 0; i--) if (VTICK[i]()) VTICK.splice(i, 1); });
  // possessed: echoes the technique you just used, as a bolt of borrowed light
  {
    const em0 = G.Perks.emit;
    G.Perks.emit = function (ev) {
      const r = em0.apply(this, arguments);
      if (ev === 'onSkill') try {
        const p = pl(); if (!p) return r;
        for (const e of G.world.enemies) if (!e.dead && e._mods && e._mods.includes('possessed') && Math.abs(e.x - p.x) < 260) {
          setTimeout(() => { if (e.dead) return; e.telegraph(18); setTimeout(() => { if (e.dead || !pl()) return; const a = Math.atan2(pl().cy - e.cy, pl().x - e.x); e.shoot({ x: e.x, y: e.cy, vx: Math.cos(a) * 3.6, vy: Math.sin(a) * 3.6, r: 3, dmg: e.dmg * .8, color: '#8ff6ef', light: { r: 30, color: '#8ff6ef', a: .5 }, trail: { color: '#8ff6ef', life: 10, size: 1, every: 2 } }); try { G.FX.text(e.x, e.top - 10, t(`your move|твой приём|sening usuling`), '#8ff6ef', { size: 6 }); } catch (x) { /* ignore */ } }, 300); }, 250);
        }
      } catch (x) { /* ignore */ }
      return r;
    };
  }
  // the modifiers' names over the elite, and the shield
  {
    const fx0 = G.Enemy.prototype.drawFx;
    G.Enemy.prototype.drawFx = function (ctx) {
      fx0.apply(this, arguments);
      const e = this; if (!e._mods || e.dead) return;
      const p = pl(); if (!p || Math.abs(p.x - e.x) > 200) return;
      try {
        const y = Math.round(e.top - 16 * (e.scale || 1));
        ctx.font = '5px ' + (G.FONT_UI || 'sans-serif'); ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
        const s = e._mods.map(k => t(MODS[k].name)).join(' · ');
        ctx.fillStyle = 'rgba(0,0,0,.7)'; ctx.fillText(s, Math.round(e.x) + .5, y + .5);
        ctx.fillStyle = MODS[e._mods[0]].col; ctx.fillText(s, Math.round(e.x), y);
        ctx.textAlign = 'left';
        if (e._shield > 0) { ctx.globalAlpha = .25 + .2 * (e._shield / e._shieldMax); ctx.strokeStyle = '#9fe4ff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(e.x, e.cy, e.w * .9 + 4, e.h * .6 + 4, 0, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
        if (e._mods.includes('burning')) G.Glow.add(e.x, e.cy, 20, '#ff8a3a', .3);
        if (e._mods.includes('possessed')) G.Glow.add(e.x, e.top, 14, '#8ff6ef', .35);
      } catch (x) { /* ignore */ }
    };
  }

  /* ================================================================ 3. group behaviour: attack tokens */
  const NEUTRAL = new Set(['idle', 'chase', 'recover', 'hover', 'circle', 'float', 'patrol', 'walk', 'roam', 'wander', 'flee', 'retreat']);
  const attacking = e => e.teleT > 0 || !NEUTRAL.has(e.state);
  let tokF = -1, tokN = 0;
  const limit = () => { const d = (G.run && G.run.diffLevel) || 'normal'; return d === 'easy' ? 1 : d === 'hard' || d === 'oath' ? 3 : 2; };
  {
    const u0 = G.Enemy.prototype.update;
    G.Enemy.prototype.update = function () {
      const e = this;
      if (!e.isBoss && !e.dead && e.aggro && !e.def.boss && G.world) {
        if (tokF !== G.frame) { tokF = G.frame; tokN = 0; const p = pl(); for (const o of G.world.enemies) if (!o.dead && !o.isBoss && !o.isBossPart && o.aggro && attacking(o) && p && Math.abs(o.x - p.x) < 200) tokN++; }
        const p = pl();
        if (!attacking(e) && e.atkCD <= 1 && tokN >= limit() && p && Math.abs(e.x - p.x) < 200) e.atkCD = 8 + Math.floor(Math.random() * 10);
      }
      return u0.apply(this, arguments);
    };
  }
  // the Divan and Those Who Remember fight each other when they meet (GDD ch. 16)
  const DIVAN = /^(guard|yd_divan_archer|yd_gilded|yd_divan_merc|yd_shieldman|yd_netman|yd_captain)$/, REMEMBER = /^(yd_mask|yd_burner)$/;
  {
    let ft = 0;
    if (typeof TICK_STAGE !== 'undefined') TICK_STAGE.push(() => {
      if (++ft % 30 || !G.world) return;
      const L = G.world.enemies.filter(e => !e.dead && !e.isBossPart);
      for (const a of L) if (DIVAN.test(a.def.id)) for (const b of L) if (REMEMBER.test(b.def.id) && Math.abs(a.x - b.x) < 60 && Math.abs(a.cy - b.cy) < 30) {
        G.Combat.hit(a, b, { dmg: a.dmg * .6, kbx: 2, kby: -1, dir: Math.sign(b.x - a.x) || 1, type: 'melee' });
        G.Combat.hit(b, a, { dmg: b.dmg * .6, kbx: 2, kby: -1, dir: Math.sign(a.x - b.x) || 1, type: 'melee' });
      }
    });
  }
}

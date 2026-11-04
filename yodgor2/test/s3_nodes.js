// Stage 3: every one of the 36 yodchi nodes changes behaviour. For each node a probe measures something
// with the node unlearned and learned (maximum rank); the two must differ in the expected direction.
//   node test/s3_nodes.js
const L = require('./s3_lib');
(async () => {
  const b = await L.chromium.launch();
  const p = await L.open(b, '?stage=3&god');
  p.setDefaultTimeout(300000);
  await L.tick(p, 40);
  for (let i = 0; i < 40 && (await L.modal(p)); i++) { await L.press(p, 'Escape'); await L.press(p, 'Enter'); await L.tick(p, 10); }
  await p.evaluate(() => {
    G.CH.addXp(200000);
    const W = window.__S3 = {};
    W.pl = () => G.world.player;
    W.foe = () => { let e = G.world.enemies.find(x => !x.dead && !x.isBoss && !x.isBossPart); if (!e) e = G.Enemies.spawn(Object.keys(G.Enemies.defs).find(k => !G.Enemies.defs[k].boss), W.pl().x + 30, W.pl().y); e.maxHp = e.hp = 1e6; e.invulnT = 0; e.st = { burn: null, poison: null, bleed: null, stun: null, freeze: null, slow: null }; e._bu = null; e._fearT = 0; e._forgetT = 0; e._debt = 0; e.dead = false; e.x = W.pl().x + 20; e.y = W.pl().y; e.facing = -1; return e; };
    W.equip = (id, slot) => { const s = G.CH.S(); let e = s.inv.find(x => x.id === id); if (!e) e = G.CH.give(id, { quiet: true }); G.YITEMS.equip(e.u, slot); return G.run.slots[slot] || e; };
    W.reset = () => { G.CH.S().sk = {}; G.CH.dirty(); G.PROG.applyFlasks(); };
    W.set = (id, r) => { W.reset(); for (let i = 0; i < r; i++) G.PROG.buyY(id, true); G.CH.dirty(); };
    W.act = (item, ws) => { W.pl().act = { item, ws: Object.assign({ heavyMode: false, swings: 1 }, ws || {}), kind: G.ItemKinds.ydm, action: 'attack' }; };
    W.dmgOut = (info, tg) => G.Perks.mod('dmgOut', 100, info, tg || {});
  });
  const probes = {
    c_hand: `(()=>{const it=W.equip('yd_caravan_klych','attack');W.act(it);const v=W.dmgOut({item:it,type:'melee'});W.pl().act=null;return v;})()`,
    c_knock: `G.Perks.mod('poiseOut',1,{charged:true,item:G.run.slots.attack},{})`,
    c_eye: `(()=>{const it=W.equip('sadak','secondary');return W.dmgOut({item:it,type:'ranged'})*G.Perks.mod('rangedSpeed',1);})()`,
    c_count: `(()=>{const it=W.equip('yd_caravan_klych','attack');W.act(it,{swings:4});const v=W.dmgOut({item:it,type:'melee'});W.pl().act=null;return v;})()`,
    c_blood: `G.Perks.mod('bleedDur',1)*G.Perks.mod('bleedBuild',10,{})`,
    c_intercept: `(()=>{const e=W.foe();G.Perks.emit('onParry',{src:e});return e.st.stun?e.st.stun.t:0;})()`,
    c_execute: `(()=>{const e=W.foe();e.addStatus('stun',{t:60});return W.dmgOut({item:G.run.slots.attack,type:'melee'},e);})()`,
    c_twin: `(()=>{W.equip('kanjar','attack');W.equip('yd_wax_knife','secondary');return G.Perks.mod('swingSpeed',1,G.run.slots.attack);})()`,
    c_volley: `(()=>{const it=W.equip('sopak','attack');const p=W.pl();const n0=G.world.ents.length;p.act=null;p.startItem('attack',it);for(let i=0;i<40;i++)p.act&&p.act.kind.update(p,p.act.item,p.act.ws);const n=G.world.ents.slice(n0).filter(e=>e instanceof G.Projectile&&e.owner===p).length;p.act=null;return n;})()`,
    c_debt: `(()=>{const e=W.foe();W.dmgOut({item:G.run.slots.attack,type:'melee'},e);return W.dmgOut({item:G.run.slots.attack,type:'melee'},e);})()`,
    c_nothing: `(()=>{const sk=G.run.slots.skill1||W.equip('ys_spark','skill1');const s=G.run.slots.skill1;if(!s)return -1;s.cd=500;G.Perks.emit('onKill',W.foe(),{});return -s.cd;})()`,
    c_last: `G.YITEMS.count('ys_lastknock')`,
    b_route: `G.CH.maxStam()`,
    b_roll: `G.CH.rollStats().rollI`,
    b_chapan: `-G.Perks.mod('dmgIn',1,{dmg:10,type:'melee'})`,
    b_breath: `(()=>{G.PROG.tmp.breathUsed=false;const p=W.pl();p.hp=Math.round(p.maxHp*0.2);const h=p.hp;G.Perks.emit('onHurt',{},1);const d=p.hp-h;p.hp=p.maxHp;return d;})()`,
    b_block: `-G.Perks.mod('blockCost',1)`,
    b_salt: `(()=>{const p=W.pl();p.st.slow=null;p.addStatus('slow',{t:60});const v=p.st.slow?1:0;p.st.slow=null;return -v;})()`,
    b_streets: `-G.Perks.mod('sightMul',1)`,
    b_herbs: `G.run.maxFlasks*10+G.Perks.mod('heal',1)`,
    b_traps: `G.YITEMS.count('ys_traps')`,
    b_spine: `(()=>{G.godMode=false;const p=W.pl();p.invulnT=0;p.act=null;p.setState('normal');G.CH.st.v=G.CH.maxStam();const r0=Math.random;Math.random=()=>0.99;p.hp=p.maxHp;p.takeHit({dmg:1,dir:1,kbx:3,kby:-2,src:W.foe()});Math.random=r0;const s=p.state;p.setState('normal');p.invulnT=0;p.hp=p.maxHp;G.godMode=true;return s==='hurt'?0:1;})()`,
    b_command: `W.dmgOut({src:{faction:'player',isActor:true},item:null})`,
    b_forty: `(()=>{G.godMode=false;G.PROG.tmp.fortyUsed=false;G.PROG.tmp.pullUsed=true;const p=W.pl();p.invulnT=0;p.hp=10;p.setState('normal');p.takeHit({dmg:9999,dir:1,src:W.foe(),noFlinch:true});const alive=!p.dead&&p.hp>0;p.dead=false;p.hp=p.maxHp;p.invulnT=0;p.setState('normal');G.PROG.tmp.fortyUntil=-1;G.godMode=true;return alive?1:0;})()`,
    s_spark: `(()=>{const e=W.foe();const s=G.CH.S().inv.find(x=>x.id==='ys_spark');if(!s)return 0;G.YITEMS.equip(s.u,'skill1');const it=G.run.slots.skill1;const p=W.pl();p.facing=1;e.x=p.x+30;e.y=p.y;const h=e.hp;it.def.use(p,it,{});return h-e.hp;})()`,
    s_whisper: `(()=>{const e=W.foe();const s=G.CH.S().inv.find(x=>x.id==='ys_whisper');if(!s)return 0;G.YITEMS.equip(s.u,'skill1');const it=G.run.slots.skill1;it.def.use(W.pl(),it,{});return e._fearT||0;})()`,
    s_wax: `(()=>{const s=G.CH.S().inv.find(x=>x.id==='ys_waxshield');if(!s)return 0;G.YITEMS.equip(s.u,'skill1');const it=G.run.slots.skill1;it.def.use(W.pl(),it,{});return G.PROG.ward.left;})()`,
    s_forget: `(()=>{const e=W.foe();const p=W.pl();p.facing=1;e.x=p.x+30;const s=G.CH.S().inv.find(x=>x.id==='ys_oblivion');if(!s)return 0;G.YITEMS.equip(s.u,'skill1');const it=G.run.slots.skill1;it.def.use(p,it,{});return e._forgetT||0;})()`,
    s_dutar: `(()=>{const it=W.equip('yd_tail_dutar','attack');return W.dmgOut({item:it,type:'melee'})+G.Perks.mod('soundRing',0)*1000;})()`,
    s_alien: `G.YITEMS.count('ys_drink')`,
    s_cheap: `-G.CH.voidMagicMul()`,
    s_fire: `(()=>{G.CH.give('tu_memory',{n:2,quiet:true});const s=G.CH.S().inv.find(x=>x.id==='ys_tumarfire');if(!s)return 0;G.YITEMS.equip(s.u,'skill1');const it=G.run.slots.skill1;const n=G.YITEMS.count('tu_memory')+G.YITEMS.count('tu_blank');it.def.use(W.pl(),it,{});return n-(G.YITEMS.count('tu_memory')+G.YITEMS.count('tu_blank'));})()`,
    s_echo: `G.Perks.mod('echo',0)`,
    s_well: `(()=>{const e=W.foe();const p=W.pl();e.x=p.x+120;const x0=e.x;const s=G.CH.S().inv.find(x=>x.id==='ys_wellvoice');if(!s)return 0;G.YITEMS.equip(s.u,'skill1');const it=G.run.slots.skill1;it.def.use(p,it,{});return x0-e.x;})()`,
    s_reson: `(()=>{G.YODGOR.set({void:60});const v=W.dmgOut({magic:true,type:'magic'});G.YODGOR.set({void:0});return v;})()`,
    s_song: `(()=>{G.YODGOR.set({void:0});const s=G.CH.S().inv.find(x=>x.id==='ys_forbidden');if(!s)return 0;G.YITEMS.equip(s.u,'skill2');const it=G.run.slots.skill2;it.def.use(W.pl(),it,{});const v=G.YODGOR.run.void;G.YODGOR.set({void:0});return v;})()`
  };
  const R = {}, bad = [];
  const nodes = await p.evaluate(() => G.PROG.Y.map(n => [n.id, n.max]));
  for (const [id, max] of nodes) {
    const code = probes[id];
    if (!code) { R[id] = 'NO PROBE'; bad.push(id); continue; }
    const r = await p.evaluate(([id, max, code]) => {
      const W = window.__S3;
      try {
        W.reset(); const before = eval(code);
        W.set(id, max); const after = eval(code);
        W.reset();
        return { before: +(+before).toFixed(3), after: +(+after).toFixed(3) };
      } catch (e) { return { err: String(e && e.stack || e).slice(0, 300) }; }
    }, [id, max, code]);
    const okk = !r.err && r.after > r.before;
    R[id] = (okk ? 'ok ' : 'FAIL ') + JSON.stringify(r);
    if (!okk) bad.push(id);
    await L.tick(p, 2);
  }
  R.errs = p._errs;
  console.log(JSON.stringify(R, null, 1));
  console.log(bad.length ? 'FAILED: ' + bad.join(', ') : 'ALL 36 NODES CHANGE BEHAVIOUR');
  await b.close();
  process.exit(bad.length ? 1 : 0);
})();

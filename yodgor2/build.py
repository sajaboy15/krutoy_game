"""Builds Yodgor v2 on the Kyok Bori engine.

  dist/page.html        — body content, published as the artifact
  dist/standalone.html  — full page for the exe and for tests

Engine changes are exact string replacements (each must match the stated number of
times). Everything else lives in the game layer:
  src/i18n.js        loaded before the engine (window.__T text hook, languages)
  src/people.js      NPC figures
  src/layer/*.js     the game layer, concatenated in name order into one scope
"""
import hashlib
import os
import importlib.util
import pathlib
import re
import sys

root = pathlib.Path(__file__).resolve().parent
src_html = (root.parent / 'kyok' / 'index.html').read_text(encoding='utf-8')


def load_patch(path):
    spec = importlib.util.spec_from_file_location(path.stem, path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.REPLACEMENTS


PATCH_DIR = root / 'patches'
HEAD = load_patch(PATCH_DIR / 'head.py')
EXTRA = []
for p in sorted(PATCH_DIR.glob('[0-9]*.py')):  # numbered engine patches (enemies, biomes, audio...)
    EXTRA += load_patch(p)

G = 'window.G'
OWN = [
    # ---- page ----
    ('<title>Кёк Бёри</title>', '<title>Yodgor</title>', 1),
    ('aria-label="Кёк Бёри — игровое поле"', 'aria-label="Yodgor"', 1),
    # ---- text hook: every engine text goes through window.__T at draw time ----
    ('function W(t,e=8){const a=(t=String(t))+"|"+e;', 'function W(t,e=8){const a=(t=__T(String(t)))+"|"+e;', 1),
    ('function E(e,a,o,s,n={}){if(!(a=String(a)))return 0;', 'function E(e,a,o,s,n={}){if(!(a=__T(String(a))))return 0;', 1),
    ('function K(t,e,a,o,s={}){const n=Y(e=String(e));', 'function K(t,e,a,o,s={}){const n=Y(e=__T(String(e)));', 1),
    ('function J(t,e,a=7,o){const s=t+"|"+e+"|"+a+"|"+o;', 'function J(t,e,a=7,o){t=__T(t);const s=t+"|"+e+"|"+a+"|"+o;', 1),
    ('function Z(t,e,a,o,s={}){if(I||!e||L)return;', 'function Z(t,e,a,o,s={}){if(I||!e||L)return;e=__T(e);', 1),
    ('function et(t,e,a,o,s={}){e=String(e);', 'function et(t,e,a,o,s={}){e=__T(String(e));', 1),
    ('function Q(t,e=7,a){const o=t+"|"+e+"|"+a;', 'function Q(t,e=7,a){t=__T(t);const o=t+"|"+e+"|"+a;', 1),
    ('function It(e,o,s,n,i,r,l="center"){if(!I||!G)return W(o,i);', 'function It(e,o,s,n,i,r,l="center"){o=__T(o);if(!I||!G)return W(o,i);', 1),
    ('a.fillText("Кут летит дальше…",', 'a.fillText(__T("Дорога ведёт дальше…"),', 1),
    ('e.fillText("Кут угас... [J] заново",', 'e.fillText(__T("Ты пал... [J] заново"),', 1),
    # the layer may draw with the engine's own text and panel helpers
    ('_debug:()=>({modal:se,', '_fx:{E:E,Z:Z,J:J,tt:tt,W:W,et:et,lt:lt,ft:ft,pt:pt,st:st,nt:nt,c:c,Pt:Pt,pixel:()=>I},_debug:()=>({modal:se,', 1),
    ('draw(t,e){I=!1,Ye(t,e),I=!0}', 'draw(t,e){I=!1,Ye(t,e);try{window.G.UI_SMOOTH&&window.G.UI_SMOOTH(t,e)}catch(x){console.error(x)}I=!0}', 1),
    # ---- epilogue: a moving window so long epilogues fit the screen ----
    ('else{let t=0;for(const e of o)t+=10.2*J(e,348,7.4).length+5;e.globalAlpha=.92*d,lt(e,50,50,380,u(t+18),"panel",{fill:"#1c1420"}),e.globalAlpha=d;let i=60;for(let t=0;t<We.shown;t++){',
     'else{let k=Math.max(0,We.shown-1),hh=10.2*J(o[k]||"",348,7.4).length+5;for(;k>0;){const q=10.2*J(o[k-1],348,7.4).length+5;if(hh+q>176)break;hh+=q,k--}let t=0;for(let z=k;z<Math.max(We.shown,1)&&z<o.length;z++)t+=10.2*J(o[z],348,7.4).length+5;e.globalAlpha=.92*d,lt(e,50,50,380,u(t+18),"panel",{fill:"#1c1420"}),e.globalAlpha=d;let i=60;for(let t=k;t<We.shown;t++){', 1),
    # ---- pause: save into a slot ----
    # pause: skills ("Прокачка"), equipment ("Снаряжение", stage 3: 68_inventory_ui.js), save
    ('const Me=[{label:"Продолжить"},{label:"Управление"},{label:"Настройки"},{label:"Покинуть поход"}]', 'const Me=[{label:"Продолжить"},{label:"Управление"},{label:"Настройки"},{label:"Прокачка"},{label:"Снаряжение"},{label:"Сохранить"},{label:"Покинуть поход"}]', 1),
    ('ve={x:14,y:44,w:156,h:128,my:92}', 've={x:14,y:44,w:156,h:164,my:86}', 1),
    ('2===e.sel?(e.sub="settings",e.set={sel:0}):(e.sub="confirm",e.csel=0))', '2===e.sel?(e.sub="settings",e.set={sel:0}):3===e.sel?(e.closing=!0,e.closeT=0,window.G.TREE_OPEN&&setTimeout(window.G.TREE_OPEN,200)):4===e.sel?(e.closing=!0,e.closeT=0,window.G.INV_OPEN&&setTimeout(window.G.INV_OPEN,200)):5===e.sel?(e.closing=!0,e.closeT=0,window.G.SAVE_MENU&&window.G.SAVE_MENU()):(e.sub="confirm",e.csel=0))', 1),
    # ---- balance: soft stat scaling for health (damage is rescaled in the layer) ----
    # HUD micro font: full Latin + Cyrillic glyphs from src/pixfont.js
    ('const j={0:["111","101","101","101","111"],1:["110"', 'const j=window.YODGOR_MICRO||{0:["111","101","101","101","111"],1:["110"', 1),
    ('this.maxHp=Math.round((100+22*a.stats.green+10*(a.stats.red+a.stats.purple))*', 'this.maxHp=Math.round((window.G.MAXHP?window.G.MAXHP(a.stats):100+22*a.stats.green+10*(a.stats.red+a.stats.purple))*', 1),
    # stage 3: the stat-diamond row becomes the stamina bar and the level pip (G.HUD_STATS, 66_character.js)
    ('["red","purple","green"].forEach(((t,a)=>{const s=8+20*a,n=Se.statPop[t]||0;st(e,nt.dia5(n>0&&n>>2&1?"#ffffff":m(t)),s,33-(n>30?1:0)),K(e,String(o.stats[t]||0),s+9,34,{color:n>0?c.goldP:c.cream})}))',
     '(' + G + '.HUD_STATS?' + G + '.HUD_STATS(e,o,a,b):["red","purple","green"].forEach(((t,a)=>{const s=8+20*a,n=Se.statPop[t]||0;st(e,nt.dia5(n>0&&n>>2&1?"#ffffff":m(t)),s,33-(n>30?1:0)),K(e,String(o.stats[t]||0),s+9,34,{color:n>0?c.goldP:c.cream})})))', 1),
    ('"+15% урона красного оружия"', '"+6% урона красного оружия"', 1),
    ('"+15% урона фиолетового оружия"', '"+6% урона фиолетового оружия"', 1),
    ('"+15% урона зелёного оружия"', '"+6% урона зелёного оружия"', 1),
    # ---- Russian source strings: the world of Yodgor ----
    ('"КЁК БЁРІ"', '"ЁДГОР"', 1),
    ('"ПЕПЕЛ ШЁЛКОВОГО ПУТИ"', '"ГОРОД НА СПЯЩЕМ ДЭВЕ"', 2),
    ('"КУТ УГАС"', '"ТЫ ПАЛ"', 1),
    ('"Кут угас."', '"Ты пал."', 1),
    ('"Кут не угас!"', '"Ещё не время!"', 1),
    ('"Говорить с аксакалом"', '"Говорить с Рустамом-ака"', 1),
    ('"Благословение баксы"', '"Песня бахши"', 2),
    ('"Пока нет. Найди баксы в чайхане."', '"Пока нет. Найди бахши в чайхане."', 1),
    ('"Благословения"', '"Песни"', 1),
    ('prompt:"Прочесть"', 'prompt:"Коснуться памяти"', 1),
    ('speaker:"Балбал-камень"', 'speaker:"Камень памяти"', 1),
    ('"Испить кумыс"', '"Выпить воды"', 1),
    ('"Нет кумыса"', '"Воды не осталось"', 1),
    ('"Испить чаю (кумыс и здоровье)"', '"Выпить чаю (вода и здоровье)"', 1),
    ('"Силы восстановлены. Фляги наполнены кумысом."', '"Силы восстановлены. Фляги наполнены водой."', 1),
    ('"Возродиться здесь"', '"Встать снова"', 1),
    ('"Спасибо, что прошли путь кута до конца."', '"Спасибо, что прошли путь ёдчи до конца."', 1),
    ('"Весь прогресс этого похода будет потерян."', '"Продолжить можно будет с начала этой земли."', 1),
    ('jump:"ПРОБЕЛ"', 'jump:"SPACE"', 1),
    ('"↓ + ПРОБЕЛ"', '"↓ + SPACE"', 2),
    ('"kokbori_settings_v1"', '"yodgor2_settings_v1"', 1),
    ('It(e,"СОЛНЦЕ ВЕРНУЛОСЬ",', 'It(e,' + G + '.ENDING_TITLE||"СОН ОКОНЧЕН",', 1),
    # ---- main menu: continue, language ----
    ('Jt=[{label:"Новый поход"},{label:"Управление"},{label:"Настройки"},{label:"Об игре"}]',
     'Jt=' + G + '.MAIN_MENU=[{label:"Новый поход"},{label:"Управление"},{label:"Настройки"},{label:"Об игре"}]', 1),
    ('Bt(Qt,Jt,s/2,te,16)&&(d("ui_select"),0===Qt.sel?(e("mode"),Qt.mode=0):1===Qt.sel?e("controls"):2===Qt.sel?(e("settings"),Qt.set.sel=0):e("about"))',
     'Bt(Qt,Jt,s/2,te,16)&&(d("ui_select"),"continue"===(Jt[Qt.sel]||{}).act?(Qt.starting=!0,t.Game.fadeTo((()=>{Qt.starting=!1;try{' + G + '.YODGOR&&' + G + '.YODGOR.continueRun()}catch(e){console.error(e)}}),.035)):"load"===(Jt[Qt.sel]||{}).act?' + G + '.LOAD_MENU&&' + G + '.LOAD_MENU():"lang"===(Jt[Qt.sel]||{}).act?' + G + '.LANG.cycle():' + G + '.MENU_ACT&&' + G + '.MENU_ACT((Jt[Qt.sel]||{}).act)?0:"Новый поход"===(Jt[Qt.sel]||{}).label?(e("mode"),Qt.mode=0):"Управление"===(Jt[Qt.sel]||{}).label?e("controls"):"Настройки"===(Jt[Qt.sel]||{}).label?(e("settings"),Qt.set.sel=0):e("about"))', 1),
    # ---- three ways to walk: cards filled by the layer ----
    ('modeK:[0,0]}', 'modeK:[0,0,0]}', 1),
    ('Zt=[{id:"wanderer",name:"Странник",icon:"yurt",tag:"Рекомендуется",tagC:c.turqL,lines:["После гибели вы возродитесь в начале текущей локации.","Снаряжение, свитки и благословения сохраняются. Тилла — наполовину."]},{id:"classic",name:"Классика",icon:"balbal",tag:"Для бывалых",tagC:"#ff9a8a",lines:["Смерть окончательна: поход начинается заново из Бухары.","Для тех, кто знает цену каждой искре кута."]}]',
     'Zt=' + G + '.MODES_UI=[]', 1),
    ('const oe=t=>({x:s/2+(t?6:-166),y:94,w:160,h:130})', 'const oe=t=>({x:s/2-227+154*t,y:90,w:146,h:146})', 1),
    ('for(let t=0;t<2;t++)Qt.modeK[t]+=.3*((Qt.mode===t?1:0)-Qt.modeK[t]);',
     'for(let t=0;t<Zt.length;t++)Qt.modeK[t]=(Qt.modeK[t]||0)+.3*((Qt.mode===t?1:0)-(Qt.modeK[t]||0));', 1),
    ('(R("left")||R("up"))&&(0!==Qt.mode&&d("ui_move"),Qt.mode=0),(R("right")||R("down"))&&(1!==Qt.mode&&d("ui_move"),Qt.mode=1);for(let t=0;t<2;t++){const e=oe(t);if(D(e.x,e.y,e.w,e.h)&&(F.moved&&Qt.mode!==t&&(Qt.mode=t,d("ui_move")),F.click))return Qt.mode=t,void ae(Zt[t].id)}if(P())return void ae(Zt[Qt.mode].id);',
     '(R("left")||R("up"))&&Qt.mode>0&&(d("ui_move"),Qt.mode--),(R("right")||R("down"))&&Qt.mode<Zt.length-1&&(d("ui_move"),Qt.mode++);for(let t=0;t<Zt.length;t++){const e=oe(t);if(D(e.x,e.y,e.w,e.h)&&(F.moved&&Qt.mode!==t&&(Qt.mode=t,d("ui_move")),F.click))return Qt.mode=t,void(' + G + '.MODE_PICK?' + G + '.MODE_PICK(Zt[t].id,ae):ae(Zt[t].id))}if(P())return void(' + G + '.MODE_PICK?' + G + '.MODE_PICK(Zt[Qt.mode].id,ae):ae(Zt[Qt.mode].id));', 1),
    ('const f="yurt"===e.icon?nt.yurt():nt.balbal();', 'const f=' + G + '.MODE_ICON&&' + G + '.MODE_ICON(e.icon)||("yurt"===e.icon?nt.yurt():nt.balbal());', 1),
    ('It(t,e.name,l,r+53,16,n?"gold":"cream")', 'It(t,e.name,l,r+53,W(e.name,16)>s.w-14?W(e.name,12)>s.w-14?10:12:16,n?"gold":"cream")', 1),
    ('E(e,"classic"===l.mode?"Классика: путь начнётся заново":"Странник: снаряжение сохранится",s/2,176,{align:"center",color:"classic"===l.mode?"#ff9a8a":c.turqL,',
     'E(e,' + G + '.MODE_DEATH?' + G + '.MODE_DEATH(l.mode):"",s/2,176,{align:"center",color:"classic"===l.mode?"#ff9a8a":"souls"===l.mode?"#f2c14a":c.turqL,', 1),
    ('["Режим","classic"===i.mode?"Классика":"Странник"]', '["Режим",' + G + '.MODE_NAME?' + G + '.MODE_NAME(i.mode):i.mode]', 1),
    ('E(e,"classic"===n.mode?"Классика":"Странник",a+s-10,34,{align:"right",color:"classic"===n.mode?"#ff9a8a":c.turqL,',
     'E(e,' + G + '.MODE_NAME?' + G + '.MODE_NAME(n.mode):n.mode,a+s-10,34,{align:"right",color:"classic"===n.mode?"#ff9a8a":"souls"===n.mode?"#f2c14a":c.turqL,', 1),
    # ---- difficulty, same land after death in the Oath ----
    ('t.diff.hpMul=1+.42*n.stage,t.diff.dmgMul=1+.2*n.stage,',
     't.diff.hpMul=1+.42*n.stage,t.diff.dmgMul=1+.2*n.stage,' + G + '.ADJUST_DIFF&&' + G + '.ADJUST_DIFF(t.diff,n,i),', 1),
    ('(s?31*(n.deaths+1):0)', '(s&&"souls"!==n.mode?31*(n.deaths+1):0)', 1),
    # ---- stage card, pause stats ----
    ('"rest"===e.type?n="ПРИВАЛ":"boss"===e.type?n="ЛОГОВО":t.run&&(n="ЗЕМЛЯ "+["I","II","III","IV","V","VI","VII"][t.PLAN.slice(0,t.run.planIndex+1).filter((t=>"level"===t.type)).length-1])',
     'n=' + G + '.STAGE_LABEL?' + G + '.STAGE_LABEL(e,a):"rest"===e.type?"ПРИВАЛ":"boss"===e.type?"ЛОГОВО":""', 1),
    ('["Свитки",String(n.scrolls||0)]', '(' + G + '.PAUSE_STAT?' + G + '.PAUSE_STAT():["Свитки",String(n.scrolls||0)])', 1),
    # ---- portraits of the new people are drawn by the layer ----
    ('const s={aksakal:"#5a3a2e",shaman:"#1f4a56",stone:"#4a4a56",hero:"#24305a"}',
     'const s=Object.assign({aksakal:"#5a3a2e",shaman:"#1f4a56",stone:"#4a4a56",hero:"#24305a"},' + G + '&&' + G + '.PORTRAIT_BG||{})', 1),
    # ---- the Controls screen: the layer adds a second page with Yodgor's own keys (96b_controls.js) ----
    ('Wt.forEach(((e,a)=>{const o=55+15*a;', '(' + G + '&&' + G + '.CONTROLS_ROWS?' + G + '.CONTROLS_ROWS(Wt,t):Wt).forEach(((e,a)=>{const o=55+15*a;', 1),
    ('a.translate(16,17),a.scale(.55,.55),"aksakal"===t)',
     'a.translate(16,17),a.scale(.55,.55),(' + G + '&&' + G + '.PORTRAITS||{})[t])' + G + '.PORTRAITS[t](a,e);else if("aksakal"===t)', 1),
]

REPLACE = HEAD + EXTRA + OWN

head_end = src_html.index('<body>') + len('<body>')
tail_start = src_html.rindex('</body>')
skeleton_head = src_html[:head_end]
inner = src_html[head_end:tail_start]
assert inner.count('<script') == 2, inner.count('<script')

for old, new, n in REPLACE:
    got = inner.count(old)
    assert got == n, ('patch target count', old[:90], got, n)
    inner = inner.replace(old, new)

# ---- scripts ----
i18n = (root / 'src' / 'i18n.js').read_text(encoding='utf-8')
people = (root / 'src' / 'people.js').read_text(encoding='utf-8')
skip = set(filter(None, os.environ.get('YODGOR_SKIP', '').split(',')))
layer_files = [q for q in sorted((root / 'src' / 'layer').glob('*.js')) if q.name not in skip]
layer = '\n'.join('/* ---- %s ---- */\n%s' % (p.name, p.read_text(encoding='utf-8')) for p in layer_files)

# three-language strings must have exactly three parts
bad = []
for p in layer_files + [root / 'src' / 'people.js']:
    text = p.read_text(encoding='utf-8')
    for m in re.finditer(r'\b(?:t|N|tf|say1)\(`([^`]*)`', text):
        if m.group(1).count('|') != 2:
            bad.append('%s: %s' % (p.name, m.group(1)[:80]))
if bad:
    print('\n'.join(bad))
    sys.exit('three-part strings with a wrong number of parts: %d' % len(bad))

first_script = inner.index('<script>')
pixfont = (root / 'src' / 'pixfont.js').read_text(encoding='utf-8')
inner = inner[:first_script] + '<script>\n/* YODGOR_I18N */\n' + i18n + '\n</script>\n<script>\n/* YODGOR_PIXFONT */\n' + pixfont + '\n</script>\n' + inner[first_script:]
libs = ''.join('\n<script>\n/* LIB %s */\n%s\n</script>\n' % (q.name, q.read_text(encoding='utf-8')) for q in sorted((root / 'src' / 'lib').glob('*.js')))
block = (libs + '\n<script>\n/* YODGOR_PEOPLE */\n' + people + '\n</script>\n'
         '<script>\n/* YODGOR_LAYER */\n(function () {\n\'use strict\';\nconst G = window.G;\n'
         'if (!G || !G.STORY || !G.Game || !G.UI || !G.Events) return;\n' + layer + '\n})();\n</script>\n')
page = inner.rstrip() + '\n' + block
full = skeleton_head + page + '</body></html>'

import os
dist = pathlib.Path(os.environ['YODGOR_OUT']) if os.environ.get('YODGOR_OUT') else root / 'dist'
dist.mkdir(exist_ok=True)
(dist / 'page.html').write_text(page, encoding='utf-8')
(dist / 'standalone.html').write_text(full, encoding='utf-8')

print('patches', len(REPLACE), '(head %d, extra %d, own %d)' % (len(HEAD), len(EXTRA), len(OWN)))
print('layer files', [p.name for p in layer_files])
print('page.html', len(page.encode()), 'bytes; layer', len(layer.encode()), 'bytes, sha', hashlib.sha256(layer.encode()).hexdigest()[:12])

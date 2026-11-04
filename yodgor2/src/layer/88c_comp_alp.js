/* 88c_comp_alp.js — Alp's arc "The Name" (GDD ch. 7).
     1 The Fallen House   (Tail, act I)        70_act1.js + 88b (he comes along)
     2 Scars              (Salt Mines)          a convict knows him and goes for him with a nail
     3 The Tumars         (Swallowed Streets)   71_act2.js: F().alpTumars = returned | destroyed | choice
     4 The Captain        (the Ark)             if he took his memory back: Tilla-bek calls him by his old name, Arslon
     5 The Debt           (before the last night) he decides who to be
   Outcomes (COMP.f('alpEnd')): redeemed (remembers and stays) · hollow (stays, without himself) · captain (goes back to the
   Divan and meets you at the Heart as an enemy) · chained (went up alone; 71's Heart scene) · dead (the knot, 88f).
   Key nodes: key_wall (step 2 — he stands between you and the knife), key_captain (step 4 — he fights the old way, for the
   children), outcome_hollow (the tumars burned). */
{
  CAST.convict = { name: `Ibrohim, a convict|Каторжник Иброхим|Mahkum Ibrohim`, portrait: null };
  const has = COMP.has, w = COMP.with, arc = COMP.arc, f = COMP.f, app = COMP.app;
  const A = (n) => app('alp', n, 'arc');

  /* ---------------------------------------------------------------- 2 · Scars (the Salt Mines) */
  COMP.beat('alp2', () => w('alp') && arc('alp') >= 1 && COMP.region() === 'mines', done => play([
    ['', `A convict with salt in the creases of his face drops his pick and stares at Alp. Then he runs at him with a cart nail ground to a point.|Каторжник с солью в морщинах роняет кирку и смотрит на Алпа. Потом бросается на него с заточенным гвоздём от тачки.|Ajinlariga tuz o'tirib qolgan mahkum cho'kichini tashlab, Alpga tikilib qoladi. Keyin aravaning charxlangan mixi bilan unga tashlanadi.`],
    ['convict', `Captain! You don't remember me? Lot twenty-two! You put my wife's wedding in a box and sold it in the Ark!|Капитан! Не помнишь меня? Лот двадцать два! Ты сложил свадьбу моей жены в ящик и продал в Арке!|Kapitan! Meni eslamaysanmi? Yigirma ikkinchi lot! Xotinimning to'yini qutiga solib, Arkda sotgansan!`],
    ['alp', `...I don't know you. One. Two. Three. ...I believe you.|...Я тебя не знаю. Раз. Два. Три. ...Я тебе верю.|...Seni tanimayman. Bir. Ikki. Uch. ...Senga ishonaman.`]
  ], () => ask(`The nail is a step from Alp's chest. Alp doesn't raise a hand.|Гвоздь в шаге от груди Алпа. Алп и руки не поднимает.|Mix Alpning ko'kragidan bir qadamda. Alp qo'lini ham ko'tarmaydi.`, [
    FAC.chk('str', 6, `Catch the man's wrist.|Перехватить запястье.|Bilakdan ushlab qolish.`, { id: 'stop' }),
    { id: 'let', label: `Let Alp take it. It's his to take.|Пусть Алп примет удар. Это его удар.|Alp zarbani qabul qilsin. Bu uning zarbasi.` },
    { id: 'hear', label: `"Wait. Tell him. He needs to hear it more than he needs to bleed."|«Стой. Расскажи ему. Ему нужнее услышать, чем истечь кровью.»|«To'xta. Unga aytib ber. Qon to'kishdan ko'ra eshitish unga ko'proq kerak.»` }
  ], o => {
    const fin = (lines, out) => play(lines, () => {
      f('alpScars', out); arc('alp', 2);
      if (out !== 'let') COMP.flag('alp', 'key_wall', 1);
      COMP.note('alp', `In the Salt Mines a convict knew Alp: "Captain. Lot twenty-two." Alp doesn't remember him, and believes him.|В Соляных шахтах Алпа узнал каторжник: «Капитан. Лот двадцать два». Алп его не помнит — и верит ему.|Tuz konlarida bir mahkum Alpni tanidi: «Kapitan. Yigirma ikkinchi lot». Alp uni eslamaydi — va unga ishonadi.`);
      done();
    });
    if (o.id === 'stop' && o.ok) {
      A(5);
      fin([
        ['', `You catch his wrist. The nail stops a finger from Alp's shirt. The man is all bones; he weighs less than his anger.|Ты перехватываешь запястье. Гвоздь замирает в пальце от рубахи Алпа. Человек — одни кости: весит меньше своей злости.|Bilagini ushlab qolasan. Mix Alpning ko'ylagidan bir enlik naridan to'xtaydi. Odam — suyak bilan teri: g'azabidan ham yengil.`],
        ['alp', `Let him go, yodchi. He's owed. ...Next time stand behind me. Not in front.|Отпусти его, ёдчи. Ему должны. ...В следующий раз стой за мной. Не впереди.|Qo'yib yubor, yodchi. Unga qarzdormiz. ...Keyingi safar orqamda tur. Oldimda emas.`]
      ], 'stopped');
    } else if (o.id === 'let' || (o.id === 'stop' && !o.ok)) {
      A(o.id === 'let' ? 10 : 0);
      fin([
        ['', o.id === 'let' ? `You step back. The nail goes into Alp's shoulder. He doesn't move, doesn't make a sound. The convict lets go of it and starts to cry.|Ты отступаешь. Гвоздь входит Алпу в плечо. Он не двигается, не издаёт ни звука. Каторжник отпускает гвоздь и плачет.|Orqaga chekinasan. Mix Alpning yelkasiga kiradi. U qimirlamaydi, ovoz ham chiqarmaydi. Mahkum mixni qo'yib yuborib, yig'lab yuboradi.` : `You reach for his wrist and miss. The nail goes into Alp's shoulder. Alp doesn't move. The convict lets go and starts to cry.|Ты тянешься к запястью и не успеваешь. Гвоздь входит Алпу в плечо. Алп не двигается. Каторжник отпускает гвоздь и плачет.|Bilagiga qo'l cho'zasan-u, ulgurmaysan. Mix Alpning yelkasiga kiradi. Alp qimirlamaydi. Mahkum mixni qo'yib yig'lab yuboradi.`],
        ['alp', `...That one I'll remember. Good. I need something to remember.|...Это я запомню. Хорошо. Мне нужно хоть что-то помнить.|...Buni eslab qolaman. Yaxshi. Menga eslab qolishga nimadir kerak.`]
      ], 'let');
    } else {
      A(10); COMP.app('nargiza', 5, 'alp2');
      fin([
        ['convict', `She married me twice. The first time she laughed all night. The second time, after your box, she was polite. Polite, captain.|Она вышла за меня дважды. В первый раз всю ночь смеялась. Во второй, после твоего ящика, была вежлива. Вежлива, капитан.|U menga ikki marta turmushga chiqdi. Birinchisida tuni bilan kuldi. Ikkinchisida, sening qutingdan keyin, xushmuomala edi. Xushmuomala, kapitan.`],
        ['', `Alp takes the bread out of his satchel, the bread he keeps for the orphans, and puts it in the man's hand. The man looks at it as if it were a coin he can't spend.|Алп достаёт из сумки лепёшку, ту, что носит для сирот, и кладёт человеку в руку. Тот смотрит на неё, как на монету, которую некуда потратить.|Alp xaltasidan yetimlar uchun olib yuradigan nonini chiqarib, odamning qo'liga qo'yadi. U nonga sarflab bo'lmaydigan tangaga qaragandek qaraydi.`],
        ['alp', `My hands know chains. Not on me. I held them. ...I'm sorry. That's a small word. It's the one I have.|Мои руки знают цепи. Не на мне. Я их держал. ...Прости. Это маленькое слово. Другого у меня нет.|Qo'llarim zanjirni taniydi. Menda emas. Men ularni ushlab turganman. ...Kechir. Bu kichkina so'z. Bori shu.`]
      ], 'heard');
    }
  })));

  /* ---------------------------------------------------------------- after the tumars (71): what it does to him */
  COMP.beat('alp3', () => F().alpTumars && arc('alp') >= 1, done => {
    arc('alp', 3);
    const how = F().alpTumars;
    if (how === 'destroyed') { COMP.flag('alp', 'outcome_hollow', 1); f('alpPath', 'hollow'); }
    if (how === 'returned' && has('alp')) {
      // 71: he goes up alone to settle with Tilla-bek; 88c step 4 catches him at the Ark gate
      f('alpPath', 'gone_up'); G.PARTY.setActive('alp', false);
      COMP.note('alp', `Alp has his memory back. He knows he was Tilla-bek's captain and went up to the Ark alone to settle the account. Catch him at the court gate.|Алп вернул себе память. Он знает, что был капитаном Тилла-бека, и ушёл в Арк один — свести счёты. Догнать его у ворот двора.|Alp xotirasini qaytarib oldi. U Tilla-bekning kapitani bo'lganini biladi va hisob-kitob qilish uchun Arkka yolg'iz ketdi. Uni saroy darvozasi oldida quvib yetish kerak.`, ['ark', 'court_gate']);
    } else COMP.note('alp', how === 'destroyed' ? `You burned Alp's tumars. He stays the kind giant the orphans know, and doesn't know why he can't sleep.|Ты сжёг тумары Алпа. Он остаётся добрым великаном, которого знают сироты, и не знает, почему ему не спится.|Alpning tumarlarini yoqib yubording. U yetimlar biladigan mehribon pahlavonligicha qoladi va nega uxlolmasligini bilmaydi.` : `Alp wears his tumars closed, on a cord round his neck. "A debt should be worn where people can see it."|Алп носит свои тумары закрытыми, на шнурке на шее. «Долг надо носить так, чтобы его было видно».|Alp tumarlarini yopiq holda, bo'ynidagi ipda taqib yuradi. «Qarzni ko'rinadigan joyda taqib yurish kerak».`);
    done();
  });

  /* ---------------------------------------------------------------- 4 · The Captain (the Ark, the court gate) */
  FAC.spot('ark', 'court_gate', 0.79);
  FAC.npc('alp_gate', { name: `Alp|Алп|Alp`, look: 'alp', dx: -24, prompt: `Talk to Alp|Поговорить с Алпом|Alp bilan gaplashish`, idle: `Alp stands at the gate, looking at it the way he looks at rubble: where to lift first.|Алп стоит у ворот и смотрит на них так, как смотрит на завал: за что браться первым.|Alp darvoza oldida turib, unga vayronaga qaragandek qarayapti: qayeridan birinchi ko'tarish kerak.` },
    () => (f('alpPath') === 'gone_up' && !f('alpEnd4') ? [{ from: 0, to: 24, region: 'ark', spot: 'court_gate' }] : []));
  FAC.talk.alp_gate = d => play([
    ['', `The court gate opens before you reach Alp. A steward in brocade bows to him, not to you.|Ворота двора открываются раньше, чем ты дошёл до Алпа. Распорядитель в парче кланяется ему, а не тебе.|Saroy darvozasi sen Alpga yetmasingdan ochiladi. Zarbof to'nli xizmatchi senga emas, unga ta'zim qiladi.`],
    ['tillabek', `Captain Arslon. You came back on your own feet. His Excellency always said you would.|Капитан Арслон. Вернулся своими ногами. Его превосходительство всегда говорил, что вернёшься.|Kapitan Arslon. O'z oyog'ing bilan qaytding. Janoblari doim qaytasan, derdilar.`],
    ['tillabek', `Your old post is open. The pay is better. And nobody will ask you what's under your shirt.|Твоя прежняя должность свободна. Платят больше. И никто не спросит, что у тебя под рубахой.|Eski lavozimingiz bo'sh. Maoshi ham yaxshiroq. Ko'ylagingiz tagida nima borligini hech kim so'ramaydi.`],
    ['alp', `Arslon. ...It sounds like someone I wouldn't let near the children.|Арслон. ...Звучит как человек, которого я бы к детям не подпустил.|Arslon. ...Bolalar yoniga yo'latmaydigan odamning ismiga o'xshaydi.`]
  ], () => ask(`Alp looks at you, then at the open gate.|Алп смотрит на тебя, потом на открытые ворота.|Alp senga, keyin ochiq darvozaga qaraydi.`, [
    COMP.app('alp') >= 40
      ? { id: 'stay', label: `"Alp walks with me. The captain can stay in the box where you kept him."|«Алп ходит со мной. А капитан пусть останется в ящике, где вы его держали.»|«Alp men bilan yuradi. Kapitan esa siz saqlagan qutida qolsin.»` }
      : FAC.chk('backbone', 3, `"Alp walks with me. The captain can stay in the box where you kept him."|«Алп ходит со мной. А капитан пусть останется в ящике, где вы его держали.»|«Alp men bilan yuradi. Kapitan esa siz saqlagan qutida qolsin.»`, { id: 'stay' }),
    { id: 'choose', label: `"It's your name, Alp. Your choice."|«Это твоё имя, Алп. Тебе и выбирать.»|«Bu sening isming, Alp. O'zing tanla.»` },
    { id: 'settle', label: `"Go in. Settle your account. I'll be at the Heart."|«Иди. Сведи свои счёты. Я буду у Сердца.»|«Kir. Hisobingni yop. Men Yurak oldida bo'laman.»` }
  ], o => {
    let out;
    if (o.id === 'stay') out = (o.ok === false) ? (COMP.app('alp') >= 20 ? 'stay' : 'captain') : 'stay';
    else if (o.id === 'choose') out = COMP.app('alp') >= 40 ? 'stay' : COMP.app('alp') >= 0 ? 'settle' : 'captain';
    else out = 'settle';
    f('alpEnd4', out); arc('alp', 4);
    if (out === 'stay') {
      f('alpPath', 'redeemed'); COMP.flag('alp', 'key_captain', 1); G.PARTY.setActive('alp', true); A(o.id === 'choose' ? 15 : 5);
      play([
        ['alp', `I know how Arslon fought. Fast, no mercy, to break the caravan in one blow. ...I'll fight like that. For them.|Я знаю, как дрался Арслон. Быстро, без жалости, чтобы разбить караван одним ударом. ...Я буду так драться. За них.|Arslon qanday urishganini bilaman. Tez, shafqatsiz, karvonni bir zarbada yorish uchun. ...Men ham shunday urishaman. Ular uchun.`],
        ['tillabek', `A pity. Sentiment is so expensive to feed.|Жаль. Сантименты так дорого кормить.|Attang. Hissiyotni boqish juda qimmatga tushadi.`]
      ], () => { COMP.note('alp', `At the Ark gate Tilla-bek's steward called him Captain Arslon and offered his post back. Alp turned it down and walks with you.|У ворот Арка распорядитель Тилла-бека назвал его капитаном Арслоном и предложил прежнюю должность. Алп отказался и идёт с тобой.|Ark darvozasida Tilla-bekning xizmatchisi uni kapitan Arslon deb atadi va eski lavozimini taklif qildi. Alp rad etdi va sen bilan yuribdi.`); d(); });
    } else if (out === 'captain') {
      f('alpPath', 'captain'); f('alpEnd', 'captain'); f('alpGone', 1); G.PARTY.leave('alp', 'captain');
      play([
        ['alp', `...Arslon had a place. Alp has rubble. One. Two. Three. I'm tired of rubble, yodchi.|...У Арслона было место. У Алпа — завалы. Раз. Два. Три. Я устал от завалов, ёдчи.|...Arslonning o'rni bor edi. Alpda — vayronalar. Bir. Ikki. Uch. Vayronadan charchadim, yodchi.`],
        ['', `He walks through the gate without looking back. The steward bows again, lower.|Он проходит в ворота, не оглядываясь. Распорядитель кланяется снова, ниже.|U ortiga qaramay darvozadan kirib ketadi. Xizmatchi yana, pastroq ta'zim qiladi.`]
      ], () => { COMP.note('alp', `Alp took back the name Arslon and his old post at the Divan. If you go to the Heart, he'll be standing on Tilla-bek's side.|Алп вернул себе имя Арслон и прежнюю службу в Диване. У Сердца он будет стоять на стороне Тилла-бека.|Alp Arslon ismini va Devondagi eski xizmatini qaytarib oldi. Yurak oldida u Tilla-bek tomonida turadi.`); d(); });
    } else {
      f('alpPath', 'chained'); f('alpGone', 1); G.PARTY.leave('alp', 'settle');
      play([
        ['alp', `Yes. Some things a man has to carry up the stairs himself.|Да. Кое-что человек должен сам занести по лестнице.|Ha. Ba'zi narsalarni odam zinadan o'zi ko'tarib chiqishi kerak.`],
        () => (sadoAwake() ? ['sado', `He's going to walk into a room full of guards and ask for an apology.|Он сейчас войдёт в зал, полный стражи, и потребует извинений.|U hozir soqchilarga to'la xonaga kirib, kechirim so'ramoqchi.`] : null)
      ], () => { COMP.note('alp', `Alp went into the Ark alone to settle his account with Tilla-bek.|Алп ушёл в Арк один — свести счёты с Тилла-беком.|Alp Tilla-bek bilan hisob-kitob qilish uchun Arkka yolg'iz kirib ketdi.`); d(); });
    }
  }));

  /* ---------------------------------------------------------------- the captain at the Heart (outcome 'captain') */
  COMP.beat('alp_heart', () => f('alpEnd') === 'captain' && COMP.region() === 'heart', done => play([
    ['', `Among the Divan's mercenaries one stands a head taller than the rest, in a captain's red, with a cord of tumars under his collar.|Среди наёмников Дивана один на голову выше остальных — в красном капитанском, со шнурком тумаров под воротом.|Devon yollanmalari orasida biri boshqalardan bir bosh baland — qizil kapitan kiyimida, yoqasi tagida tumarlar ipi.`],
    ['alp', `Yodchi. Arslon is paid to stop you. ...Alp would let you pass. They're both here. Choose quickly.|Ёдчи. Арслону платят, чтобы он тебя остановил. ...Алп бы пропустил. Тут они оба. Выбирай быстро.|Yodchi. Arslonga seni to'xtatish uchun pul to'lashadi. ...Alp o'tkazib yuborardi. Bu yerda ikkalasi ham bor. Tez tanla.`]
  ], () => ask(`The captain waits, hand on the mace.|Капитан ждёт, рука на булаве.|Kapitan qo'lini gurziga qo'yib kutib turibdi.`, [
    FAC.chk('mem', 7, `"The children at Mehri's ask about you every night. What do I tell them?"|«Дети у Мехри каждый вечер спрашивают о тебе. Что мне им говорить?»|«Mehrining yonidagi bolalar har kecha sen haqingda so'rashadi. Ularga nima deyin?»`, { id: 'talk' }),
    { id: 'fight', label: `"Then Arslon earns his pay."|«Тогда пусть Арслон отрабатывает плату.»|«Unda Arslon maoshini oqlasin.»` }
  ], o => {
    if (o.id === 'talk' && o.ok) {
      f('alpEnd', 'redeemed'); f('alpGone', 0); COMP.join('alp', 10);
      play([['alp', `...Tell them Alp is coming. Tell them he's late, as usual.|...Скажи, что Алп идёт. Скажи, что опаздывает, как всегда.|...Alp kelyapti, de. Odatdagidek kechikyapti, de.`], ['', `He takes off the red coat and drops it in the wet. The mercenaries look at each other and decide it is not their business.|Он снимает красный кафтан и бросает его в воду. Наёмники переглядываются и решают, что это не их дело.|U qizil to'nini yechib, suvga tashlaydi. Yollanmalar bir-biriga qarashib, bu ularning ishi emas degan qarorga kelishadi.`]], done);
    } else {
      f('alpEnd', 'dead'); rep('tail', -1);
      play([
        ['', `He fights the way the steward said he would: fast, without mercy, to end it in one blow. He is slower than he was. In the end he goes down on one knee, then the other, and stays there.|Он дерётся так, как говорил распорядитель: быстро, без жалости, чтобы всё кончить одним ударом. Он медленнее, чем был. В конце он опускается на одно колено, потом на другое — и больше не встаёт.|U xizmatchi aytgandek urishadi: tez, shafqatsiz, bir zarbada tugatish uchun. Avvalgidan sekinroq. Oxiri bir tizzasiga, keyin ikkinchisiga cho'kadi — va boshqa turmaydi.`],
        ['alp', `...Tell the children. Alp. Not the other one.|...Скажи детям. Алп. Не тот, другой.|...Bolalarga ayt. Alp. Unisi emas.`]
      ], done);
    }
  })));

  /* ---------------------------------------------------------------- 5 · The Debt (before the last night) */
  COMP.beat('alp5', () => has('alp') && w('alp') && COMP.story('a3_house') && !f('alpEnd'), done => {
    const path = f('alpPath') || (F().alpTumars === 'choice' ? 'choice' : 'none');
    const remembers = path === 'redeemed' || F().alpTumars === 'returned' || F().alpTumars === 'choice';
    play([
      ['', `Alp sits on an overturned dream of a cart, counting something on his fingers, over and over.|Алп сидит на перевёрнутой во сне телеге и что-то снова и снова считает на пальцах.|Alp tushdagi ag'darilgan arava ustida o'tirib, barmoqlarida nimanidir qayta-qayta sanayapti.`],
      ['alp', remembers
        ? `Forty-one families. I counted them in the tumars. ...If we live, I'll go to each door. Not to be forgiven. So they can see my face.|Сорок одна семья. Я сосчитал их по тумарам. ...Если выживем, я пойду к каждой двери. Не за прощением. Чтобы видели моё лицо.|Qirq bir oila. Tumarlardan sanab chiqdim. ...Tirik qolsak, har bir eshikka boraman. Kechirim uchun emas. Yuzimni ko'rishsin, deb.`
        : `I don't know what I did, yodchi. I know my hands are good at it. ...Is it worse not to know?|Я не знаю, что я сделал, ёдчи. Знаю, что руки у меня к этому привычные. ...Хуже, что не знаю?|Nima qilganimni bilmayman, yodchi. Qo'llarim bunga o'rgangan, shuni bilaman. ...Bilmaganim yomonroqmi?`]
    ], () => ask(`Alp waits for an answer. He'll take whatever you give him.|Алп ждёт ответа. Он примет любой.|Alp javob kutyapti. Har qanday javobni qabul qiladi.`, remembers ? [
      { id: 'stay', label: `"Then stay in the Tail. Let them see you every day."|«Тогда оставайся в Хвосте. Пусть видят тебя каждый день.»|«Unda Dumda qol. Seni har kuni ko'rishsin.»` },
      { id: 'go', label: `"You've paid. Go somewhere nobody knows the captain."|«Ты расплатился. Уходи туда, где капитана никто не знает.»|«Qarzingni uzding. Kapitanni hech kim tanimaydigan joyga ket.»` }
    ] : [
      { id: 'hollow', label: `"Not knowing is what lets you carry the children. Keep carrying them."|«Незнание и даёт тебе нести детей. Неси дальше.»|«Bilmasliging bolalarni ko'tarib yurishga imkon beradi. Ko'tarishda davom et.»` },
      { id: 'truth', label: `"Worse. And one day you'll want to know. When you do, come and ask me."|«Хуже. И однажды ты захочешь знать. Тогда приходи и спроси меня.»|«Yomonroq. Bir kun bilging keladi. O'shanda kelib mendan so'ra.»` }
    ], o => {
      const end = o.id === 'stay' ? 'redeemed' : o.id === 'go' ? 'gone' : o.id === 'hollow' ? 'hollow' : 'hollowAsk';
      f('alpEnd', end); arc('alp', 5);
      if (end === 'redeemed') A(10); if (end === 'gone') A(-5); if (end === 'hollow') A(5); if (end === 'hollowAsk') A(10);
      play([['alp', {
        redeemed: `Every day. Yes. That's a long debt. Good. I'm strong.|Каждый день. Да. Долгий долг. Хорошо. Я сильный.|Har kuni. Ha. Uzoq qarz. Yaxshi. Men kuchliman.`,
        gone: `...Somewhere nobody knows him. Then nobody knows me either. One. Two. Three. That's lonely, yodchi.|...Где его никто не знает. Значит, и меня никто. Раз. Два. Три. Это одиноко, ёдчи.|...Uni hech kim tanimaydigan joy. Demak, meni ham hech kim tanimaydi. Bir. Ikki. Uch. Bu yolg'izlik, yodchi.`,
        hollow: `Carry them. Yes. That I know how to do.|Нести их. Да. Это я умею.|Ularni ko'tarish. Ha. Buni bilaman.`,
        hollowAsk: `I'll come and ask. Not tomorrow. ...Some day with good weather.|Приду спросить. Не завтра. ...Как-нибудь в хорошую погоду.|Kelib so'rayman. Ertaga emas. ...Havo yaxshi bo'lgan biror kuni.`
      }[end]]], () => { COMP.end('alp', end, `Alp has decided who he is.|Алп решил, кем ему быть.|Alp kim bo'lishini hal qildi.`); done(); });
    }));
  });

  /* ---------------------------------------------------------------- the epilogue: the outcomes 72 doesn't know */
  SIDE.epi('alp', e => {
    const end = f('alpEnd');
    if (end === 'dead') return `Alp died at the Heart in a captain's red, and the orphans of the Tail never believed it. They still leave a flatbread on the wall by Mehri's gate, in case he's late, as usual.|Алп погиб у Сердца в красном капитанском кафтане, и сироты Хвоста в это так и не поверили. Они до сих пор оставляют лепёшку на стене у ворот Мехри — вдруг он опаздывает, как всегда.|Alp Yurak oldida qizil kapitan to'nida halok bo'ldi, Dumning yetimlari esa bunga hech ishonishmadi. Ular hali ham Mehrining darvozasi yonidagi devorga non qo'yib ketishadi — balki odatdagidek kechikayotgandir.`;
    if (end === 'captain') return `Captain Arslon kept the Divan's order for many years. People say he never once raised a hand against a child. People say a lot of things about captains.|Капитан Арслон много лет держал порядок для Дивана. Говорят, ни разу не поднял руку на ребёнка. О капитанах много чего говорят.|Kapitan Arslon ko'p yillar Devon uchun tartib saqladi. Aytishlaricha, biror marta bolaga qo'l ko'tarmagan. Kapitanlar haqida nimalar demaydi deysan.`;
    if (end === 'redeemed' && e !== 'awake') return `Alp knocked on forty-one doors in the Tail. At some they spat, at some they wept, at two they let him in for tea. He still guards the orphans. They call him Alp, and he lets them.|Алп постучал в сорок одну дверь Хвоста. Где-то в него плевали, где-то плакали, в двух домах позвали на чай. Он по-прежнему бережёт сирот. Они зовут его Алпом, и он не возражает.|Alp Dumdagi qirq bitta eshikni taqillatdi. Qayerdadir tupurishdi, qayerdadir yig'lashdi, ikki uyda choyga taklif qilishdi. U hamon yetimlarni qo'riqlaydi. Ular uni Alp deyishadi, u esa qarshi emas.`;
    if (end === 'gone') return `Alp left the city with a salt caravan, heading for somewhere nobody knows a captain. The orphans grew up telling each other he'd be back. The caravan drivers say he never once looked back.|Алп ушёл из города с соляным караваном — туда, где капитана никто не знает. Сироты выросли, рассказывая друг другу, что он вернётся. Погонщики говорят, он ни разу не оглянулся.|Alp kapitanni hech kim tanimaydigan joyga tuz karvoni bilan ketdi. Yetimlar u qaytadi deb bir-biriga aytib ulg'ayishdi. Tuyakashlar u bir marta ham ortiga qaramagan deyishadi.`;
    if (end === 'hollowAsk') return `Alp never came to ask. Some days with good weather he would stand at your door, open his mouth, and then ask whether you needed anything lifted.|Алп так и не пришёл спросить. В погожие дни он иногда стоял у твоей двери, открывал рот — и спрашивал, не нужно ли чего поднять.|Alp so'rashga hech kelmadi. Havo yaxshi bo'lgan kunlari ba'zan eshigingda turib, og'iz ochardi-yu, biror narsa ko'tarish kerakmi, deb so'rardi.`;
    return null;   // the acts' own slide (72) covers the rest
  }, 'alp:guard');
}

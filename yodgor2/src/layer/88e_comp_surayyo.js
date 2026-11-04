/* 88e_comp_surayyo.js — Surayyo, the Tail's last mirab, and her arc "The Pleiades" (GDD ch. 7). The only romance.
     1 The Dry Aryk        (Tail, act I)       the water stops; the sluice under the square jams; Hollow come up the channel
     2 The Water Debt      (the Cloister)      the Tail's water debt is paid in memory, and she has paid it for everyone
     3 The Roof            (a talk by the fire, after the Cistern)   88g: the first confession, if it has grown; or friendship
     4 A Stranger's Face   (Old Yodgor)        in a fight she doesn't know you for a few seconds
     5 A Tumar for Two     (the Spine)         an old mirab knows how to keep her memory: your memory of her, her work, or a
                                               third way through the craft (a hard Memory check and Sado's trust)
     6 The Pleiades        (before the last night) the lower sluices; her fate goes with the city's
   Outcomes (epilogue): together and she remembers · together and she fades · the sluices (Awakening: saved or lost) ·
   the Divan's mirab (Chain) · friendship · gone (approval fell). Romance state COMP.f('rom'): 'yes' | 'friend' | 'closed'.
   Key nodes: key_sluices (step 5), key_tail (step 2, if you stood with her), knows_obi (she hears the name). */
{
  CAST.mirab = { name: `Old Hamid, a mirab|Старый Хамид, мираб|Keksa Hamid, mirob`, portrait: null };
  const has = COMP.has, w = COMP.with, arc = COMP.arc, f = COMP.f;
  const S = n => COMP.app('surayyo', n, 'arc');
  const sado = () => sadoAwake();

  /* ---------------------------------------------------------------- 1 · The Dry Aryk */
  const meet = done => play([
    ['', `The aryk along the row goes quiet. Then it goes dry. People come out of their doors holding buckets, as if the water had only stepped out.|Арык вдоль ряда стихает. Потом пересыхает. Люди выходят из дверей с вёдрами, будто вода просто вышла ненадолго.|Qator bo'ylab oqayotgan ariq jim bo'lib qoladi. Keyin quriydi. Odamlar chelak ko'tarib eshiklaridan chiqishadi, go'yo suv shunchaki bir zumga chiqib ketgandek.`],
    ['', `A woman in a faded blue scarf is swearing at an iron wheel sunk in the paving, with a hook-pole as long as she is.|Женщина в выцветшем синем платке ругается на железное колесо, утопленное в мостовой, — в руках у неё шест с крюком длиной в её рост.|Rangi o'chgan ko'k ro'mol o'ragan ayol yo'lakka botib ketgan temir g'ildirakni so'kyapti — qo'lida bo'yi barobar ilgakli xoda.`],
    ['surayyo', `Turn, you donkey. Turn, or I'll sell you for nails. ...You! Yodchi! Don't stand there counting me, lean on this with me.|Крутись, ишак. Крутись, или продам тебя на гвозди. ...Эй! Ёдчи! Не стой, не считай меня — налегай со мной.|Aylan, eshak. Aylan, bo'lmasa seni mixga sotaman. ...Hoy! Yodchi! Turib meni sanama — men bilan birga bos.`],
    ['surayyo', `The quake jammed the sluice under the square. And the Hollow come up the channel when it's dry. They're thirsty too, poor things. They're also heavy.|Толчок заклинил шлюз под площадью. А когда канал сухой, по нему поднимаются Пустые. Они тоже хотят пить, бедняги. И они тоже тяжёлые.|Silkinish maydon tagidagi shlyuzni qisib qo'ydi. Kanal quruq bo'lsa, undan Bo'shlar chiqib keladi. Ular ham chanqagan, bechoralar. Va ular ham og'ir.`],
    () => (sado() ? ['sado', `She smells like rain! In the middle of a drought. How does she do that?|Она пахнет дождём! Посреди засухи. Как у неё получается?|Undan yomg'ir hidi keladi! Qurg'oqchilikning o'rtasida. Qanday qiladi?`] : null)
  ], () => ask(`The wheel shudders. Something is coming up the channel, dragging its feet.|Колесо вздрагивает. По каналу что-то поднимается, волоча ноги.|G'ildirak titraydi. Kanal bo'ylab nimadir oyoqlarini sudrab chiqib kelyapti.`, [
    { id: 'yes', label: `Put your shoulder to the wheel and your hand on your sabre.|Навалиться на колесо — и держать руку на сабле.|G'ildirakka yelka tirab, qo'lni qilichda tutish.` },
    { id: 'no', label: `"Water isn't my work, mirab."|«Вода — не моё дело, мираб.»|«Suv mening ishim emas, mirob.»` }
  ], o => {
    if (o.id === 'no') { f('arykNo', 1); play([['surayyo', `Everything's water, yodchi. Even you. Especially you. ...Go on, then.|Всё — вода, ёдчи. Даже ты. Особенно ты. ...Ну иди.|Hamma narsa suv, yodchi. Hatto sen ham. Ayniqsa sen. ...Mayli, ket.`]], done); return; }
    f('aryk', 'fight');
    const p = G.world.player;
    for (const dx of [-120, 140, 190]) { try { const e = G.Enemies.spawn('yd_hollow', p.x + dx, p.y - 6); if (e) { e._sur = 1; e.aggro = true; } } catch (e) { console.error(e); } }
    play([['surayyo', `Here they come. Don't kill them if you can help it. ...You can't help it. Fine.|Идут. Не убивай, если можно. ...Нельзя. Ладно.|Kelishyapti. Iloji bo'lsa o'ldirma. ...Iloji yo'q. Mayli.`]], done);
  }));
  COMP.beat('sur1', () => COMP.story('a1_tail') && COMP.region() === 'tail' && !has('surayyo') && COMP.moon() <= 1, done => meet(done));
  const hollowLeft = () => (G.world ? G.world.enemies.filter(e => e && e._sur && !e.dead && e.hp > 0).length : 0);
  COMP.beat('sur1b', () => f('aryk') === 'fight' && COMP.region() === 'tail' && hollowLeft() === 0, done => play([
    ['', `The last Hollow sits down in the dry channel as if it had just remembered something, and doesn't get up. Surayyo throws her weight on the wheel. It turns. Water comes, brown, then clear.|Последний Пустой садится в сухом канале, будто что-то вспомнил, и больше не встаёт. Сурайё наваливается на колесо. Оно поворачивается. Идёт вода — сначала бурая, потом чистая.|Oxirgi Bo'sh quruq kanalga nimanidir eslagandek o'tirib qoladi va boshqa turmaydi. Surayyo butun og'irligi bilan g'ildirakka tashlanadi. U buriladi. Suv keladi — avval loyqa, keyin tiniq.`],
    ['surayyo', `Ha! Look at it go! ...Taste that. Go on, taste it.|Ха! Смотри, как пошла! ...Попробуй. Давай, попробуй.|Ha! Qara, qanday oqyapti! ...Totib ko'r. Qani, totib ko'r.`],
    ['hero', `It's bitter.|Горчит.|Achchiq.`],
    ['surayyo', `Since spring. Nobody believes me. The Singers say it's the pipes. Pipes don't make water bitter, yodchi. Grief does. ...I'm Surayyo. The mirab. The last one.|С весны. Мне никто не верит. Певцы говорят — трубы. Трубы воду горькой не делают, ёдчи. Горе делает. ...Я Сурайё. Мираб. Последняя.|Bahordan beri. Hech kim ishonmaydi. Xonandalar quvurlar aybdor deydi. Quvur suvni achchiq qilmaydi, yodchi. G'am qiladi. ...Men Surayyo. Mirob. Oxirgisi.`],
    () => (sado() ? ['sado', `Surayyo. Like the stars! The seven sisters. I'll never forget that name. ...Tell her I said that.|Сурайё. Как звёзды! Семь сестёр. Я это имя никогда не забуду. ...Скажи ей, что я так сказала.|Surayyo. Yulduzlardek! Yetti opa-singil. Bu ismni hech qachon unutmayman. ...Unga shunday dedi, deb ayt.`] : null),
    ['surayyo', `Every sluice, every tunnel, every crack where his water seeps — I know them. If you're going where the water goes bad, you'll need me. And I need to know why.|Каждый шлюз, каждый туннель, каждую трещину, где сочится его вода, — я знаю. Если ты пойдёшь туда, где портится вода, я тебе пригожусь. А мне надо знать почему.|Har bir shlyuzni, har bir tunnelni, uning suvi sizib chiqadigan har bir yoriqni bilaman. Suv buziladigan joyga borsang, kerak bo'laman. Menga esa sababini bilish kerak.`]
  ], () => {
    f('aryk', 'done'); COMP.join('surayyo', 20); arc('surayyo', 1); rep('tail', 1);
    COMP.note('surayyo', `Surayyo, the Tail's last mirab, walks with you. The water has turned bitter since spring, and she wants to know why.|С тобой идёт Сурайё, последний мираб Хвоста. С весны вода горчит, и она хочет знать почему.|Sen bilan Dumning oxirgi mirobi Surayyo yuribdi. Bahordan beri suv achchiq, u sababini bilmoqchi.`);
    done();
  }));
  FAC.npc('surayyo_t', { name: `Surayyo|Сурайё|Surayyo`, look: 'surayyo', dx: 20, prompt: `Talk to Surayyo|Поговорить с Сурайё|Surayyo bilan gaplashish`, idle: `Surayyo is arguing with a sluice. The sluice is losing.|Сурайё спорит со шлюзом. Шлюз проигрывает.|Surayyo shlyuz bilan bahslashyapti. Shlyuz yutqazyapti.` },
    () => (f('arykNo') && !has('surayyo') && !f('surGone') ? [{ from: 6, to: 21, region: 'tail', spot: 'square' }] : []));
  FAC.talk.surayyo_t = d => play([
    ['surayyo', `Back again? The water's still bitter, if that's what you came to ask.|Опять ты? Вода всё ещё горчит, если ты об этом.|Yana senmi? Suv hali ham achchiq, shuni so'ramoqchi bo'lsang.`]
  ], () => ask(`Surayyo leans on her hook-pole.|Сурайё опирается на шест с крюком.|Surayyo ilgakli xodasiga suyanadi.`, [
    { id: 'join', label: `"I'm going where it goes bad. Come with me."|«Я иду туда, где она портится. Пойдём со мной.»|«Men u buziladigan joyga ketyapman. Men bilan yur.»` },
    { id: 'bye', label: `"Just passing."|«Просто мимо шёл.»|«Shunchaki o'tib ketyapman.»` }
  ], o => {
    if (o.id !== 'join') { d(); return; }
    COMP.join('surayyo', 5); arc('surayyo', 1);
    COMP.note('surayyo', `Surayyo, the Tail's last mirab, walks with you. The water has turned bitter since spring, and she wants to know why.|С тобой идёт Сурайё, последний мираб Хвоста. С весны вода горчит, и она хочет знать почему.|Sen bilan Dumning oxirgi mirobi Surayyo yuribdi. Bahordan beri suv achchiq, u sababini bilmoqchi.`);
    play([['surayyo', `About time. I'll bring bread. You look like a man who forgets to eat.|Давно пора. Хлеба возьму. Ты похож на человека, который забывает поесть.|Vaqti bo'ldi. Non olaman. Ovqatlanishni unutadigan odamga o'xshaysan.`]], d);
  }));

  /* ---------------------------------------------------------------- 2 · The Water Debt (the Cloister) */
  COMP.beat('sur2', () => w('surayyo') && arc('surayyo') >= 1 && COMP.region() === 'cloister' && COMP.story('a1_cloister'), done => play([
    ['', `By the Cloister's water-gate a novice reads from a ledger, and Surayyo stops as if she'd walked into a wall.|У водяных ворот Обители послушница читает по книге, и Сурайё останавливается, будто налетела на стену.|Xonaqohning suv darvozasi oldida bir shogird daftardan o'qiyapti, Surayyo esa devorga urilgandek to'xtab qoladi.`],
    ['', `"Water debt, the Tail, lower rows. Paid by: Surayyo, mirab. Paid in: memory. Thirty-one entries."|«Долг за воду, Хвост, нижние ряды. Оплатила: Сурайё, мираб. Чем: памятью. Тридцать одна запись».|«Suv qarzi, Dum, pastki qatorlar. To'lovchi: Surayyo, mirob. Nima bilan: xotira. O'ttiz bitta yozuv».`],
    ['surayyo', `Don't look at me like that. Somebody has to pay, and I'm the one who knows where the water goes. It's fair.|Не смотри на меня так. Кто-то должен платить, а я единственная, кто знает, куда уходит вода. Это честно.|Menga unday qarama. Kimdir to'lashi kerak, suv qayerga ketishini esa faqat men bilaman. Bu adolatli.`],
    ['surayyo', `I don't remember my mother's face any more. Or the road to the first house we lived in. I remember the sluices. ...Funny, what you keep.|Я уже не помню лица матери. И дороги к первому дому, где мы жили. Шлюзы помню. ...Смешно, что остаётся.|Onamning yuzini endi eslamayman. Birinchi yashagan uyimizga boradigan yo'lni ham. Shlyuzlarni eslayman. ...Qiziq, nima qoladi-ya.`]
  ], () => ask(`Surayyo is already walking on, as if the conversation were over. It isn't.|Сурайё уже идёт дальше, будто разговор окончен. Он не окончен.|Surayyo suhbat tugagandek yo'lida davom etyapti. Lekin tugamagan.`, [
    { id: 'help', label: `"Next time, I'll pay part of it. I'm a yodchi. I know how the books bend."|«В следующий раз часть заплачу я. Я ёдчи. Я знаю, как гнутся эти книги.»|«Keyingi safar bir qismini men to'layman. Men yodchiman. Bu daftarlar qanday egilishini bilaman.»` },
    { id: 'take', label: `Go back to the novice and have the next payment written down in your name.|Вернуться к послушнице и записать следующую уплату на себя.|Shogirdning oldiga qaytib, keyingi to'lovni o'z nomingga yozdirish.` },
    { id: 'quiet', label: `Say nothing. Walk beside her.|Ничего не сказать. Идти рядом.|Hech narsa demay, yonida yurish.` }
  ], o => {
    f('surDebt', o.id); arc('surayyo', 2);
    if (o.id === 'take') { addVoid(8, `the Tail's water debt|долг Хвоста за воду|Dumning suv qarzi`); S(12); COMP.flag('surayyo', 'key_tail', 1); rep('tail', 2); }
    else if (o.id === 'help') { S(8); COMP.flag('surayyo', 'key_tail', 1); }
    else S(5);
    play([['surayyo', {
      help: `Bend them, then. Just don't break yourself doing it. I've got enough to carry.|Ну гни. Только сам не сломайся. Мне и так есть что нести.|Unda egib ko'r. Faqat o'zing sinib qolma. Ko'tarishga o'zimda ham yetarli.`,
      take: `You what? ...You idiot. You kind, stupid — come here. No. Don't. I'll cry, and then I'll hit you.|Ты что? ...Дурак. Добрый, глупый — иди сюда. Нет. Не надо. Я заплачу, а потом тебя ударю.|Nima qilding? ...Ahmoq. Mehribon, tentak — bu yoqqa kel. Yo'q. Kerak emas. Yig'lab yuboraman, keyin seni uraman.`,
      quiet: `...Thank you for not saying anything. Most people say "poor thing". I hate "poor thing".|...Спасибо, что промолчал. Обычно говорят «бедняжка». Ненавижу «бедняжку».|...Indamaganing uchun rahmat. Odatda «bechora» deyishadi. «Bechora»ni yomon ko'raman.`
    }[o.id]]], () => { COMP.note('surayyo', `Surayyo has paid the Tail's water debt in memory for years: thirty-one entries. She no longer remembers her mother's face.|Сурайё годами платит памятью долг Хвоста за воду: тридцать одна запись. Лица матери она уже не помнит.|Surayyo yillardan beri Dumning suv qarzini xotira bilan to'laydi: o'ttiz bitta yozuv. Onasining yuzini endi eslamaydi.`); done(); });
  })));

  /* ---------------------------------------------------------------- 3 · The Roof — a talk by the fire (88g reads COMP.f('rom')) */
  COMP.talk({ id: 'sur_roof', who: 'surayyo', pri: 90, when: () => arc('surayyo') >= 2 && COMP.story('b_cistern'), run: done => {
    const warm = COMP.app('surayyo') >= 40;
    play([
      ['', `Night, the chaikhana roof. Surayyo has brought up two bowls of tea and a blanket that smells of smoke. The city below is all small lights.|Ночь, крыша чайханы. Сурайё принесла наверх две пиалы чая и одеяло, пахнущее дымом. Внизу город — одни маленькие огоньки.|Tun, choyxona tomi. Surayyo tepaga ikki piyola choy va tutun hidi kelib turgan ko'rpa olib chiqqan. Pastda shahar — mayda chiroqlardan iborat.`],
      () => (sado() ? ['sado', `Seven. Seven, look — the Pleiades. Her stars. Ravshan, count them with me.|Семь. Семь, смотри — Плеяды. Её звёзды. Равшан, посчитай со мной.|Yetti. Yetti, qara — Hulkar. Uning yulduzlari. Ravshan, men bilan sana.`] : null),
      ['hero', `...Five. Six. Seven.|...Пять. Шесть. Семь.|...Besh. Olti. Yetti.`],
      ['surayyo', `You count the stars like you count debts. ...Do you know what I'm afraid of? Not dying. Forgetting someone and not noticing. Going on smiling at a stranger.|Ты считаешь звёзды, как долги. ...Знаешь, чего я боюсь? Не смерти. Забыть кого-то и не заметить. Так и улыбаться чужому человеку.|Yulduzlarni qarzni sanagandek sanaysan. ...Nimadan qo'rqishimni bilasanmi? O'limdan emas. Kimnidir unutib, buni sezmay qolishdan. Begona odamga jilmayib yuraverishdan.`],
      warm ? ['surayyo', `If I forget you — remind me. Just don't pity me. Promise.|Если я тебя забуду — напомни. Только не жалей. Обещай.|Agar seni unutsam — eslatib qo'y. Faqat achinma. Va'da ber.`] : ['surayyo', `If I ever forget the sluices, somebody will have to remind me. ...Don't look so worried. It won't be you. You'd pity me.|Если я когда-нибудь забуду шлюзы, кому-то придётся мне напомнить. ...Не делай такое лицо. Не тебе. Ты бы жалел.|Agar qachondir shlyuzlarni unutsam, kimdir eslatishi kerak bo'ladi. ...Bunaqa xavotirlanma. Sen emas. Sen achinasan.`]
    ], () => {
      arc('surayyo', 3);
      if (!warm) { f('rom', f('rom') || 'friend'); done(); return; }
      ask(`Surayyo is looking at the stars, not at you. Carefully not at you.|Сурайё смотрит на звёзды, а не на тебя. Очень старательно не на тебя.|Surayyo senga emas, yulduzlarga qarayapti. Juda tirishib senga qaramayapti.`, [
        { id: 'yes', label: `"I'll remind you. Every morning, if I have to."|«Напомню. Каждое утро, если понадобится.»|«Eslatib qo'yaman. Kerak bo'lsa, har tong.»` },
        { id: 'friend', label: `"I'll remind you. That's what friends are for."|«Напомню. На то и друзья.»|«Eslatib qo'yaman. Do'st shuning uchun bor.»` }
      ], o => {
        f('rom', o.id); S(o.id === 'yes' ? 10 : 5);
        play([['surayyo', o.id === 'yes'
          ? `...Good. Then I'm not afraid. Well, a little. Give me your hand. No, the other one, that one's always on the sabre.|...Хорошо. Тогда я не боюсь. Ну, немножко. Дай руку. Нет, другую, эта у тебя всегда на сабле.|...Yaxshi. Unda qo'rqmayman. Xo'p, ozgina. Qo'lingni ber. Yo'q, boshqasini, bunisi doim qilichda.`
          : `Friends. Good. I've got plenty of those, and none of them can count like you. Drink your tea.|Друзья. Хорошо. Друзей у меня много, и никто из них не умеет так считать. Пей чай.|Do'stlar. Yaxshi. Do'stlarim ko'p, lekin hech biri senday sanay olmaydi. Choyingni ich.`]], () => {
          COMP.note('surayyo', o.id === 'yes' ? `On the chaikhana roof Surayyo asked you to remind her of you if she forgets. You promised to, every morning.|На крыше чайханы Сурайё попросила напомнить ей о тебе, если она забудет. Ты пообещал — хоть каждое утро.|Choyxona tomida Surayyo agar seni unutsa, eslatib qo'yishingni so'radi. Har tong bo'lsa ham, deb va'da berding.` : `On the chaikhana roof you counted the Pleiades with Surayyo. Friends.|На крыше чайханы вы с Сурайё считали Плеяды. Друзья.|Choyxona tomida Surayyo bilan Hulkarni sanadinglar. Do'stlar.`);
          done();
        });
      });
    });
  } });

  /* ---------------------------------------------------------------- 4 · A Stranger's Face (Old Yodgor) */
  COMP.beat('sur4', () => w('surayyo') && arc('surayyo') >= 3 && COMP.region() === 'old', done => play([
    ['', `In the middle of a fight Surayyo turns, sees you, and swings the hook at your head. You duck. She stares at you, the pole still raised.|Посреди схватки Сурайё оборачивается, видит тебя и замахивается крюком тебе в голову. Ты пригибаешься. Она смотрит на тебя, шест всё ещё поднят.|Jang o'rtasida Surayyo o'girilib, seni ko'radi va ilgagini boshingga siltaydi. Sen engashib qolasan. U xodasini ko'targanicha senga tikilib qoladi.`],
    ['surayyo', `Who — ...Ravshan. Ravshan. I know. I know you. One second. It was one second.|Кто — ...Равшан. Равшан. Знаю. Я тебя знаю. Одну секунду. Это была одна секунда.|Kim — ...Ravshan. Ravshan. Bilaman. Seni bilaman. Bir soniya. Atigi bir soniya edi.`],
    () => (f('rom') === 'yes' ? ['surayyo', `You promised to remind me. You didn't even have to. That's what scares me.|Ты обещал напомнить. Тебе даже не пришлось. Вот что страшно.|Eslatib qo'yishga va'da bergansan. Hatto kerak ham bo'lmadi. Qo'rqinchlisi shu.`] : ['surayyo', `Don't tell the others. Please. Not yet.|Не говори остальным. Пожалуйста. Пока не надо.|Boshqalarga aytma. Iltimos. Hozircha kerak emas.`])
  ], () => ask(`Her hands are shaking on the pole.|У неё дрожат руки на шесте.|Xodadagi qo'llari titrayapti.`, [
    { id: 'name', label: `"Ravshan. Yodchi. I owe you a bowl of tea and a promise." Say it plainly, like a fact.|«Равшан. Ёдчи. Я тебе должен пиалу чая и обещание». Сказать просто, как факт.|«Ravshan. Yodchi. Senga bir piyola choy va bitta va'da qarzdorman». Oddiy, haqiqatdek aytish.` },
    { id: 'joke', label: `"You missed. That's how I knew it was you."|«Ты промахнулась. По этому я и понял, что это ты.»|«Tegmading. Shundan bildimki, bu sensan.»` }
  ], o => {
    arc('surayyo', 4); S(o.id === 'name' ? 8 : 6); f('sur4', o.id);
    play([['surayyo', o.id === 'name' ? `...Yes. That's right. That's exactly right. Say it again sometime when I'm not holding a hook.|...Да. Всё так. Именно так. Скажи ещё раз, когда у меня в руках не будет крюка.|...Ha. To'g'ri. Xuddi shunday. Qo'limda ilgak bo'lmaganda yana bir marta ayt.` : `Ha! ...Ha. I'd hit you next time, you know. On purpose. Thank you.|Ха! ...Ха. В следующий раз попаду, знаешь. Нарочно. Спасибо.|Ha! ...Ha. Keyingi safar tegizaman, bilib qo'y. Ataylab. Rahmat.`]], () => {
      COMP.note('surayyo', `In Old Yodgor Surayyo didn't know you for a second. It is getting worse, and she knows it. On the Spine, they say, an old mirab lives alone.|В Старом Ёдгоре Сурайё на секунду тебя не узнала. Становится хуже, и она это знает. Говорят, на Хребте живёт один старый мираб.|Eski Yodgorda Surayyo bir soniya seni tanimadi. Ahvol yomonlashyapti, u buni biladi. Aytishlaricha, Umurtqada bir keksa mirob yolg'iz yashaydi.`, ['spine', 'hamid']);
      done();
    });
  })));

  /* ---------------------------------------------------------------- 5 · A Tumar for Two (the Spine) */
  FAC.spot('spine', 'hamid', 0.3);
  FAC.npc('hamid', { name: CAST.mirab.name, look: { robe: '#4a5a6a', trim: '#c8d0d8', skin: '#a07858', head: 'turban', headC: '#e8e8f0', beard: 'long' }, dx: 24, prompt: `Talk to the old mirab|Поговорить со старым мирабом|Keksa mirob bilan gaplashish`, idle: `The old mirab is listening to the ice crack, like a man listening to a song he knows.|Старый мираб слушает, как трещит лёд, — будто песню, которую знает.|Keksa mirob muzning yorilishini tanish qo'shiqni tinglagandek tinglayapti.` },
    () => (arc('surayyo') >= 4 && !f('surTumar') ? [{ from: 0, to: 24, region: 'spine', spot: 'hamid' }] : []));
  FAC.talk.hamid = d => {
    if (!w('surayyo')) { play([['mirab', `Bring the mirab. The one who's forgetting. I don't talk about people behind their backs; there's too much wind up here.|Приведи мираба. Ту, что забывает. За спиной у людей я не говорю: тут слишком ветрено.|Mirobni olib kel. Unutayotganini. Odamning orqasidan gapirmayman: bu yerda shamol juda kuchli.`]], d); return; }
    play([
      ['mirab', `Thirty-one payments, by the look of her. I paid twenty-six before I came up here. ...There's a way to keep what's left. Every way costs.|Тридцать одна уплата, судя по ней. Я заплатил двадцать шесть, прежде чем сюда забрался. ...Сохранить то, что осталось, можно. Любой способ стоит дорого.|Ko'rinishidan, o'ttiz bitta to'lov. Men bu yerga chiqishdan oldin yigirma oltitasini to'laganman. ...Qolganini saqlab qolsa bo'ladi. Har bir yo'lning bahosi bor.`],
      ['mirab', `Seal her in a tumar, and keep the tumar filled. Filled with someone who remembers her — every laugh, every curse at a sluice. Your memory of her goes in. You'll know her name and nothing else.|Запечатать её в тумар и держать тумар полным. Полным тем, кто её помнит: каждый смех, каждое ругательство у шлюза. Туда уйдёт твоя память о ней. Ты будешь знать её имя — и больше ничего.|Uni tumarga muhrlab, tumarni to'la saqlash. Uni eslaydigan odam bilan to'la: har bir kulgisi, shlyuzdagi har bir so'kinishi. Uning haqidagi xotirang o'sha yerga ketadi. Ismini bilasan — boshqa hech narsani.`],
      ['mirab', `Or she stops being a mirab. No more paying for the rows. Somebody else pays, or nobody does, and the lower rows go dry.|Или она перестаёт быть мирабом. Больше не платит за ряды. Платит кто-то другой — или никто, и нижние ряды пересохнут.|Yoki u mirob bo'lishdan to'xtaydi. Qatorlar uchun boshqa to'lamaydi. Boshqa kimdir to'laydi — yoki hech kim, va pastki qatorlar quriydi.`],
      ['surayyo', `...I'm right here, you know. Both of you. Talking about my head like it's a sluice.|...Я вообще-то здесь. Вы оба. Обсуждаете мою голову, как шлюз.|...Men shu yerdaman-ku. Ikkalangiz ham. Boshimni shlyuzni muhokama qilgandek muhokama qilyapsizlar.`]
    ], () => {
      const third = FAC.check('mem', 9).ok && (R().trust || 0) >= 4;
      ask(`The wind pulls at the old man's beard. Surayyo has stopped joking.|Ветер треплет бороду старика. Сурайё перестала шутить.|Shamol cholning soqolini yulqilayapti. Surayyo hazillashishni bas qildi.`, [
        { id: 'mine', label: `"Take my memory of her. I'll learn her again."|«Возьми мою память о ней. Я выучу её заново.»|«Uning haqidagi xotiramni ol. Uni qaytadan o'rganaman.»` },
        { id: 'quit', label: `"Let the Tail find another mirab. She's paid enough."|«Пусть Хвост найдёт другого мираба. Она заплатила достаточно.»|«Dum boshqa mirob topsin. U yetarlicha to'ladi.»` },
        FAC.chk('mem', 9, `Hum the craft's oldest tune into her tumar: keep the memories, let the debt flow through like water. (Sado must trust you.)|Напеть в её тумар самый старый напев ремесла: удержать воспоминания, а долг пропускать, как воду. (Садо должна тебе доверять.)|Uning tumariga hunarning eng qadimgi kuyini kuylash: xotiralarni ushlab qolish, qarzni esa suvdek o'tkazib yuborish. (Sado senga ishonishi kerak.)`, { id: 'third', ok: third }),
        { id: 'none', label: `"No. We'll find another way, or we won't."|«Нет. Найдём другой способ — или не найдём.»|«Yo'q. Boshqa yo'l topamiz — yoki topmaymiz.»` }
      ], o => {
        let res = o.id;
        if (o.id === 'third' && !third) res = 'failed';
        f('surTumar', res); arc('surayyo', 5); COMP.flag('surayyo', 'key_sluices', 1);
        const tail = {
          mine: [['', `The old man sings, and pulls. It feels like a thread drawn through a needle's eye, backwards. When it's over, the woman beside you is a stranger with a kind, worried face.|Старик поёт и тянет. Будто нитку протаскивают через игольное ушко задом наперёд. Когда всё кончается, женщина рядом — незнакомка с добрым, встревоженным лицом.|Chol kuylaydi va tortadi. Go'yo ipni igna ko'zidan teskari tortishyapti. Hammasi tugagach, yoningdagi ayol — mehribon, xavotirli yuzli notanish odam.`], ['surayyo', `Hello. I'm Surayyo. I'm told you did something very stupid for me. ...Thank you. Let's start again.|Здравствуй. Я Сурайё. Говорят, ты сделал ради меня что-то очень глупое. ...Спасибо. Давай заново.|Salom. Men Surayyoman. Aytishlaricha, men uchun juda tentak ish qilibsan. ...Rahmat. Keling, boshidan boshlaymiz.`]],
          quit: [['surayyo', `Somebody else pays. ...I've never been somebody else's debt before. I don't know if I can stand it.|Платит кто-то другой. ...Я никогда не была чужим долгом. Не знаю, выдержу ли.|Boshqa kimdir to'laydi. ...Hech qachon birovning qarzi bo'lmaganman. Bardosh berolamanmi, bilmayman.`]],
          third: [['', `You hum the oldest tune of the craft, the one Rustam-aka never taught you. Sado hums it with you. The tumar warms. Surayyo blinks — and says, surprised, "My mother had a gap in her teeth."|Ты напеваешь самый старый напев ремесла — тот, которому Рустам-ака тебя так и не научил. Садо подпевает. Тумар теплеет. Сурайё моргает и удивлённо говорит: «У мамы была щербинка в зубах».|Sen hunarning eng qadimgi kuyini xirgoyi qilasan — Rustam aka senga hech o'rgatmagan kuyni. Sado jo'r bo'ladi. Tumar iliydi. Surayyo ko'zini pirpiratib, hayron bo'lib aytadi: «Onamning tishida tirqish bor edi».`]],
          failed: [['', `The tune slips. The tumar stays cold. The old man shakes his head: not today, not by you.|Напев срывается. Тумар остаётся холодным. Старик качает головой: не сегодня и не тебе.|Kuy uziladi. Tumar sovuqligicha qoladi. Chol bosh chayqaydi: bugun emas, sen emas.`]],
          none: [['surayyo', `Good. I'd rather forget with my eyes open than be saved with them closed. ...Probably. Ask me again tomorrow.|Хорошо. Лучше забывать с открытыми глазами, чем спасаться с закрытыми. ...Наверное. Спроси меня завтра.|Yaxshi. Ko'zim yumuq qutqarilgandan ko'ra, ochiq ko'z bilan unutganim yaxshi. ...Ehtimol. Ertaga yana so'ra.`]]
        }[res];
        if (res === 'mine') { addVoid(15, `your memory of her|твоя память о ней|u haqidagi xotirang`); S(15); }
        if (res === 'quit') { rep('tail', -2); S(5); }
        if (res === 'third') { S(15); trust(1); }
        if (res === 'none' || res === 'failed') S(0);
        play(tail, () => { COMP.note('surayyo', { mine: `You gave the old mirab your memory of Surayyo. Hers is safe. You are learning her again.|Ты отдал старому мирабу свою память о Сурайё. Её память спасена. Ты знакомишься с ней заново.|Keksa mirobga Surayyo haqidagi xotirangni berding. Uning xotirasi saqlanib qoldi. Sen u bilan qaytadan tanishyapsan.`, quit: `Surayyo gave up being the mirab. Her memory stops draining; the Tail's lower rows must pay another way.|Сурайё перестала быть мирабом. Память больше не уходит; нижним рядам Хвоста придётся платить иначе.|Surayyo mirob bo'lishdan voz kechdi. Xotirasi endi ketmaydi; Dumning pastki qatorlari boshqacha to'lashi kerak.`, third: `Through the oldest tune of the craft you kept Surayyo's memory and let the debt flow through it like water.|Самым старым напевом ремесла ты удержал память Сурайё, а долг пропускаешь сквозь неё, как воду.|Hunarning eng qadimgi kuyi bilan Surayyoning xotirasini saqlab qolding, qarzni esa undan suvdek o'tkazib yuborasan.`, failed: `The oldest tune slipped. Surayyo is still forgetting.|Самый старый напев сорвался. Сурайё всё ещё забывает.|Eng qadimgi kuy uzildi. Surayyo hali ham unutyapti.`, none: `You refused every way the old mirab offered. Surayyo is still forgetting.|Ты отказался от всех способов старого мираба. Сурайё всё ещё забывает.|Keksa mirob taklif qilgan hamma yo'llardan voz kechding. Surayyo hali ham unutyapti.` }[res]); d(); });
      });
    });
  };

  /* ---------------------------------------------------------------- knowing his name (Nargiza believes, or Turab's tales) */
  COMP.beat('sur_obi', () => has('surayyo') && (F().nargizaQ === 'believes' || F().name) && !COMP.flag('surayyo', 'knows_obi'), done => {
    COMP.flag('surayyo', 'knows_obi', 1);
    play([['surayyo', `Obi-Hayot. The water of life. ...The old mirabs had a song with that in it. I thought it was about a river. It was about him.|Оби-Хаёт. Вода жизни. ...У старых мирабов была песня, где это есть. Я думала, она про реку. Она была про него.|Obi-Hayot. Hayot suvi. ...Keksa miroblarning shunday so'z bor qo'shig'i bo'lardi. Daryo haqida deb o'ylardim. U haqida ekan.`]], done);
  });

  /* ---------------------------------------------------------------- 6 · The Pleiades (before the last night) */
  COMP.beat('sur6', () => w('surayyo') && arc('surayyo') >= 2 && COMP.story('a3_house') && !f('surEnd6'), done => play([
    ['surayyo', `If he wakes, someone has to open the lower sluices, or the Tail drowns in its sleep. I know the wheels. It's me. Don't argue.|Если он проснётся, кто-то должен открыть нижние шлюзы, иначе Хвост утонет во сне. Колёса знаю я. Значит, я. Не спорь.|Agar u uyg'onsa, kimdir pastki shlyuzlarni ochishi kerak, bo'lmasa Dum uyqusida cho'kib ketadi. G'ildiraklarni men bilaman. Demak, men. Bahslashma.`],
    () => (f('rom') === 'yes' ? ['surayyo', `And if he sleeps on, and the city stays as it is... I'd still like to have tea on a roof with you. That's all. That's my whole plan.|А если он будет спать дальше и город останется прежним... я всё равно хотела бы пить с тобой чай на крыше. Вот и всё. Весь мой план.|Agar u uxlashda davom etsa-yu, shahar avvalgidek qolsa... baribir sen bilan tomda choy ichishni xohlardim. Shu, xolos. Butun rejam shu.`] : null)
  ], () => ask(`Surayyo is checking the hook of her pole, the way soldiers check a blade.|Сурайё проверяет крюк своего шеста — так солдаты проверяют клинок.|Surayyo xodasining ilgagini askar tig'ni tekshirgandek tekshiryapti.`, [
    FAC.chk('agi', 7, `"Then I'm coming to the sluices with you. Two people turn a wheel faster."|«Тогда я иду к шлюзам с тобой. Вдвоём колесо крутится быстрее.»|«Unda shlyuzlarga sen bilan boraman. Ikki kishi g'ildirakni tezroq aylantiradi.»`, { id: 'with' }),
    { id: 'trust', label: `"I won't argue. Come back."|«Не буду спорить. Возвращайся.»|«Bahslashmayman. Qaytib kel.»` }
  ], o => {
    f('surEnd6', o.id === 'with' && (o.ok || COMP.app('surayyo') >= 70) ? 'with' : 'alone'); arc('surayyo', 6);
    play([['surayyo', f('surEnd6') === 'with' ? `Fine. You take the left wheel. It sticks. Swear at it, it helps.|Ладно. Тебе левое колесо. Оно заедает. Ругайся на него, помогает.|Mayli. Chap g'ildirak seniki. U qisilib qoladi. So'kin, yordam beradi.` : `I will. I always come back. Ask anyone in the Tail. ...Don't ask them, actually.|Вернусь. Я всегда возвращаюсь. Спроси кого угодно в Хвосте. ...Нет, лучше не спрашивай.|Qaytaman. Men doim qaytaman. Dumda xohlagan odamdan so'ra. ...Yo'q, yaxshisi so'rama.`]], done);
  })));

  /* ---------------------------------------------------------------- outcomes: the epilogue */
  SIDE.epi('surayyo', e => {
    if (!f('aryk') && !has('surayyo')) return null;
    if (f('surGone')) return `Surayyo went back to her sluices and never spoke your name again. The water in the Tail runs on time. She sees to that, and to nothing else.|Сурайё вернулась к своим шлюзам и больше ни разу не произнесла твоего имени. Вода в Хвосте приходит вовремя. Об этом она заботится — и больше ни о чём.|Surayyo shlyuzlariga qaytdi va boshqa hech qachon ismingni tilga olmadi. Dumda suv o'z vaqtida keladi. U shunga qaraydi — boshqa hech narsaga emas.`;
    const rom = f('rom') === 'yes', kept = ['mine', 'quit', 'third'].includes(f('surTumar'));
    if (e === 'awake' && f('surEnd6') === 'alone') return `When he woke, Surayyo opened the lower sluices alone, and the Tail did not drown. The water took the woman who knew every wheel. They named the new canal after her. It runs sweet.|Когда он проснулся, Сурайё в одиночку открыла нижние шлюзы, и Хвост не утонул. Вода забрала женщину, которая знала каждое колесо. Новый канал назвали её именем. Вода в нём сладкая.|U uyg'onganda Surayyo pastki shlyuzlarni yolg'iz ochdi va Dum cho'kmadi. Suv har bir g'ildirakni biladigan ayolni olib ketdi. Yangi kanalga uning ismini qo'yishdi. Suvi shirin.`;
    if (e === 'chain' && !(rom && COMP.app('surayyo') >= 70)) return `The Divan made Surayyo mirab of the whole city, for the Tail's water. She took it, and left you without a word, because she couldn't find one. The water in the Tail has never been so sweet, or so watched.|Диван сделал Сурайё мирабом всего города — ради воды Хвоста. Она согласилась и ушла от тебя без слов, потому что не нашла нужного. Вода в Хвосте ещё никогда не была такой сладкой — и такой поднадзорной.|Devon Surayyoni Dumning suvi evaziga butun shaharning mirobi qildi. U rozi bo'ldi va sendan indamay ketdi, chunki kerakli so'zni topolmadi. Dumda suv hech qachon bunchalik shirin — va bunchalik nazoratda bo'lmagan.`;
    if (!rom) return `Surayyo stayed your friend, the loud kind: the one who brings bread unasked and tells you the truth before you've had your tea.|Сурайё осталась тебе другом — громким: тем, кто приносит хлеб без спросу и говорит правду раньше, чем ты допил чай.|Surayyo senga do'st bo'lib qoldi — shovqinli do'st: so'ramasdan non olib keladigan, choyingni ichib bo'lmasingdan rostini aytadigan.`;
    if (kept) return `A house by the aryk. Water in the Tail. Surayyo laughs louder than anyone, at the sluices, at the neighbours, at you. On clear nights you count the Pleiades together, and she always gets to seven first.|Дом у арыка. Вода в Хвосте. Сурайё смеётся громче всех — над шлюзами, над соседями, над тобой. В ясные ночи вы вместе считаете Плеяды, и до семи она всегда доходит первой.|Ariq bo'yidagi uy. Dumda suv. Surayyo hammadan baland kuladi — shlyuzlarga, qo'shnilarga, senga. Tiniq tunlarda Hulkarni birga sanaysizlar, yettiga esa doim u birinchi yetadi.`;
    return `Every morning she asks who you are. Every morning you tell her: Ravshan, a yodchi who owes her a bowl of tea and a promise. Every morning she laughs, as if she has heard it for the first time. She has.|Каждое утро она спрашивает, кто ты. Каждое утро ты отвечаешь: Равшан, ёдчи, который должен ей пиалу чая и обещание. Каждое утро она смеётся, будто слышит это впервые. Так и есть.|Har tong u kimligingni so'raydi. Har tong javob berasan: Ravshan, unga bir piyola choy va bitta va'da qarzdor yodchi. Har tong u buni birinchi marta eshitayotgandek kuladi. Shunday ham.`;
  }, 'tail:awake');
  // approval fell: she goes back to her sluices (86 calls PARTY.hooks.leave for the approval threshold)
  G.PARTY && G.PARTY.on && G.PARTY.on('leave', (id, why) => { if (why === 'approval') { if (id === 'surayyo') f('surGone', 1); if (id === 'alp') f('alpGone', 1); if (id === 'nargiza') f('nargizaEnd', 'left'); } });
}

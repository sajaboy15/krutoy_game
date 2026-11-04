/* 88f_comp_knot.js — the Alp–Nargiza knot (GDD ch. 7): the captain who sold Nargiza's brother was Alp.
   You learn it first — from the debt book's "A." once you've seen Alp's ledger, or from Bekzod's tumar (88d). Then:
     tell them now · let them find it out themselves · hide it for good (a Backbone check; fail it and it comes out at
     the Heart, at the worst time)
   Outcomes (COMP.f('knot')):
     forgive  — only if Alp has his memory back and repents, and Nargiza trusts you a great deal: they fight as a pair
     truce    — both stay, but won't walk together: only one of them at a time
     break    — one of them leaves (the one who trusts you less)
     revenge  — hidden, and it came out at the Heart: Nargiza goes for Alp. You step in, or you don't.
     hidden   — it never comes out */
{
  const has = COMP.has, f = COMP.f, app = COMP.app;
  const alpRemembers = () => ['returned', 'choice'].includes(F().alpTumars) || ['redeemed'].includes(f('alpPath'));

  // you know first
  COMP.beat('knot1', () => f('knotKnown') && has('alp') && has('nargiza') && !f('knot'), done => play([
    ['', `You know something Nargiza doesn't, and something Alp has buried. Lot sixty. The boy who whistled. The captain with full eyes.|Ты знаешь то, чего не знает Наргиза, и то, что Алп закопал. Лот шестьдесят. Мальчишка, который свистел. Капитан с полными глазами.|Sen Nargiza bilmaydigan va Alp ko'mib tashlagan narsani bilasan. Oltmishinchi lot. Hushtak chalgan bola. Ko'zlari to'la kapitan.`],
    () => (sadoAwake() ? ['sado', `Whatever you do, someone gets hurt. ...I'm sorry. I don't have a better answer. I looked.|Что бы ты ни сделал, кому-то будет больно. ...Прости. Лучшего ответа у меня нет. Я искала.|Nima qilsang ham, kimgadir og'ir bo'ladi. ...Kechir. Yaxshiroq javobim yo'q. Qidirdim.`] : null)
  ], () => ask(`They are both by the fire. Alp is mending a sandal. Nargiza is humming.|Они оба у огня. Алп чинит сандалию. Наргиза что-то напевает.|Ikkalasi ham olov yonida. Alp kovush tuzatyapti. Nargiza xirgoyi qilyapti.`, [
    { id: 'tell', label: `Tell them both. Now, here, by the fire.|Рассказать обоим. Сейчас, здесь, у огня.|Ikkalasiga aytish. Hozir, shu yerda, olov yonida.` },
    { id: 'letfind', label: `Say nothing. It's theirs to find, not yours to hand over.|Промолчать. Это им находить, а не тебе вручать.|Indamaslik. Buni ular topishi kerak, sen topshirishing emas.` },
    FAC.chk('backbone', 3, `Bury it. Make sure nobody ever finds it.|Закопать. Сделать так, чтобы никто никогда не нашёл.|Ko'mib tashlash. Hech kim hech qachon topmasligi uchun.`, { id: 'hide' })
  ], o => {
    if (o.id === 'hide') {
      if (o.ok) { f('knot', 'hidden'); COMP.note('knot', `You buried what you learned about Alp and Nargiza's brother. Nobody will find it.|Ты закопал то, что узнал об Алпе и брате Наргизы. Никто не найдёт.|Alp va Nargizaning akasi haqida bilganingni ko'mib tashlading. Hech kim topmaydi.`); done(); return; }
      f('knot', 'buried'); COMP.note('knot', `You tried to bury what you learned about Alp and Nargiza's brother. You didn't dig deep enough.|Ты попытался закопать то, что узнал об Алпе и брате Наргизы. Закопал неглубоко.|Alp va Nargizaning akasi haqida bilganingni ko'mib tashlashga urinding. Chuqur ko'mmading.`); done(); return;
    }
    if (o.id === 'letfind') { f('knot', 'pending'); COMP.note('knot', `You know Alp was the captain who sold Nargiza's brother, and you've decided to let them find out themselves.|Ты знаешь, что Алп — тот капитан, что продал брата Наргизы, и решил: пусть узнают сами.|Alp Nargizaning akasini sotgan kapitan ekanini bilasan va o'zlari bilib olishsin, deb qaror qilding.`); done(); return; }
    reveal(done, 'told');
  })));

  // the scene itself: by the fire (told), or later when they find it themselves
  function reveal(done, how) {
    const cut = f('bekzod') === 'cut';
    play([
      how === 'told' ? ['hero', `Nargiza. The captain on the Rabat road, the one with the light behind him. Lot sixty. It was Alp.|Наргиза. Капитан на Рабатской дороге, тот, у кого свет за спиной. Лот шестьдесят. Это был Алп.|Nargiza. Rabot yo'lidagi kapitan, orqasida yorug'lik bo'lgan. Oltmishinchi lot. Bu Alp edi.`]
        : ['', `It comes out the way these things do: a word too many by the fire. Nargiza goes very still. Alp puts down the sandal.|Это выходит наружу, как всегда: одно лишнее слово у огня. Наргиза замирает. Алп откладывает сандалию.|Bunday narsalar odatdagidek chiqadi: olov yonida bitta ortiqcha so'z. Nargiza qotib qoladi. Alp kovushni qo'yadi.`],
      cut ? ['nargiza', `The man with no face. That's why. You took his face out of it. ...You took it out for him, or for me?|Человек без лица. Вот почему. Ты вынул из тумара его лицо. ...Ради него или ради меня?|Yuzsiz odam. Shuning uchun ekan. Uning yuzini tumardan olib tashlagansan. ...Uning uchunmi yo men uchunmi?`] : ['nargiza', `...He whistled. Did you hear him whistle, Alp? Before you said "note it"?|...Он свистел. Ты слышал, как он свистел, Алп? Перед тем как сказать «запиши»?|...U hushtak chalardi. Hushtagini eshitganmiding, Alp? «Yozib qo'y» deyishingdan oldin?`],
      alpRemembers() ? ['alp', `Yes. I heard it. I thought: that boy will be trouble on the road. ...That's what I thought. I'm sorry. It's a small word.|Да. Слышал. Подумал: с этим мальчишкой в дороге будут хлопоты. ...Вот что я подумал. Прости. Это маленькое слово.|Ha. Eshitganman. O'yladim: bu bola bilan yo'lda tashvish bo'ladi. ...Shuni o'ylaganman. Kechir. Bu kichkina so'z.`]
        : ['alp', `I don't remember him. One. Two. Three. ...That's worse, isn't it. I'd remember him if he'd mattered to me.|Я его не помню. Раз. Два. Три. ...Так ведь хуже. Помнил бы — если бы он для меня что-то значил.|Uni eslamayman. Bir. Ikki. Uch. ...Bu yomonroq-a? Men uchun ahamiyati bo'lganida, eslab qolardim.`]
    ], () => {
      const nA = app('nargiza'), aA = app('alp');
      let out;
      if (alpRemembers() && nA >= 70 && aA >= 40) out = 'forgive';
      else if (nA >= 40) out = 'truce';
      else out = 'break';
      if (how === 'found') app('nargiza', -10, 'knot');
      settle(out, done);
    });
  }
  function settle(out, done) {
    f('knot', out);
    if (out === 'forgive') {
      COMP.flag('alp', 'bond', 1); COMP.flag('nargiza', 'bond', 1);
      play([
        ['nargiza', `I'm not going to forgive you tonight. Maybe not this year. ...But I'll sing next to you. He'd have liked you, you know. He liked big, quiet people.|Сегодня я тебя не прощу. Может, и в этом году нет. ...Но петь рядом с тобой буду. Ты бы ему понравился, знаешь. Он любил больших и тихих.|Bugun seni kechirmayman. Balki bu yil ham. ...Lekin yoningda kuylayman. Bilasanmi, unga yoqqan bo'larding. U katta, jim odamlarni yaxshi ko'rardi.`],
        ['alp', `Then I'll be quiet. That I can do.|Тогда я буду молчать. Это я умею.|Unda jim turaman. Buni eplayman.`]
      ], () => { COMP.end('knot', 'forgive', `Nargiza hasn't forgiven Alp. She sings beside him anyway. In a fight they move as one.|Наргиза не простила Алпа. Но всё равно поёт рядом с ним. В бою они действуют как одно целое.|Nargiza Alpni kechirmadi. Shunga qaramay, uning yonida kuylaydi. Jangda ular bir butundek harakat qilishadi.`); done(); });
    } else if (out === 'truce') {
      play([['nargiza', `I'll stay. He'll stay. Just don't ask me to walk beside him. Not yet. Maybe not ever.|Я останусь. Он останется. Только не проси меня идти с ним рядом. Пока нет. Может, никогда.|Men qolaman. U ham qoladi. Faqat yonma-yon yurishimizni so'rama. Hozircha yo'q. Balki hech qachon.`]], () => { COMP.end('knot', 'truce', `A cold truce: Alp and Nargiza both stay with you, but won't walk together.|Холодное перемирие: Алп и Наргиза оба остаются с тобой, но вместе не ходят.|Sovuq sulh: Alp ham, Nargiza ham sen bilan qolishadi, lekin birga yurishmaydi.`); done(); });
    } else if (out === 'break') {
      const goes = app('nargiza') <= app('alp') ? 'nargiza' : 'alp';
      f('knotGone', goes);
      play([[goes, goes === 'nargiza' ? `I can't. I'm sorry, yodchi. I'll hear him every time he breathes.|Не могу. Прости, ёдчи. Я буду слышать его каждый раз, когда он дышит.|Qila olmayman. Kechir, yodchi. Har nafas olganida uni eshitaman.` : `She shouldn't have to look at me. I'll go back to the children. They don't know who I was. ...Lucky.|Ей не должно приходиться на меня смотреть. Я вернусь к детям. Они не знают, кем я был. ...Повезло.|U menga qarashga majbur bo'lmasligi kerak. Bolalarga qaytaman. Ular kim bo'lganimni bilishmaydi. ...Omadli.`]], () => {
        G.PARTY.leave(goes, 'knot'); if (goes === 'alp') f('alpGone', 1); else f('nargizaEnd', 'left');
        COMP.end('knot', 'break', goes === 'nargiza' ? `Nargiza left: she couldn't walk with the man who sold her brother.|Наргиза ушла: она не смогла идти рядом с человеком, который продал её брата.|Nargiza ketdi: akasini sotgan odam bilan yonma-yon yura olmadi.` : `Alp left, so that Nargiza wouldn't have to look at him.|Алп ушёл, чтобы Наргизе не пришлось на него смотреть.|Nargiza unga qarashga majbur bo'lmasin deb, Alp ketdi.`);
        done();
      });
    }
  }

  // let them find out: by the fire, after the Cistern (once both are still with you)
  COMP.talk({ id: 'knot_found', who: ['alp', 'nargiza'], pri: 95, when: () => f('knot') === 'pending' && COMP.story('b_cistern'), run: done => reveal(done, 'found') });

  // buried badly: it comes out at the Heart, at the worst time
  COMP.beat('knot_heart', () => f('knot') === 'buried' && has('alp') && has('nargiza') && COMP.region() === 'heart', done => play([
    ['', `In the Heart's red light, with the whole city's fate on a wheel, Nargiza hears it — not from you; from the Sleeper, who hears everything. She turns to Alp with a Singer's knife.|В красном свете Сердца, когда судьба всего города висит на колесе, Наргиза слышит это — не от тебя; от Спящего, который слышит всё. Она поворачивается к Алпу с ножом Певцов.|Yurakning qizil nurida, butun shaharning taqdiri g'ildirakka osilib turganda, Nargiza buni eshitadi — sendan emas; hamma narsani eshitadigan Uxlovchidan. U xonandalar pichog'i bilan Alpga o'giriladi.`],
    ['nargiza', `You knew. You both knew. Lot sixty, Alp. LOT SIXTY.|Ты знал. Вы оба знали. Лот шестьдесят, Алп. ЛОТ ШЕСТЬДЕСЯТ.|Sen bilarding. Ikkalang ham bilardinglar. Oltmishinchi lot, Alp. OLTMISHINCHI LOT.`],
    ['alp', `...Yes. Do it quickly. My hands are slow now.|...Да. Только быстро. Руки у меня теперь медленные.|...Ha. Faqat tez qil. Qo'llarim endi sekin.`]
  ], () => ask(`Alp doesn't raise his hands.|Алп не поднимает рук.|Alp qo'lini ko'tarmaydi.`, [
    FAC.chk('str', 7, `Step between them and take the knife.|Встать между ними и отобрать нож.|Ular orasiga turib, pichoqni olib qo'yish.`, { id: 'stop' }),
    { id: 'let', label: `Don't move. It's between them.|Не двигаться. Это их дело.|Qimirlamaslik. Bu ularning ishi.` }
  ], o => {
    f('knot', 'revenge');
    if (o.id === 'stop' && o.ok) {
      play([['', `You catch her wrist the way you once caught a convict's. She weighs even less. She drops the knife and walks out of the light, and doesn't come back.|Ты перехватываешь её запястье, как когда-то запястье каторжника. Она весит ещё меньше. Нож падает; она уходит из света и не возвращается.|Uning bilagini bir paytlar mahkumnikini ushlaganingdek ushlaysan. U undan ham yengil. Pichoq tushadi; u yorug'likdan chiqib ketadi va qaytmaydi.`]], () => {
        G.PARTY.leave('nargiza', 'knot'); f('nargizaEnd', 'left');
        COMP.end('knot', 'revenge', `At the Heart Nargiza learned what you'd hidden and went for Alp. You stopped her. She left.|У Сердца Наргиза узнала, что ты скрыл, и бросилась на Алпа. Ты её остановил. Она ушла.|Yurak oldida Nargiza yashirganingni bilib, Alpga tashlandi. Sen uni to'xtatding. U ketdi.`); done();
      });
    } else {
      play([['', `It's quick, as he asked. Nargiza stands over him with the knife and no song at all. Then she sits down beside him and holds his hand until it's cold, humming.|Всё быстро, как он и просил. Наргиза стоит над ним с ножом — и без единой песни. Потом садится рядом, держит его руку, пока та не остынет, и напевает.|Hammasi u so'raganidek tez bo'ladi. Nargiza pichoq bilan uning ustida turibdi — birorta qo'shiqsiz. Keyin yoniga o'tirib, qo'li sovuguncha ushlab, xirgoyi qiladi.`]], () => {
        G.PARTY.leave('alp', 'dead'); f('alpGone', 1); f('alpEnd', 'dead');
        COMP.end('knot', 'revenge', `At the Heart Nargiza learned what you'd hidden and killed Alp. He didn't raise his hands.|У Сердца Наргиза узнала, что ты скрыл, и убила Алпа. Он не поднял рук.|Yurak oldida Nargiza yashirganingni bilib, Alpni o'ldirdi. U qo'lini ko'tarmadi.`); done();
      });
    }
  })));

  // a cold truce: never both at once
  let tk = 0;
  G.WORLD2.ticks.push(() => {
    if (++tk % 120 || f('knot') !== 'truce' || !G.PARTY) return;
    const act = G.PARTY.active();
    if (act.includes('alp') && act.includes('nargiza')) {
      const off = app('alp') < app('nargiza') ? 'alp' : 'nargiza';
      G.PARTY.setActive(off, false);
      toast(t(off === 'alp' ? `Alp stays behind. He and Nargiza don't walk together.|Алп остаётся. С Наргизой они вместе не ходят.|Alp qoladi. U Nargiza bilan birga yurmaydi.` : `Nargiza stays behind. She and Alp don't walk together.|Наргиза остаётся. С Алпом они вместе не ходят.|Nargiza qoladi. U Alp bilan birga yurmaydi.`), '#d9a0a0');
    }
  });

  // the pair: when they forgave, each of them hits a little harder beside the other (the joint moves of GDD ch. 7)
  COMP.bondK = id => (f('knot') === 'forgive' && G.PARTY && G.PARTY.active().includes('alp') && G.PARTY.active().includes('nargiza') && (id === 'alp' || id === 'nargiza')) ? 1.15 : 1;
}

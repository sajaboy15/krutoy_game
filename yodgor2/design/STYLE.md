# YODGOR — dialogue style guide v3 (binding for the second rewrite)

## Why a second rewrite
The author played the v2 script to the end. His verdict, in his words: most Russian lines still sound **unnatural** — "you translate word for word, that is the mistake"; some have **grammar errors**; and the coloured choice tags (green mercy, red cruelty, gold memory) turn every decision into "good choice / bad choice". He wants **grey morality like The Witcher 3: no good and evil, only choices and consequences**, and dialogue whose quality matches Witcher 3, Baldur's Gate 3, Divinity: Original Sin 2 and Pathfinder: WotR. He is a native speaker of Uzbek and Russian and will read every line. Write for him.

## The rules
1. **Write each language from the meaning, never from the words.** Read the scene, understand what the person wants, feels and hides at this moment, then write the line the way that person would really say it *in that language*. The three versions must mean the same thing; their wording, length, word order, idioms may differ freely. If a Russian line could be back-translated word for word into the English, it is probably wrong. Same for Uzbek.
   - Russian: живая разговорная речь, естественный порядок слов, без канцелярита и калек: запрещены «сделать выбор», «это имеет смысл», «я в порядке», «ты стоишь, где стоял», «в этом нет смысла», «позволь мне», «как насчёт», «ты в порядке?», цепочки «который… который», страдательный залог там, где люди говорят активно, «является». Проверяй падежи, согласование, вид глагола, запятые. Читай каждую реплику вслух.
   - Uzbek (Latin, ASCII apostrophe: o', g'): natural spoken literary Uzbek of Tashkent/Fergana, the way people talk in a mahalla or a chaikhana — not a calque of Russian or English, not bookish. Use natural address forms (aka, opa, uka, singlim, bolam, xola, amaki), natural verb forms (-yapti, -di, -ibdi, -sa ham), particles (-chi, -da, -ku, -mi, axir, -u). Avoid literal anatomy/abstract words where people use idioms (e.g. "Umurtqa" for "spine-as-endurance" is wrong; "Harom" carries a religious, meme-like charge — avoid religious loaded words unless a character is religious on purpose).
   - English: clean modern fantasy prose, contractions, no archaisms.
2. **Grey morality. No good and evil, only choices and consequences.**
   - **No moral or intent tags in choice labels.** Remove every `[Mercy]`, `[Kill]`, `[Help]`, `[Lie]`, `[Truth]`, `[Betray]`, `[Burn]`, `[Pay]`, `[Leave]`, `[Persuade]`, `[Threaten]`, `[Take]`, `[Taste]`… in all three languages. A choice is a line the hero says (in quotes «…» / "…" / «…») or a short action in plain words ("Give the founders' tumars to the Singers."). The player must understand what he does from the words, not from a tag.
   - Optional questions in hubs keep a neutral marker so the player sees they do not end the scene: start them with an em dash and no tag, e.g. `— Who are you?|— Кто ты?|— Sen kimsan?`. (Do not use [Ask] any more.)
   - Every option must have a real cost and a real gain. If one option is simply "the good one", rewrite the others or the stakes until it is not. Nobody is fully right: Shirin saves the city, Tilla-bek feeds it, Oydin frees it — each must be able to explain herself/himself convincingly.
   - **The Hollowness cost of an option is hidden** (the engine no longer prints it). Make the cost readable from the meaning when it matters ("You could pay with one of your own memories."), never with numbers.
   - Reactions (Sado, NPCs) are people with views, not the author's verdict. Sado may disagree, be hurt, joke, change her mind; she must not grade choices as right or wrong.
3. **People talk like people.** Short sentences, interruptions, half-sentences, questions back, humour in bad moments. One thought per line, ≤ 220 characters per part.
   - Ravshan — tired, dry, ironic, few words, each one has a point; counts when nervous.
   - Sado — quick, curious, a child's logic and sometimes strangely old; teases, gets scared, asks the question the player is thinking.
   - Rustam (Hollow) — fragments of old habits, polite formulas on repeat; in memories: warm, fatherly, guilty.
   - Shirin — calm, solemn but human; frightening logic, like a mother explaining why the child must suffer.
   - Tilla-bek — polite, witty, generous, cold underneath. Farrukh — jokes to avoid pain. Oydin — hard, fast, bitter, loving underneath. Nargiza — fast, honest, argues, hums when scared. Alp — slow, short sentences, pauses, a rare unexpected joke. Mehri — simple, tired, plain words. Turab — mute (gestures) until his voice returns; then an old storyteller.
4. **Context before choice.** The scene states plainly what happened, what each side wants and what each option will do. Use hubs (`hub()` in 00_base.js) for questions before decisions.
5. **Narration** (speaker `''`): present tense, what you see and what changes, 1–2 sentences, concrete senses (water, wax, apricots, lamp oil, wet clay). No explaining feelings the scene already shows.
6. **Consequences are visible**: a reaction right after a choice, and callbacks later that name what you did.
7. **Lore through people who want something**, never lectures; first mention of a term explained in one plain sentence by someone with a reason to say it.
8. **Spoiler rule (strict):** nothing may hint that Sado is part of Ravshan's memory of his sister Oydin before the reveals in Old Yodgor (Oydin unmasked) and Your House (Sado is the missing piece). Only the honest clues of the clue ladder in BIBLE.md §8 are allowed.
9. **Do not add new companions or systems** (Surayyo, attributes, skill checks come in later stages). Rewrite what exists; you may add lines, questions and small beats inside scenes.

## Before → after (level expected)
BEFORE (v2 label): `[Mercy] Let her go|[Пощадить] Отпустить её|[Rahm] Uni qo'yib yuborish`
AFTER: `"Go. Before I change my mind."|«Иди. Пока я не передумал.»|«Bor. Fikrimdan qaytmasimdan oldin.»`

BEFORE (v2 narration, a calque): «Ты стоишь, где стоял, и не помнишь, куда шёл.»
AFTER: «Стоишь посреди улицы и не помнишь, куда шёл.»

BEFORE (v2 hub question): `[Ask] What will Shirin do to you?|[Спросить] Что с тобой сделает Ширин?|[So'rash] Shirin senga nima qiladi?`
AFTER: `— What will Shirin do to you?|— А что тебе за это будет от Ширин?|— Shirin senga buning uchun nima qiladi?`

## Mechanics you must keep
Keep every id, flag value, `once` key, `R()`/`F()` effect, Hollowness/trust/rep change, `cost`/`price`/`lock` fields, plan id, BARK key, memory id, ENDING id and API call. You may restructure a scene's internal flow as long as the same outcomes and flags stay reachable under the same conditions. Text rules from CONTRACT.md still apply: three parts separated by exactly two `|`, ≤ 220 characters per part, no backticks or `${` inside texts, Uzbek in Latin script only. The build lints the three-part rule.

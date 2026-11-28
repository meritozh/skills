---
name: unslop
description: "Cut AI tells from a piece of writing, by a numbered catalog of patterns: AI vocabulary, filler, hedges, forced threes, dashes, bold labels, metaphor nouns, chatbot phrases, and the Chinese equivalents (值得注意的是, 赋能, 闭环, 不仅…更…). Keeps the meaning and the tone, and leaves code, paths, and quoted text alone. Use when the user asks to unslop or de-AI a text (去 AI 味, 去掉套话), and from technical-writing, which runs it on every doc it touches. Not for choosing a doc's structure or mode, which is technical-writing."
---

# unslop

Run this skill when the user ran `/unslop`, when the request matches the description, or when another skill hands it a text, as `technical-writing` does.

Scan the text for the patterns below, then rewrite each hit. Keep the meaning, the facts, and the intended tone. Leave code, commands, paths, identifiers, quoted text, and citations as they are. When a fix would change what a sentence claims, leave the sentence and say why.

Rule numbers are stable ids that other skills cite, such as `unslop 13`. A removed rule leaves a gap, and a new rule takes the next number.

## Words

1. No AI vocabulary: additionally, crucial, delve, enhance, foster, landscape, pivotal, showcase, testament, underscore, vibrant, seamless, robust, comprehensive, leverage.
2. Use the plain word: "use", not "utilize" or "leverage"; "help", not "facilitate"; "start", not "commence".
3. Say "is" or "has", not "serves as", "stands as", "boasts", or "features".
4. No abstract metaphor nouns: substrate, wedge, vector, nexus, primitive, surface, scaffolding, paradigm, ratchet, north star, flywheel, journey, ecosystem. Use the concrete word.
5. No metaphor, aphorism, personified code, or figurative verb where a literal phrase exists. Code does not "want", "know", or "care".
6. Cut adverbs, or use a stronger verb. Give the number instead of "significantly", "greatly", or "much".
7. One name per thing. Repeat it instead of reaching for a synonym.

## Sentences

8. Cut filler. "In order to" becomes "to". Delete "it is important to note that", "it is worth mentioning", and "basically".
9. No trailing "-ing" phrase that adds no fact ("…, ensuring reliability", "…, highlighting the need").
10. No "not just X, but Y" and no "it's not X, it's Y". State the point.
11. Don't force ideas into threes. List as many as there are.
12. No "from X to Y" unless X and Y sit on a real scale.
13. One hedge at most, and only "may". Delete "arguably", "potentially", "it seems", and "somewhat".
14. No vague attributions ("experts believe", "it is widely known"). Name the source or delete the claim.
15. Say what it does, not how it feels. Name the mechanism or the number. Cut a sentence that could appear unchanged in another project's docs.
16. One idea per sentence. Split a sentence the reader has to reread.
17. Active voice. Name the actor unless it is unknown or does not matter.
18. Write whole sentences with their articles and verbs. Spell out arrows and abbreviations in prose.

## Shape

19. No em dashes, en dashes, or hyphens used as dashes, and no parentheses in their place. Use a period or a comma.
20. A colon goes before a list, an example, or a definition, never mid-sentence as a connector.
21. Don't bold every proper noun or term.
22. No bold label and colon that restates its line ("**Performance:** Performance improved…"). A bold lead-in that ends in a period and adds a new detail is fine.
23. Sentence case headings.
24. No decorative emojis.
25. Straight quotes.
26. No pre-announcing ("This section describes…", "Below you will find…", "Let's look at…"). Start with the content.
27. No generic conclusion ("In summary…", "Overall, this ensures…"). End on the last fact or the next concrete action.

## Conversation

28. No chatbot phrases ("I hope this helps!", "Let me know if…", "Feel free to…").
29. No praise or agreement openers ("Great question", "You're right"). Respond directly.

## Chinese

30. 删掉套话：值得注意的是、需要指出的是、总的来说、综上所述、众所周知、不难发现。
31. 不用空心词：赋能、抓手、闭环、打通、沉淀、颗粒度、心智、助力、深耕、全方位、一站式。用具体的动作和对象。
32. 不用"进行""实现""完成"加名词当动词："进行优化"写"优化"，"实现了对 X 的支持"写"支持 X"。
33. 不写"不仅……更……""不是……而是……"的对仗句，直接说结论。
34. 不凑排比和"首先……其次……最后"，几条就写几条。
35. 一个句子一件事。读两遍才懂的长句拆开，"的"连用超过两个就改写。
36. 中文用全角标点，句中不用破折号代替逗号或句号。中英文之间、中文与数字之间加一个空格。

## Report

When the text came from another skill, return the rewritten text and one line per rule that fired, with its count, such as `unslop 13 ×3`. When the user asked directly, show the rewritten text, then the same lines.

## Source

Adapted from `unslop` in [backnotprop/pstack](https://github.com/backnotprop/pstack), Copyright (c) 2026 Lauren Tan, MIT. See `LICENSE`. The rules are renumbered without gaps, the word lists are longer, and the Chinese section is new.

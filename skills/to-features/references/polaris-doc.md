# Polaris doc

`docs/polaris/<slug>.md` explains one long-range goal: what is true when it is reached, how anyone can tell, why the chosen route gets there, the parts of that route, and the features cut from them. `slug` is lowercase and hyphenated, built from glossary words.

The doc is explanation, in the present tense. It is not a roadmap: it holds no dates, horizons, milestones, owners, estimates, or progress, and a feature's Status lives in the feature's own doc. It is not a record of the work either: it holds no history of the discussion. The `technical-writing` skill holds the full rules.

## Template

````markdown
# <Goal title>

<One sentence: when this is reached, who can do what, or what is true.>

Status: draft

<One short paragraph: what today looks like, with a file or doc for each claim, and who the gap hurts.>

## Signal

<One or two sentences: what a named person observes, and where, when the goal is reached. A number when one exists.>

## Route

<One paragraph: the route, and the constraint that makes it win. The best route set aside, and the condition under which it would win instead. The first thing someone would see if this route is wrong.>

## Parts

### 1. <Part name>

<The capability it adds, in glossary terms, and why it comes at this point of the route.>

- After: none
- Builds on: [<Feature title>](../feature/<slug>.md) | none
- Done when: <the signal that this part is in place>

## Features

1. <Who can do what that they cannot do now>. New. Part: 1. After: none
2. <From today to after>. Iterate [<Feature title>](../feature/<slug>.md). Part: 1. After: 1
3. [<Feature title>](../feature/<slug>.md). Part: 2. After: 1

## Not this

- <something the goal does not cover>

## Open questions

### <Item>: <the question>

- <Option> (recommended): <what it means>, because <reason, with its source>.
- <Option>: <what it means>, and what it costs.
````

A part's `After`, `Builds on`, and `Done when` lines, and the feature lines, are facts that `to-features` and the feature skills look up, so they keep their form. Everything that argues, the opening paragraph, the signal, the route, and the reason a part comes where it does, is prose.

## Rules

- `polaris` writes everything except `## Features`, which `to-features` writes.
- A feature line is one sentence until `feature-new` or `feature-iterate` decides it. Then its sentence becomes a link to the feature doc. An iterate line keeps its sentence after the link.
- Part and feature numbers never change. A dropped line is removed, and its number is not reused.
- `Status: draft` while `## Open questions` has anything in it. An answered question goes into its line, and is deleted. `Status: active` once the section is empty and gone, while the goal is pursued, and `Status: reached` once its signal holds and the user confirms. A dropped goal's doc is deleted. History lives in git.
- A changed route replaces the old one. The doc never says what the route used to be.

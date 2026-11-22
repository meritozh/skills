# Polaris doc

`docs/polaris/<slug>.md` states one long-range goal: what will be true when it is reached, the signal that shows it, the route chosen to get there, its parts, and the features cut from them. `slug` is lowercase and hyphenated, built from glossary words.

## Template

````markdown
# <Goal title>

<One sentence: when this is reached, who can do what, or what is true.>

Status: active

- Signal: <what someone can observe when the goal is reached>
- Horizon: <a rough time frame>

## Route

<One to three sentences: the route and the constraint that makes it win.>

- Rejected: <the other route>, which wins instead when <its condition>.
- Wrong-call signal: <the first thing someone would see if this route is wrong>.

## Parts

### 1. <Part name>

<The capability it adds, in glossary terms.>

- After: none
- Builds on: [<Feature title>](../feature/<slug>.md) | none
- Done when: <the signal that this part is in place>

## Features

1. <Who can do what that they cannot do now>. New. Part: 1. After: none
2. <From today to after>. Iterate [<Feature title>](../feature/<slug>.md). Part: 1. After: 1
3. [<Feature title>](../feature/<slug>.md). Part: 2. After: 1

## Not this

- <what the goal excludes>
````

## Rules

- `polaris` writes everything except `## Features`, which `to-features` writes.
- A feature line is one sentence until `feature-new` or `feature-iterate` decides it. Then its sentence becomes a link to the feature doc; an iterate line keeps its sentence after the link. A feature's Status lives in its own doc, never here.
- Part and feature numbers never change. A dropped line is removed, and its number is not reused.
- `Status: active` while the goal is pursued, and `Status: reached` once its signal holds and the user confirms. A dropped goal's doc is deleted. History lives in git.
- The doc states the goal as decided: no history of the debate, no dates, no open questions.

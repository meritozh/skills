# Feature doc

`docs/feature/<slug>.md` describes one feature as a user meets it: who can use it, how it behaves, what it does not do, and why it works this way. `slug` is lowercase and hyphenated, built from glossary words.

The doc is reference, in the present tense. `## Decisions` is its one explanation section. It is not a record of the work and not a plan: it holds no history of the discussion, no dates, no "now" or "previously", and no next steps. The `technical-writing` skill holds the full rules.

## Shape

Before the doc is `decided`, every item is settled or is a `Not this` line. An item that has nothing to say for this feature, such as Keeps for a read-only view, is left out.

| Item | Heading | Settles |
| --- | --- | --- |
| Who | `### Who can use it` | Who can use it, and the permission they need |
| Entry | `### Where it starts` | Where a user starts it: a command, a screen, an endpoint, a schedule |
| Does | `### What it does` | The main path as the steps a user takes and what they see, then each branch |
| Fails | `### When it fails` | What the user sees when the input is wrong, something it depends on is down, or it stops halfway, and what is left behind |
| Limits | `### Limits` | Sizes, rates, time, and what it refuses |
| Keeps | `### What it keeps` | What it stores or changes that outlives the action, and for how long |
| Meets | none | The existing features it reads, changes, or must leave alone. A change to another feature updates that feature's doc |
| Not this | `## Not this` | What it excludes, including each item the user chose to leave out |

## Template

````markdown
# <Feature title>

<One sentence: who can do what. Then one or two sentences: the problem it solves for them.>

Status: draft

## Behavior

### Who can use it

<Who, in glossary terms, and the permission they need. What someone without it sees.>

### Where it starts

<Each way in.>

### What it does

1. <A step the user takes, and what they see.>
2. <…>

<Each branch a user can take, as a sentence that says where it starts and where it rejoins the main path.>

### When it fails

<One short paragraph per kind of failure: what the user sees, and what is left behind.>

### Limits

<Each limit with its number, and what the user sees when they reach it.>

### What it keeps

<What outlives the action, for how long, and who can delete it.>

## Not this

- <something the feature does not do>

## Decisions

### <The decision, stated as a fact about the feature>

<Two to four sentences: what the feature does, and the constraint that makes this the right choice. The best alternative, and the condition under which it would win instead. The first thing someone would see if this turns out to be the wrong call.>

## Open questions

### <Item>: <the question>

- <Option> (recommended): <what it means>, because <reason, with its source>.
- <Option>: <what it means>, and what it costs.
````

For example, a decision reads:

```markdown
### Large exports run in the background

An export of more than 5,000 orders runs as a background job and emails a download link, because the largest accounts hold 200,000 orders and requests time out after 30 seconds (src/http/server.ts:41). Refusing large exports would win instead if no account held more than 50,000 orders. If admins of large accounts open support tickets about missing emails, this is the wrong call.
```

## Lifecycle

The doc is written as soon as the feature is pinned, and it carries the work between sessions:

- `Status: draft` while `## Open questions` has anything in it. Each question names the item it settles, its options, and the recommended one. When the user answers, the answer goes into its Behavior section or a `## Decisions` entry, and the question is deleted.
- `Status: decided` once `## Open questions` is empty and the section is gone. The doc is ahead of the code. The commit that makes the code do what the doc says sets `shipped`.

A decided doc reads as if the feature already exists. An overturned decision is replaced, not annotated. Leave out a section with nothing to say.

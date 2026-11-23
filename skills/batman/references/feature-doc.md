# Feature doc

`docs/feature/<slug>.md` states one feature as decided: who can do what, how it behaves, what it is not, and the decisions that shaped it. `slug` is lowercase and hyphenated, built from glossary words.

## Shape

Before the doc is written, every item is settled or is a `Not this` line. An item that has nothing to say for this feature, such as `Keeps` for a read-only view, is settled as none.

| Item | Settles |
| --- | --- |
| Who | Who can use it, and what they must be allowed to do |
| Entry | Where they start it: a command, a screen, an endpoint, a schedule |
| Does | The main path in glossary terms, then each branch a user can take |
| Fails | What the user sees when the input is wrong, something it depends on is down, or it stops halfway, and what is left behind |
| Limits | Sizes, rates, time, and what it refuses |
| Keeps | What it stores or changes that outlives the action, and for how long |
| Meets | The existing features it reads, changes, or must leave alone. Not a line of this doc: a change to another feature updates that feature's doc |
| Not this | What it excludes, including each item the user chose to leave out |

## Template

````markdown
# <Feature title>

<One sentence: who can do what.>

Status: decided

## Behavior

- Who: <who can use it, and the permission it needs>
- Entry: <where a user starts it>
- Does: <the main path, in glossary terms>
  - <a branch a user can take>
- Fails: <what the user sees, and what is left behind>
- Limits: <sizes, rates, time, what it refuses>
- Keeps: <what outlives the action, and for how long>

## Decisions

### <Short title>

<One to three sentences: the decision and the constraint that makes it win.>

- Rejected: <the alternative>, which wins instead when <its condition>.
- Wrong-call signal: <the first thing someone would see if this turns out to be the wrong call>.

## Not this

- <what the feature explicitly excludes>
````

The file states the feature as decided. It holds no history of the debate, no open questions, no plan, and no next steps. Leave out a line or a section with nothing to say. Status is `decided` while the doc is ahead of the code; the commit that makes the code do what the doc says sets `shipped`.

# Specialist reviewers

Activate specialists by reading the full diff and judging, not by matching keywords. They add to the main pass and never replace it.

## Briefing

With an agent facility, launch every activated specialist in parallel; without one, run the passes one after another here.

Every brief (specialist, skeptic, or adversarial angle) follows [principles/guard-the-context.md](../principles/guard-the-context.md):

```text
Read <absolute path of this skill's directory>/references/worker.md before anything else.
Read <absolute path of the persona file>.
Diff: git diff <base-sha>..<head-sha>, plus these dirty or untracked files: <paths>.
Files to read: <the frozen file list, or this reviewer's share of it>.
Reply in the persona's Output format.
```

A skeptic's or angle's brief names its one finding to refute, or its angle, in place of the persona file.

## Merging and verifying

When two specialists flag one location, keep the higher severity and note the agreement. Findings on different locations are never duplicates.

Every specialist finding is a claim to verify. For each HIGH or CRITICAL claim, start one skeptic whose only task is to refute it against the code, or, without the facility, re-read the cited code this turn yourself. Drop or downgrade a claim that is refuted on direct read, handled elsewhere, consistent by design, or a latent risk labeled as a live bug. Cite the verification path before a claim enters the report.

## Security reviewer

Persona file: `agents/reviewer-security.md`. Standard or Deep depth.

Activate when the diff changes code an attacker could reach: input across a trust boundary, auth or crypto, credentials, or query, shell, or path construction. Not for pure UI, config, test-only, or documentation changes.

## Architecture reviewer

Persona file: `agents/reviewer-architecture.md`. Standard or Deep depth.

Activate when the diff changes how modules relate: boundaries, public APIs or signatures, cross-module dependencies, or a major dependency. Not for single-file bug fixes, test additions, style changes, or documentation.

## Adversarial pass (Deep only)

No persona file. With an agent facility, run the four angles as parallel agents, each blind to the others' findings; otherwise as one more pass after all findings are collected. Each asks how to break the system through this diff:

1. **Assumption violation.** What does this code assume is always true (a format, an order, a range), and what happens when it is not?
2. **Composition failures.** What breaks when the new code meets the existing system under concurrent load or partial failure?
3. **Cascade construction.** What sequence of valid operations leads to an invalid state?
4. **Abuse cases.** What happens on the 1000th request, during a deployment, or with two users editing the same resource at once?

Give each adversarial finding a confidence from 0 to 1, and drop anything below 0.60. Agreement from independent angles raises confidence. A finding only one angle raised gets the skeptic check.

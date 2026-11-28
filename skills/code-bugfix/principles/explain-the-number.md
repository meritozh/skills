# Explain the number

Apply before you measure, and before you trust, report, or act on a number: a speedup, a regression, a latency, a size, a count, a pass rate.

- Write the decision first: the result that would change it, and the noise floor. When the spread between runs is larger than the effect, there is no effect yet.
- Name what bounds the number, from a profile or counters taken during the run. A guess from reading code is not a limiter.
- List what else the number could measure: errors, skipped or cached work, code that never ran, a warm cache on one side, noise. Rule out each one with evidence.
- Report the number with its run count, its spread, and its limiter.

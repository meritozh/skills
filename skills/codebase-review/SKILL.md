---
name: codebase-review
description: "Review any codebase for whether shared behavior is lifted out of features into composable modules, and whether boundaries and names match that claim. Write a self-contained HTML report outside docs/. Use for a whole-codebase review. Not for a diff or PR review, and not for root-cause debugging."
---

# Codebase review

Review the repositories the user names. The subject is any codebase. Judge it against the design it claims. A finding needs a file and line, a trigger, and a check that would show a fix worked.

This is the whole-codebase review. A diff or PR review is `diff-review`. A bug is `code-fix`. Discussing an idea is `design-idea`. Designing one confirmed module is `design-code`. Repo principles are `project`.

Pin the baseline before any judgment. For each repo record the branch, the full commit, and the dirty and untracked counts. Build a source fingerprint: the tracked files plus the unignored untracked sources the build reads, sorted by relative path. Each line is `path`, tab, SHA-256, newline. Hash that list. A fingerprint binds the input you read. It is not a reproducible build. Say what a commit hash cannot rebuild: an ignored lockfile, a path dependency, or uncommitted work.

Keep four kinds of evidence apart. A package dependency, a name in source, a production call path, and a command you ran are not interchangeable. Do not claim a line-by-line proof of every file, platform, or schedule.

## Score

5 means the declared scope has a shared mechanism and failure evidence. 3 means the main path works and an extension needs extra work at the caller. 1 means a declared behavior cannot be delivered. A score between those anchors is a judgment, not a formula. Put the phenomenon beside the score, with file and line.

Score a further dimension only when this codebase claims it. Do not add a row to fill a table.

## Architecture

Shared behavior comes out of the features that already share it, and into a module whose interface does not name those features. A feature is a composition of those modules. The core does not implement a feature.

1. List the features this product already has, from its docs or its real entry points. Do not invent a taxonomy.
2. Take one behavior that at least two features perform. It has been extracted when it lives in a module that does not name a feature, and each feature only composes that module with others. It has not been extracted when each feature carries its own copy, or a shared module branches on a feature name.
3. Count feature-specific names in the core: types, enums, strings, and config keys. Then apply one change this codebase would actually make. A feature that only recombines existing capabilities touches the composition site alone. If it must edit the core's control flow, the abstraction still has that feature's shape.

Read the anchors for this dimension as follows. 5: two or more features share the mechanism, and the core path does not name a feature. 3: the current features run, but a new feature still needs a branch or a registration in the core. 1: the core implements the features, and there is no composable layer.

Extract only behavior that already appears in more than one feature. A framework nothing composes does not raise this score.

## Evidence beside the score

**Boundaries.** Count the production files that touch a contract, and split the count by directory. Name each dependency that runs both ways and the atomicity it buys. Note where production code concentrates. A small line count does not make a boundary sound. Keep one state machine when the steps share hidden state. Moving code while that state stays behind is not a split. Splitting one commit into independent writers adds crash points.

**Names.** A name is enough when a caller can state the invariant it guards without reading the implementation. A name fails when the docs and the code disagree, when one word names two things, or when one timing change forces a reading of several owners. Count functions whose span, from the signature to the closing brace, exceeds 100 lines and 200 lines. That count is a reading surface. It does not enter the score.

**Other claims.** When the project promises them, score who owns each fact and its version, whether the moments of one change stay distinct, whether a caller can rely on the public entry, and what the tests and the delivered artifacts actually prove.

## Findings

One finding is one trigger, the files and lines, what is true now, and an external check at the real entry. The finding states the defect and the check. The roadmap owns any suggested interface.

When you run a probe, use a temporary directory or a substitute for the external system. Leave user data and production services alone. Say what that probe cannot prove.

## Report

Write one HTML file. Match the section structure below. Do not copy a sample report's visual style, and do not copy its findings. Subsection titles name this codebase.

1. **执行摘要**
   - 按设计承诺评分: each scored claim, the score, and the phenomenon with file and line.
   - 最优先事项: the first fixes, each with how to know it worked.
2. **项目全景**
   - 产品目标与当前能力.
   - 声明的分层与实际依赖.
   - 代码规模与阅读面分布.
   - 请求经过哪些权威提交点.
3. **架构层面评估**
   - 应当保护的正确性内核.
   - 逐条核对设计声明.
   - 看起来共用的流程，实际共用到哪一层.
   - 用几次真实变化检验扩展成本.
   - 复杂度预算用在哪里.
4. **子系统详评.** One part per subsystem: what a caller can observe, what stays internal, and the judgment. Then the findings, product path separate from library callers when both exist.
5. **横切工程质量**
   - 实测结果与证据范围.
   - 热点为什么值得拆，哪些应该合在一起.
   - 错误如何穿过模块.
   - 文档、版本与组合交付.
6. **失败与残留.** For each main path, what the caller sees when a step fails, what state remains, and whether a retry is safe. This is not a capacity or load estimate.
7. **改进路线图.** Order by how bad a failure is, then by what must land first. Acceptance stays at a real feature entry that exercises the shared module.
8. **方法、复核清单与证据**
   - 基线与方法.
   - 关键判断的复核入口.
   - 隔离探针与源码索引.

Skip a subsection only when it does not apply, and say why.

Save it outside the repository's `docs/`. Default path: `$TMPDIR`, else `/tmp`, else `%TEMP%` on Windows, file `<date>-<repo>-codebase-review.html`. If the user names a path, that path is not under `docs/`. Do not add the file to the repo. Open it (`open` on macOS, `xdg-open` on Linux, `start` on Windows) and give the absolute path.

## Source

The section structure comes from a 2026-11-07 multi-repository review. The findings of that review are not part of this skill. The architecture test above is the rule for every codebase.

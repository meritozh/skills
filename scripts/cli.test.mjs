import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, test } from 'node:test';

import {
  buildInstallCommand,
  lintSkills,
  listSkills,
  loadCatalog,
  main,
  normalizeSkillName,
  parseFrontmatter,
  planShared,
  renderMarketplaceJson,
  renderSkillsIndex,
  renderSkillsShJson,
  repoRootFromHere,
  runInstall,
  runStatus,
  runSync,
  statusProblems,
  statusReport,
  updateReadme,
  validateCatalog,
  validateShared,
  writeGeneratedConfigs,
} from './cli.mjs';

const temps = [];

function tempDir() {
  const dir = mkdtempSync(join(tmpdir(), 'skills-catalog-'));
  temps.push(dir);
  return dir;
}

afterEach(() => {
  while (temps.length) {
    rmSync(temps.pop(), { recursive: true, force: true });
  }
});

function writeSkill(dir, name, extraFiles = {}) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'SKILL.md'), `---\nname: ${name}\ndescription: Test skill ${name}.\n---\n\n# ${name}\n`);
  for (const [rel, content] of Object.entries(extraFiles)) {
    const path = join(dir, rel);
    mkdirSync(join(path, '..'), { recursive: true });
    writeFileSync(path, content);
  }
}

function writeCatalog(root, catalog) {
  writeFileSync(join(root, 'catalog.json'), JSON.stringify(catalog, null, 2));
}

function validCatalog(overrides = {}) {
  return { global: true, agents: ['claude-code', 'codex'], ...overrides };
}

test('parseFrontmatter reads names and quoted and folded descriptions', () => {
  assert.equal(parseFrontmatter('---\nname: Code Review\ndescription: x\n---\n').name, 'code-review');
  assert.equal(parseFrontmatter('# no frontmatter\n').name, null);

  const quoted = parseFrontmatter('---\nname: hunt\ndescription: "Finds root cause."\n---\n');
  assert.equal(quoted.description, 'Finds root cause.');

  const folded = parseFrontmatter('---\nname: slop\ndescription: >-\n  Find and remove AI slop\n  from a web project.\n---\n');
  assert.equal(folded.description, 'Find and remove AI slop from a web project.');

  const single = parseFrontmatter("---\nname: doc\ndescription: 'Typeset: \"PDF\"'\n---\n");
  assert.equal(single.description, 'Typeset: "PDF"');
});

test('listSkills reads every skill directory and flags a name that differs from its directory', () => {
  const root = tempDir();
  writeSkill(join(root, 'skills', 'beta'), 'beta');
  writeSkill(join(root, 'skills', 'alpha'), 'alpha');
  writeSkill(join(root, 'skills', 'gamma'), 'not-gamma');
  mkdirSync(join(root, 'skills', 'empty'));
  const skills = listSkills(join(root, 'skills'));
  assert.deepEqual(
    skills.map((s) => [s.name, s.state]),
    [
      ['alpha', 'ok'],
      ['beta', 'ok'],
      ['gamma', 'name-mismatch'],
    ]
  );
  assert.match(skills[0].description, /Test skill alpha/);
});

test('updateReadme writes one skills table and is idempotent', () => {
  const root = tempDir();
  writeSkill(join(root, 'skills', 'alpha'), 'alpha');
  const skills = listSkills(join(root, 'skills'));
  const readme = join(root, 'README.md');
  writeFileSync(readme, '# skills\n\nIntro.\n\n## Install\n\nHi.\n');
  assert.equal(updateReadme(readme, skills), true);
  const body = readFileSync(readme, 'utf8');
  assert.match(body, /## Skills/);
  assert.match(body, /\| \[alpha\]\(skills\/alpha\/SKILL.md\) \| Test skill alpha. \|/);
  assert.doesNotMatch(body, /Vendored|Source/);
  assert.match(body, /## Install/);
  assert.equal(updateReadme(readme, skills), false);
  assert.match(renderSkillsIndex([]), /_None._/);
});

test('validateCatalog rejects sources, bad agents, and bad groupings', () => {
  assert.deepEqual(validateCatalog(validCatalog()), []);
  assert.match(validateCatalog(validCatalog({ global: false }))[0], /global must be true/);
  assert.match(validateCatalog(validCatalog({ agents: [] }))[0], /agents/);
  assert.match(validateCatalog(validCatalog({ sources: [] })).join('\n'), /sources is not supported/);
  assert.match(validateCatalog(validCatalog({ notGrouped: 'middle' })).join('\n'), /notGrouped/);
  assert.match(
    validateCatalog(
      validCatalog({
        groupings: [
          { name: 'general', skills: ['alpha'] },
          { name: 'engineering', skills: ['alpha'] },
        ],
      })
    ).join('\n'),
    /in both/
  );
  assert.match(
    validateCatalog(validCatalog({ groupings: [{ name: 'general', skills: ['*'] }] })).join('\n'),
    /cannot contain "\*"/
  );
  assert.match(validateCatalog(validCatalog({ groupings: [{ name: 'Bad Name', skills: ['a'] }] })).join('\n'), /kebab-case/);
});

test('writeGeneratedConfigs emits marketplace and skills.sh grouping files', () => {
  const root = tempDir();
  const catalog = validCatalog({
    notGrouped: 'bottom',
    groupings: [{ name: 'general', title: 'General', description: 'Everyday skills.', skills: ['alpha'] }],
  });
  writeGeneratedConfigs(root, catalog, ['alpha']);
  const marketplace = JSON.parse(readFileSync(join(root, '.claude-plugin', 'marketplace.json'), 'utf8'));
  assert.deepEqual(marketplace.plugins[0], { name: 'general', source: './', skills: ['./skills/alpha'] });
  const page = JSON.parse(readFileSync(join(root, 'skills.sh.json'), 'utf8'));
  assert.equal(page.notGrouped, 'bottom');
  assert.deepEqual(page.groupings[0].skills, ['alpha']);
  assert.throws(() => writeGeneratedConfigs(root, catalog, []), /not in skills/);
  assert.equal(renderMarketplaceJson(catalog).plugins[0].name, 'general');
  assert.equal(renderSkillsShJson(validCatalog({ groupings: [{ name: 'dev-tools', skills: ['a'] }] })).groupings[0].title, 'Dev Tools');
});

test('buildInstallCommand uses latest npx skills, global flag, and agents', () => {
  const { cmd, args } = buildInstallCommand(validCatalog(), '/repo');
  assert.equal(cmd, 'npx');
  assert.deepEqual(args, ['--yes', 'skills@latest', 'add', '/repo', '--skill', '*', '-g', '-y', '-a', 'claude-code', '-a', 'codex']);
});

test('validateShared rejects bad paths, bad skill lists, and duplicates', () => {
  const shared = (entries) => validateShared({ shared: entries }).join('\n');
  assert.deepEqual(validateShared({}), []);
  assert.deepEqual(validateShared({ shared: [{ path: 'references/a.md', skills: ['x', 'y'] }] }), []);
  assert.match(validateShared({ shared: {} })[0], /must be an array/);
  for (const path of ['', '/abs.md', '../up.md', 'a/../b.md', 'a//b.md', './a.md', 'a\\b.md', 'SKILL.md', 7]) {
    assert.match(shared([{ path, skills: ['x'] }]), /path must be/, String(path));
  }
  assert.match(shared([{ path: 'a.md', skills: [] }]), /skills must be/);
  assert.match(shared([{ path: 'a.md', skills: ['*'] }]), /skills must be/);
  assert.match(
    shared([
      { path: 'a.md', skills: ['x'] },
      { path: 'a.md', skills: ['X'] },
    ]),
    /x\/a.md is listed twice/
  );
});

function sharedRepo() {
  const root = tempDir();
  writeSkill(join(root, 'skills', 'same'), 'same', { 'references/g.md': 'G1\n' });
  writeSkill(join(root, 'skills', 'stale'), 'stale', { 'references/g.md': 'old\n' });
  writeSkill(join(root, 'skills', 'bare'), 'bare');
  mkdirSync(join(root, 'shared', 'references'), { recursive: true });
  writeFileSync(join(root, 'shared', 'references', 'g.md'), 'G1\n');
  const catalog = validCatalog({
    groupings: [{ name: 'core', skills: ['same', 'stale', 'bare'] }],
    shared: [{ path: 'references/g.md', skills: ['same', 'stale', 'bare'] }],
  });
  writeCatalog(root, catalog);
  return { root, catalog };
}

test('planShared reports ok, differs, and missing, and refuses absent skills or sources', () => {
  const { root, catalog } = sharedRepo();
  const args = { catalog, skillsDir: join(root, 'skills'), sharedDir: join(root, 'shared') };
  const { items, errors } = planShared(args);
  assert.deepEqual(errors, []);
  assert.deepEqual(
    items.map((item) => [item.skill, item.state]),
    [
      ['same', 'ok'],
      ['stale', 'differs'],
      ['bare', 'missing'],
    ]
  );
  const ghost = { ...catalog, shared: [{ path: 'references/g.md', skills: ['ghost'] }] };
  assert.match(planShared({ ...args, catalog: ghost }).errors.join('\n'), /"ghost", which is not a skill/);
  const noSource = { ...catalog, shared: [{ path: 'references/none.md', skills: ['same'] }] };
  assert.match(planShared({ ...args, catalog: noSource }).errors.join('\n'), /shared\/references\/none.md is not a file/);
});

test('sync copies shared files and regenerates outputs; status and install see drift', () => {
  const { root } = sharedRepo();
  writeFileSync(join(root, 'README.md'), '# t\n\n<!-- skills-index:start -->\n<!-- skills-index:end -->\n');
  const install = () => runInstall(root, { dryRun: true, run: () => {}, log: () => {} });

  const status = [];
  runStatus(root, { log: (line) => status.push(String(line)) });
  assert.match(status.join('\n'), /differs +stale\/references\/g.md/);
  assert.throws(install, /stale\/references\/g.md differs[\s\S]*run node scripts\/cli.mjs sync/);

  const dry = [];
  runSync(root, { dryRun: true, log: (line) => dry.push(String(line)) });
  assert.match(dry.join('\n'), /share stale\/references\/g.md/);
  assert.doesNotMatch(dry.join('\n'), /share same\//);
  assert.equal(readFileSync(join(root, 'skills', 'stale', 'references', 'g.md'), 'utf8'), 'old\n');
  assert.equal(existsSync(join(root, 'skills.sh.json')), false);

  runSync(root, { log: () => {} });
  for (const skill of ['same', 'stale', 'bare']) {
    assert.equal(readFileSync(join(root, 'skills', skill, 'references', 'g.md'), 'utf8'), 'G1\n');
  }
  assert.match(readFileSync(join(root, 'README.md'), 'utf8'), /\[stale\]/);
  assert.equal(existsSync(join(root, '.claude-plugin', 'marketplace.json')), true);
  const calls = [];
  runInstall(root, { dryRun: true, run: (...a) => calls.push(a), log: () => {} });
  assert.deepEqual(calls, []);
});

test('install refuses a skill whose name differs from its directory, or a grouping naming a missing skill', () => {
  const { root, catalog } = sharedRepo();
  runSync(root, { log: () => {} });
  writeSkill(join(root, 'skills', 'odd'), 'other');
  assert.throws(() => runInstall(root, { dryRun: true, log: () => {} }), /odd\/SKILL.md name-mismatch/);
  rmSync(join(root, 'skills', 'odd'), { recursive: true });
  writeCatalog(root, { ...catalog, groupings: [{ name: 'core', skills: ['same', 'ghost'] }] });
  assert.throws(() => runInstall(root, { dryRun: true, log: () => {} }), /lists "ghost"/);
});

test('main rejects unknown commands, including the removed update', () => {
  const root = tempDir();
  assert.throws(() => main(['update'], { root, log: () => {} }), /Unknown command: update/);
});

test('loadCatalog throws when missing', () => {
  assert.throws(() => loadCatalog(join(tempDir(), 'catalog.json')), /Missing catalog.json/);
});

test('normalizeSkillName', () => {
  assert.equal(normalizeSkillName(' Code_Review '), 'code-review');
});

test('this repo has no status problems', () => {
  const root = repoRootFromHere();
  const report = statusReport({ catalog: loadCatalog(join(root, 'catalog.json')), root });
  assert.ok(report.skills.length > 0);
  assert.ok(report.shared.length > 0);
  assert.deepEqual(statusProblems(report), []);
});

test('lintSkills flags long or unsafe descriptions, broken links, and unknown skill names', () => {
  const root = mkdtempSync(join(tmpdir(), 'skills-lint-'));
  temps.push(root);
  const write = (path, text) => {
    mkdirSync(join(root, path, '..'), { recursive: true });
    writeFileSync(join(root, path), text);
  };
  write('skills/good/SKILL.md', '---\nname: good\ndescription: "Does a thing: well."\n---\n\nSee [x](references/x.md), `/bad`, and `/tmp`.\n\n```\n[t](../nowhere.md)\n```\n');
  write('skills/good/references/x.md', 'Run the `good` skill, then the `gone` skill. [y](missing.md)\n');
  write('skills/long/SKILL.md', `---\nname: long\ndescription: ${'a'.repeat(1025)}\n---\n`);
  write('skills/unsafe/SKILL.md', '---\nname: unsafe\ndescription: Does a thing: badly.\n---\n');
  write('skills/unsafe/principles/used.md', '# Used\n');
  write('skills/unsafe/principles/unused.md', '# Unused\n');
  write('skills/unsafe/references/r.md', 'See [p](../principles/used.md).\n');
  const problems = lintSkills({ catalog: { notSkills: ['tmp'] }, root });
  assert.deepEqual(problems.sort(), [
    'skills/good/SKILL.md: names a skill "bad" that is not in skills/',
    'skills/good/references/x.md: link missing.md does not resolve',
    'skills/good/references/x.md: names a skill "gone" that is not in skills/',
    'skills/long/SKILL.md: description is 1025 characters, over 1024',
    'skills/unsafe/SKILL.md: description holds ": " or " #" and must be quoted',
    'skills/unsafe/principles/unused.md: no file of the skill links it; link it where it applies, or drop the skill from its shared entry',
  ]);
});

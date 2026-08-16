import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, test } from 'node:test';

import {
  applySync,
  buildInstallCommand,
  claimedRemoteNames,
  copySkill,
  discoverSkills,
  emptyLock,
  formatPlan,
  loadCatalog,
  matchRequestedSkills,
  normalizeSkillName,
  parseFrontmatter,
  parseSkillName,
  planSync,
  listSkills,
  renderMarketplaceJson,
  renderSkillsIndex,
  renderSkillsShJson,
  updateReadme,
  writeGeneratedConfigs,
  resolveGitUrl,
  runInstall,
  runStatus,
  runSync,
  sanitizeSource,
  skillSparsePaths,
  statusReport,
  validateCatalog,
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
  writeFileSync(
    join(dir, 'SKILL.md'),
    `---\nname: ${name}\ndescription: Test skill ${name}.\n---\n\n# ${name}\n`
  );
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
  return {
    global: true,
    agents: ['claude-code', 'codex'],
    sources: [
      { source: 'acme/kit', skills: ['alpha'] },
      { source: '.', skills: ['*'] },
    ],
    ...overrides,
  };
}

test('parseSkillName reads frontmatter and normalizes', () => {
  assert.equal(parseSkillName('---\nname: Code Review\ndescription: x\n---\n', 'fallback'), 'code-review');
  assert.equal(parseSkillName('---\nname: "tdd"\ndescription: x\n---\n', 'fallback'), 'tdd');
  assert.equal(parseSkillName('# no frontmatter\n', 'fallback'), 'fallback');
});

test('parseFrontmatter reads quoted and folded descriptions', () => {
  const quoted = parseFrontmatter('---\nname: hunt\ndescription: "Finds root cause."\n---\n');
  assert.equal(quoted.name, 'hunt');
  assert.equal(quoted.description, 'Finds root cause.');

  const folded = parseFrontmatter(
    '---\nname: kill-ai-slop\ndescription: >-\n  Find and remove AI slop\n  from a web project.\n---\n'
  );
  assert.equal(folded.description, 'Find and remove AI slop from a web project.');

  const single = parseFrontmatter("---\nname: kami\ndescription: 'Typeset: \"PDF\"'\n---\n");
  assert.equal(single.description, 'Typeset: "PDF"');
});

test('listSkills splits first-party and vendored and updateReadme rewrites the index', () => {
  const root = tempDir();
  writeSkill(join(root, 'skills', 'catalog'), 'catalog');
  writeSkill(join(root, 'skills', 'alpha'), 'alpha');
  const lock = {
    version: 1,
    skills: { alpha: { source: 'acme/kit', skillPath: 'skills/alpha/SKILL.md', commit: 'aaa' } },
  };
  const lists = listSkills(join(root, 'skills'), lock);
  assert.deepEqual(
    lists.firstParty.map((s) => s.name),
    ['catalog']
  );
  assert.equal(lists.firstParty[0].source, '.');
  assert.equal(lists.vendored[0].name, 'alpha');
  assert.equal(lists.vendored[0].source, 'acme/kit');
  assert.match(lists.vendored[0].description, /Test skill alpha/);

  const readme = join(root, 'README.md');
  writeFileSync(readme, '# skills\n\nIntro.\n\n## Install\n\nHi.\n');
  assert.equal(updateReadme(readme, lists), true);
  const body = readFileSync(readme, 'utf8');
  assert.match(body, /## First-party/);
  assert.match(body, /\[catalog\]\(skills\/catalog\/SKILL.md\)/);
  assert.match(body, /\[acme\/kit\]\(https:\/\/github.com\/acme\/kit\)/);
  assert.match(body, /## Install/);
  assert.equal(updateReadme(readme, lists), false);
  assert.match(renderSkillsIndex(lists), /<!-- skills-index:start -->/);
});

test('discoverSkills finds nested and root skills', () => {
  const root = tempDir();
  writeSkill(join(root, 'skills', 'engineering', 'tdd'), 'tdd', {
    'references/notes.md': 'n',
  });
  writeSkill(join(root, 'skills', 'think'), 'think');
  const found = discoverSkills(root);
  assert.deepEqual(found.map((s) => s.name).sort(), ['tdd', 'think']);
  assert.equal(found.find((s) => s.name === 'tdd').skillPath, 'skills/engineering/tdd/SKILL.md');
});

test('discoverSkills prefers skills/ over plugins/ for the same name', () => {
  const root = tempDir();
  writeSkill(join(root, 'plugins', 'waza', 'skills', 'think'), 'think');
  writeSkill(join(root, 'skills', 'think'), 'think', { 'references/real.md': 'yes' });
  const found = discoverSkills(root);
  assert.equal(found.length, 1);
  assert.equal(found[0].skillPath, 'skills/think/SKILL.md');
});

test('validateCatalog rejects collisions, project scope, and bad entries', () => {
  assert.deepEqual(validateCatalog(validCatalog()), []);
  assert.match(validateCatalog(validCatalog({ global: false }))[0], /global must be true/);
  assert.match(
    validateCatalog(
      validCatalog({
        sources: [
          { source: 'a/one', skills: ['dup'] },
          { source: 'b/two', skills: ['dup'] },
        ],
      })
    )[0],
    /claimed by both/
  );
  assert.match(
    validateCatalog(validCatalog({ sources: [{ source: 'a/one', skills: ['*', 'x'] }] }))[0],
    /cannot mix/
  );
  assert.match(validateCatalog({ global: true, agents: [], sources: [] })[0], /agents/);
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
});

test('writeGeneratedConfigs emits marketplace and skills.sh grouping files', () => {
  const root = tempDir();
  writeSkill(join(root, 'skills', 'alpha'), 'alpha');
  const catalog = validCatalog({
    notGrouped: 'bottom',
    groupings: [
      {
        name: 'general',
        title: 'General',
        description: 'Everyday skills.',
        skills: ['alpha'],
      },
    ],
  });
  writeGeneratedConfigs(root, catalog, ['alpha']);
  const marketplace = JSON.parse(readFileSync(join(root, '.claude-plugin', 'marketplace.json'), 'utf8'));
  assert.deepEqual(marketplace.plugins[0], {
    name: 'general',
    source: './',
    skills: ['./skills/alpha'],
  });
  const page = JSON.parse(readFileSync(join(root, 'skills.sh.json'), 'utf8'));
  assert.equal(page.notGrouped, 'bottom');
  assert.deepEqual(page.groupings[0].skills, ['alpha']);
  assert.throws(() => writeGeneratedConfigs(root, catalog, []), /not in skills/);
  assert.deepEqual(renderMarketplaceJson(catalog).plugins[0].name, 'general');
  assert.equal(renderSkillsShJson(catalog).groupings[0].title, 'General');
});

test('claimedRemoteNames ignores local source', () => {
  const names = claimedRemoteNames(validCatalog());
  assert.deepEqual([...names.keys()], ['alpha']);
  assert.equal(names.get('alpha'), 'acme/kit');
});

test('planSync copies remotes and refuses to overwrite first-party', () => {
  const root = tempDir();
  const remote = tempDir();
  writeSkill(join(remote, 'skills', 'alpha'), 'alpha', { 'scripts/run.sh': 'echo hi' });
  writeFileSync(join(remote, 'LICENSE'), 'MIT');

  const skillsDir = join(root, 'skills');
  writeSkill(join(skillsDir, 'mine'), 'mine');

  const catalog = validCatalog();
  const fetched = {
    'acme/kit': {
      path: remote,
      commit: 'abc1234deadbeef',
      skills: discoverSkills(remote),
    },
  };

  const plan = planSync({ catalog, lock: emptyLock(), skillsDir, fetched });
  assert.deepEqual(plan.errors, []);
  assert.equal(plan.copy.length, 1);
  assert.equal(plan.copy[0].name, 'alpha');
  assert.equal(plan.remove.length, 0);

  writeSkill(join(skillsDir, 'alpha'), 'alpha');
  const clash = planSync({ catalog, lock: emptyLock(), skillsDir, fetched });
  assert.match(clash.errors.join('\n'), /first-party skill "alpha"/);
});

test('planSync reports missing remote skills and does not copy on error', () => {
  const remote = tempDir();
  writeSkill(join(remote, 'skills', 'alpha'), 'alpha');
  const plan = planSync({
    catalog: validCatalog({ sources: [{ source: 'acme/kit', skills: ['alpha', 'missing'] }] }),
    lock: emptyLock(),
    skillsDir: join(tempDir(), 'skills'),
    fetched: {
      'acme/kit': { path: remote, commit: 'c'.repeat(40), skills: discoverSkills(remote) },
    },
  });
  assert.match(plan.errors.join('\n'), /no skill named "missing"/);
  assert.equal(plan.copy.length, 0);
});

test('applySync copies files, writes lock, prunes stale vendored skills', () => {
  const root = tempDir();
  const remote = tempDir();
  writeSkill(join(remote, 'skills', 'alpha'), 'alpha', { 'references/a.md': 'body' });
  writeFileSync(join(remote, 'LICENSE'), 'MIT-REMOTE');
  writeSkill(join(root, 'skills', 'old'), 'old');

  const lock = {
    version: 1,
    skills: { old: { source: 'acme/kit', skillPath: 'skills/old/SKILL.md', commit: 'old' } },
  };
  const fetched = {
    'acme/kit': { path: remote, commit: 'n'.repeat(40), skills: discoverSkills(remote) },
  };
  const plan = planSync({
    catalog: validCatalog(),
    lock,
    skillsDir: join(root, 'skills'),
    fetched,
  });
  assert.deepEqual(plan.errors, []);
  applySync(plan, {
    skillsDir: join(root, 'skills'),
    thirdPartyDir: join(root, 'third_party'),
    lockPath: join(root, 'sources.lock.json'),
    lock,
  });

  assert.equal(existsSync(join(root, 'skills', 'old', 'SKILL.md')), false);
  assert.equal(readFileSync(join(root, 'skills', 'alpha', 'references', 'a.md'), 'utf8'), 'body');
  assert.equal(readFileSync(join(root, 'third_party', 'acme-kit', 'LICENSE'), 'utf8'), 'MIT-REMOTE');
  const written = JSON.parse(readFileSync(join(root, 'sources.lock.json'), 'utf8'));
  assert.equal(written.skills.alpha.source, 'acme/kit');
  assert.equal(written.skills.old, undefined);
});

test('copySkill from repo root keeps companions and skips site files', () => {
  const repo = tempDir();
  writeSkill(repo, 'kami');
  mkdirSync(join(repo, 'scripts'), { recursive: true });
  writeFileSync(join(repo, 'scripts', 'render.py'), 'print(1)');
  writeFileSync(join(repo, 'index.html'), '<html>');
  writeFileSync(join(repo, 'about.md'), 'site');
  writeFileSync(join(repo, 'LICENSE'), 'MIT');
  mkdirSync(join(repo, 'assets', 'fonts'), { recursive: true });
  mkdirSync(join(repo, 'assets', 'images'), { recursive: true });
  writeFileSync(join(repo, 'assets', 'fonts', 'x.ttf'), 'font');
  writeFileSync(join(repo, 'assets', 'images', 'hero.png'), 'img');
  const dest = join(tempDir(), 'kami');
  copySkill(repo, dest, repo);
  assert.equal(existsSync(join(dest, 'SKILL.md')), true);
  assert.equal(existsSync(join(dest, 'scripts', 'render.py')), true);
  assert.equal(existsSync(join(dest, 'LICENSE')), true);
  assert.equal(existsSync(join(dest, 'index.html')), false);
  assert.equal(existsSync(join(dest, 'about.md')), false);
  assert.equal(existsSync(join(dest, 'assets', 'fonts', 'x.ttf')), true);
  assert.equal(existsSync(join(dest, 'assets', 'images', 'hero.png')), false);
});

test('statusReport marks missing, ok, stale, and first-party', () => {
  const root = tempDir();
  writeSkill(join(root, 'skills', 'alpha'), 'alpha');
  writeSkill(join(root, 'skills', 'catalog'), 'catalog');
  const catalog = validCatalog({
    sources: [
      { source: 'acme/kit', skills: ['alpha', 'beta'] },
      { source: '.', skills: ['*'] },
    ],
  });
  const lock = {
    version: 1,
    skills: {
      alpha: { source: 'acme/kit', skillPath: 'skills/alpha/SKILL.md', commit: 'aaa' },
      stale: { source: 'acme/kit', skillPath: 'skills/stale/SKILL.md', commit: 'bbb' },
    },
  };
  const report = statusReport({ catalog, lock, skillsDir: join(root, 'skills') });
  assert.equal(report.remote.find((s) => s.name === 'alpha').state, 'ok');
  assert.equal(report.remote.find((s) => s.name === 'beta').state, 'missing');
  assert.deepEqual(
    report.firstParty.map((s) => s.name),
    ['catalog']
  );
  assert.deepEqual(
    report.stale.map((s) => s.name),
    ['stale']
  );
});

test('buildInstallCommand uses latest npx skills, global flag, and agents', () => {
  const { cmd, args } = buildInstallCommand(validCatalog(), '/repo');
  assert.equal(cmd, 'npx');
  assert.deepEqual(args, [
    '--yes',
    'skills@latest',
    'add',
    '/repo',
    '--skill',
    '*',
    '-g',
    '-y',
    '-a',
    'claude-code',
    '-a',
    'codex',
  ]);
});

test('runSync dry-run fetches and does not write lock', async () => {
  const root = tempDir();
  const remote = tempDir();
  writeSkill(join(remote, 'skills', 'alpha'), 'alpha');
  writeCatalog(root, validCatalog());
  const logs = [];
  await runSync(root, {
    dryRun: true,
    fetchSource: () => ({ path: remote, commit: 'd'.repeat(40) }),
    log: (line) => logs.push(String(line)),
  });
  assert.equal(existsSync(join(root, 'sources.lock.json')), false);
  assert.equal(existsSync(join(root, 'skills', 'alpha')), false);
  assert.match(logs.join('\n'), /copy {2}alpha/);
});

test('runSync writes vendored skill when not dry-run', async () => {
  const root = tempDir();
  const remote = tempDir();
  writeSkill(join(remote, 'skills', 'alpha'), 'alpha');
  writeFileSync(join(remote, 'LICENSE'), 'MIT');
  writeCatalog(root, validCatalog());
  await runSync(root, {
    fetchSource: () => ({ path: remote, commit: 'e'.repeat(40) }),
    log: () => {},
  });
  assert.equal(existsSync(join(root, 'skills', 'alpha', 'SKILL.md')), true);
  const lock = JSON.parse(readFileSync(join(root, 'sources.lock.json'), 'utf8'));
  assert.equal(lock.skills.alpha.source, 'acme/kit');
});

test('runStatus and runInstall --dry-run do not call npx', async () => {
  const root = tempDir();
  writeSkill(join(root, 'skills', 'catalog'), 'catalog');
  writeCatalog(root, validCatalog({ sources: [{ source: '.', skills: ['*'] }] }));
  const lines = [];
  runStatus(root, { log: (line) => lines.push(String(line)) });
  assert.match(lines.join('\n'), /First-party/);
  const calls = [];
  runInstall(root, {
    dryRun: true,
    run: (cmd, args) => {
      calls.push([cmd, ...args]);
    },
    log: () => {},
  });
  assert.deepEqual(calls, []);
});

test('resolveGitUrl and sanitizeSource', () => {
  assert.equal(resolveGitUrl('tw93/Waza'), 'https://github.com/tw93/Waza.git');
  assert.equal(resolveGitUrl('https://example.com/r.git'), 'https://example.com/r.git');
  assert.throws(() => resolveGitUrl('not a source'), /Unrecognized/);
  assert.equal(sanitizeSource('tw93/Waza'), 'tw93-Waza');
});

test('matchRequestedSkills expands star', () => {
  const discovered = [
    { name: 'a', dir: '/a', skillPath: 'a/SKILL.md' },
    { name: 'b', dir: '/b', skillPath: 'b/SKILL.md' },
  ];
  assert.equal(matchRequestedSkills(['*'], discovered).matched.length, 2);
  assert.deepEqual(matchRequestedSkills(['B'], discovered).matched.map((s) => s.name), ['b']);
});

test('loadCatalog throws when missing', () => {
  assert.throws(() => loadCatalog(join(tempDir(), 'catalog.json')), /Missing catalog.json/);
});

test('normalizeSkillName', () => {
  assert.equal(normalizeSkillName(' Code_Review '), 'code-review');
});

test('formatPlan empty', () => {
  assert.equal(formatPlan({ copy: [], remove: [] }), 'nothing to do');
});

test('skillSparsePaths keeps skill dirs and skips plugin copies', () => {
  const paths = skillSparsePaths([
    'SKILL.md',
    'scripts/render.py',
    'index.html',
    'LICENSE',
    'assets/fonts/x.ttf',
    'assets/images/hero.png',
    'skills/think/SKILL.md',
    'plugins/waza/skills/think/SKILL.md',
  ]);
  assert.deepEqual(
    paths.sort(),
    [
      'CHEATSHEET.md',
      'LICENSE',
      'SKILL.md',
      'VERSION',
      'agents',
      'assets/fonts',
      'references',
      'scripts',
      'skills/think',
    ].sort()
  );
});

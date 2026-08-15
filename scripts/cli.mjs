#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const SKILLS_PACKAGE = 'skills@latest';
export const LOCK_FILE = 'sources.lock.json';
export const CATALOG_FILE = 'catalog.json';
export const LOCK_VERSION = 1;

const SKIP_WALK_DIRS = new Set([
  '.git',
  '.cache',
  'node_modules',
  'dist',
  'build',
  '__pycache__',
]);

const ROOT_SKILL_COMPANIONS = new Set(['scripts', 'references', 'agents']);
const ROOT_SKILL_FILES = new Set(['SKILL.md', 'LICENSE', 'VERSION', 'CHEATSHEET.md']);
const ROOT_ASSET_SKIP = new Set(['images', 'demos', 'showcase', 'illustrations']);

const ROOT_SKILL_SKIP = new Set([
  '.git',
  '.github',
  '.gitignore',
  '.gitattributes',
  '.claude',
  '.claude-plugin',
  '.agents',
  '.well-known',
  '.husky',
  '.changeset',
  'node_modules',
  'dist',
  'build',
  'package.json',
  'package-lock.json',
  'pnpm-lock.yaml',
  'vercel.json',
  'README.md',
  'AGENTS.md',
  'CLAUDE.md',
  'CHANGELOG.md',
  'index.html',
  'index.md',
]);

export function repoRootFromHere(here = fileURLToPath(import.meta.url)) {
  return resolve(dirname(here), '..');
}

export function normalizeSkillName(name) {
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-');
}

function unquote(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function parseSkillName(skillMdContent, fallback) {
  const match = skillMdContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return fallback;
  const nameLine = match[1].match(/^name:\s*(.+)$/m);
  if (!nameLine) return fallback;
  return normalizeSkillName(unquote(nameLine[1]));
}

function posixJoin(...parts) {
  return parts.join('/').replace(/\\/g, '/').replace(/\/+/g, '/');
}

function discoveryScore(skillPath) {
  if (skillPath === 'SKILL.md') return 2;
  if (skillPath.startsWith('skills/')) return 3;
  if (skillPath.startsWith('plugins/')) return 0;
  return 1;
}

export function discoverSkills(root, { maxDepth = 5 } = {}) {
  const best = new Map();

  function consider(skill) {
    const previous = best.get(skill.name);
    if (!previous || discoveryScore(skill.skillPath) > discoveryScore(previous.skillPath)) {
      best.set(skill.name, skill);
    }
  }

  function walk(dir, depth) {
    if (depth > maxDepth) return;
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    const skillMd = join(dir, 'SKILL.md');
    if (existsSync(skillMd) && statSync(skillMd).isFile()) {
      const fallback = normalizeSkillName(dir.split(sep).pop() || 'skill');
      const name = parseSkillName(readFileSync(skillMd, 'utf8'), fallback);
      consider({
        name,
        dir,
        skillPath: posixJoin(relative(root, skillMd).split(sep).join('/')),
      });
    }

    for (const entry of entries) {
      if (!entry.isDirectory() || SKIP_WALK_DIRS.has(entry.name)) continue;
      walk(join(dir, entry.name), depth + 1);
    }
  }

  walk(root, 0);
  return [...best.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function loadJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function loadCatalog(catalogPath) {
  if (!existsSync(catalogPath)) {
    throw new Error(`Missing ${CATALOG_FILE} at ${catalogPath}`);
  }
  return loadJson(catalogPath);
}

export function emptyLock() {
  return { version: LOCK_VERSION, skills: {} };
}

export function loadLock(lockPath) {
  if (!existsSync(lockPath)) return emptyLock();
  const parsed = loadJson(lockPath);
  if (typeof parsed.version !== 'number' || !parsed.skills || typeof parsed.skills !== 'object') {
    return emptyLock();
  }
  return parsed;
}

export function writeLock(lockPath, lock) {
  const skills = {};
  for (const name of Object.keys(lock.skills).sort()) {
    skills[name] = lock.skills[name];
  }
  writeFileSync(lockPath, JSON.stringify({ version: LOCK_VERSION, skills }, null, 2) + '\n');
}

export function isLocalSource(source) {
  return source === '.' || source.startsWith('./') || source.startsWith('../') || isAbsolute(source);
}

export function remoteSources(catalog) {
  return catalog.sources.filter((entry) => !isLocalSource(entry.source));
}

export function localSources(catalog) {
  return catalog.sources.filter((entry) => isLocalSource(entry.source));
}

export function validateCatalog(catalog) {
  const errors = [];
  if (!catalog || typeof catalog !== 'object') {
    return ['catalog must be an object'];
  }
  if (catalog.global !== true) {
    errors.push('global must be true (v1 only installs from this repo after vendoring)');
  }
  if (!Array.isArray(catalog.agents) || catalog.agents.some((a) => typeof a !== 'string' || !a)) {
    errors.push('agents must be a non-empty array of strings');
  } else if (catalog.agents.length === 0) {
    errors.push('agents must be a non-empty array of strings');
  }
  if (!Array.isArray(catalog.sources) || catalog.sources.length === 0) {
    errors.push('sources must be a non-empty array');
    return errors;
  }

  const claimed = new Map();
  for (const [index, entry] of catalog.sources.entries()) {
    const prefix = `sources[${index}]`;
    if (!entry || typeof entry !== 'object') {
      errors.push(`${prefix} must be an object`);
      continue;
    }
    if (typeof entry.source !== 'string' || !entry.source.trim()) {
      errors.push(`${prefix}.source is required`);
    }
    if (!Array.isArray(entry.skills) || entry.skills.length === 0) {
      errors.push(`${prefix}.skills must be a non-empty array`);
      continue;
    }
    if (entry.skills.some((name) => typeof name !== 'string' || !name.trim())) {
      errors.push(`${prefix}.skills must contain only non-empty strings`);
      continue;
    }
    if (entry.skills.includes('*') && entry.skills.length > 1) {
      errors.push(`${prefix}.skills cannot mix "*" with other names`);
    }
    if (entry.skills.includes('*')) continue;
    for (const raw of entry.skills) {
      const name = normalizeSkillName(raw);
      const previous = claimed.get(name);
      if (previous && previous !== entry.source) {
        errors.push(`skill "${name}" is claimed by both ${previous} and ${entry.source}`);
      } else {
        claimed.set(name, entry.source);
      }
    }
  }
  return errors;
}

export function claimedRemoteNames(catalog) {
  const names = new Map();
  for (const entry of remoteSources(catalog)) {
    if (entry.skills.includes('*')) continue;
    for (const raw of entry.skills) {
      names.set(normalizeSkillName(raw), entry.source);
    }
  }
  return names;
}

export function firstPartyNamesOnDisk(skillsDir, lock) {
  if (!existsSync(skillsDir)) return [];
  const names = [];
  for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (!existsSync(join(skillsDir, entry.name, 'SKILL.md'))) continue;
    const name = normalizeSkillName(entry.name);
    if (!lock.skills[name]) names.push(name);
  }
  return names.sort();
}

export function resolveGitUrl(source) {
  if (
    source.startsWith('git@') ||
    source.startsWith('ssh://') ||
    source.startsWith('http://') ||
    source.startsWith('https://')
  ) {
    return source;
  }
  if (/^[^/]+\/[^/]+$/.test(source)) {
    return `https://github.com/${source}.git`;
  }
  throw new Error(`Unrecognized source: ${source}`);
}

export function sanitizeSource(source) {
  return source.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
}

export function defaultRun(cmd, args, opts = {}) {
  const { env: extraEnv, timeout = 180_000, ...rest } = opts;
  const result = spawnSync(cmd, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout,
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0', ...extraEnv },
    ...rest,
  });
  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || result.error?.message || '').trim();
    throw new Error(`${cmd} ${args.join(' ')} failed${detail ? `: ${detail}` : ''}`);
  }
  return result.stdout;
}

export function skillSparsePaths(treeFiles) {
  const paths = new Set();
  for (const file of treeFiles) {
    if (file !== 'SKILL.md' && !file.endsWith('/SKILL.md')) continue;
    if (file.startsWith('plugins/')) continue;
    if (file === 'SKILL.md') {
      for (const name of ROOT_SKILL_FILES) paths.add(name);
      for (const companion of ROOT_SKILL_COMPANIONS) paths.add(companion);
      continue;
    }
    paths.add(file.slice(0, -'/SKILL.md'.length));
  }
  for (const file of treeFiles) {
    const match = file.match(/^assets\/([^/]+)/);
    if (match && !ROOT_ASSET_SKIP.has(match[1])) paths.add(`assets/${match[1]}`);
  }
  for (const license of ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'COPYING']) {
    if (treeFiles.includes(license)) paths.add(license);
  }
  return [...paths];
}

function isUsableGitRepo(dest, run) {
  try {
    run('git', ['-C', dest, 'rev-parse', 'HEAD']);
    return true;
  } catch {
    return false;
  }
}

function applySparsePaths(dest, run) {
  const treeFiles = run('git', ['-C', dest, 'ls-tree', '-r', '--name-only', 'HEAD'])
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const paths = skillSparsePaths(treeFiles);
  if (paths.length === 0) return;
  run('git', ['-C', dest, 'sparse-checkout', 'set', '--skip-checks', ...paths]);
}

function cloneSparse(url, dest, run) {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
      run('git', ['clone', '--depth', '1', '--filter=blob:none', '--sparse', url, dest]);
      applySparsePaths(dest, run);
      return;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

export function fetchGitSource(source, cacheDir, run = defaultRun) {
  const url = resolveGitUrl(source);
  const dest = join(cacheDir, sanitizeSource(source));
  mkdirSync(cacheDir, { recursive: true });
  if (isUsableGitRepo(dest, run)) {
    run('git', ['-C', dest, 'fetch', '--depth', '1', 'origin']);
    run('git', ['-C', dest, 'reset', '--hard', 'FETCH_HEAD']);
  } else {
    cloneSparse(url, dest, run);
  }
  const commit = run('git', ['-C', dest, 'rev-parse', 'HEAD']).trim();
  return { path: dest, commit };
}

function isInside(root, candidate) {
  const rel = relative(root, candidate);
  return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel));
}

function copySkillAssets(fromDir, toDir) {
  mkdirSync(toDir, { recursive: true });
  for (const entry of readdirSync(fromDir, { withFileTypes: true })) {
    if (ROOT_ASSET_SKIP.has(entry.name)) continue;
    cpSync(join(fromDir, entry.name), join(toDir, entry.name), { recursive: true });
  }
}

export function copySkill(fromDir, toDir, repoRoot) {
  rmSync(toDir, { recursive: true, force: true });
  mkdirSync(dirname(toDir), { recursive: true });

  const rootSkill = resolve(fromDir) === resolve(repoRoot);
  if (!rootSkill) {
    cpSync(fromDir, toDir, {
      recursive: true,
      filter: (src) => {
        const base = src.split(sep).pop();
        return base !== '.git';
      },
    });
    return;
  }

  mkdirSync(toDir, { recursive: true });
  for (const entry of readdirSync(fromDir, { withFileTypes: true })) {
    if (ROOT_SKILL_SKIP.has(entry.name)) continue;
    const src = join(fromDir, entry.name);
    if (entry.isDirectory() && entry.name === 'assets') {
      copySkillAssets(src, join(toDir, 'assets'));
      continue;
    }
    if (entry.isDirectory() && !ROOT_SKILL_COMPANIONS.has(entry.name)) continue;
    if (entry.isFile() && !ROOT_SKILL_FILES.has(entry.name)) continue;
    cpSync(src, join(toDir, entry.name), {
      recursive: true,
      filter: (file) => file.split(sep).pop() !== '.git',
    });
  }
}

export function copyUpstreamLicense(repoRoot, destDir) {
  const licenseNames = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'COPYING'];
  const found = licenseNames.find((name) => existsSync(join(repoRoot, name)));
  if (!found) return null;
  mkdirSync(destDir, { recursive: true });
  const dest = join(destDir, 'LICENSE');
  cpSync(join(repoRoot, found), dest);
  return dest;
}

export function matchRequestedSkills(requested, discovered) {
  const byName = new Map(discovered.map((skill) => [skill.name, skill]));
  if (requested.length === 1 && requested[0] === '*') {
    return { matched: discovered.slice(), missing: [] };
  }
  const matched = [];
  const missing = [];
  for (const raw of requested) {
    const name = normalizeSkillName(raw);
    const skill = byName.get(name);
    if (skill) matched.push(skill);
    else missing.push(name);
  }
  return { matched, missing };
}

export function planSync({ catalog, lock, skillsDir, fetched }) {
  const errors = validateCatalog(catalog);
  if (errors.length) {
    return { copy: [], remove: [], licenses: [], errors };
  }

  const copy = [];
  const licenses = [];
  const nextRemoteNames = new Set();

  for (const entry of remoteSources(catalog)) {
    const fetchedSource = fetched[entry.source];
    if (!fetchedSource) {
      errors.push(`source ${entry.source} was not fetched`);
      continue;
    }
    const { matched, missing } = matchRequestedSkills(entry.skills, fetchedSource.skills);
    for (const name of missing) {
      errors.push(`${entry.source} has no skill named "${name}"`);
    }
    for (const skill of matched) {
      nextRemoteNames.add(skill.name);
      const dest = join(skillsDir, skill.name);
      const existingFirstParty = existsSync(dest) && !lock.skills[skill.name];
      if (existingFirstParty) {
        errors.push(
          `refusing to overwrite first-party skill "${skill.name}" with ${entry.source}`
        );
        continue;
      }
      copy.push({
        name: skill.name,
        from: skill.dir,
        to: dest,
        source: entry.source,
        skillPath: skill.skillPath,
        commit: fetchedSource.commit,
        repoRoot: fetchedSource.path,
      });
    }
    licenses.push({
      source: entry.source,
      repoRoot: fetchedSource.path,
    });
  }

  if (errors.length) {
    return { copy: [], remove: [], licenses: [], errors };
  }

  const remove = [];
  for (const [name, entry] of Object.entries(lock.skills)) {
    if (nextRemoteNames.has(name)) continue;
    remove.push({
      name,
      dir: join(skillsDir, name),
      source: entry.source,
    });
  }

  return { copy, remove, licenses, errors };
}

export function applySync(plan, { skillsDir, thirdPartyDir, lockPath, lock }) {
  mkdirSync(skillsDir, { recursive: true });
  mkdirSync(thirdPartyDir, { recursive: true });

  for (const item of plan.remove) {
    if (existsSync(item.dir) && isInside(skillsDir, item.dir)) {
      rmSync(item.dir, { recursive: true, force: true });
    }
    delete lock.skills[item.name];
  }

  for (const item of plan.copy) {
    copySkill(item.from, item.to, item.repoRoot);
    lock.skills[item.name] = {
      source: item.source,
      skillPath: item.skillPath,
      commit: item.commit,
    };
  }

  for (const item of plan.licenses) {
    copyUpstreamLicense(item.repoRoot, join(thirdPartyDir, sanitizeSource(item.source)));
  }

  writeLock(lockPath, lock);
  return lock;
}

export function statusReport({ catalog, lock, skillsDir }) {
  const remote = [];
  const seen = new Set();

  for (const entry of remoteSources(catalog)) {
    const requested =
      entry.skills.length === 1 && entry.skills[0] === '*'
        ? Object.entries(lock.skills)
            .filter(([, meta]) => meta.source === entry.source)
            .map(([name]) => name)
        : entry.skills.map(normalizeSkillName);
    for (const name of requested) {
      seen.add(name);
      const onDisk = existsSync(join(skillsDir, name, 'SKILL.md'));
      const locked = lock.skills[name];
      let state = 'ok';
      if (!onDisk) state = 'missing';
      else if (!locked) state = 'untracked';
      else if (locked.source !== entry.source) state = 'source-mismatch';
      remote.push({
        name,
        source: entry.source,
        state,
        commit: locked?.commit ?? null,
      });
    }
  }

  const firstParty = firstPartyNamesOnDisk(skillsDir, lock).map((name) => ({
    name,
    state: 'ok',
  }));

  const stale = Object.keys(lock.skills)
    .filter((name) => !seen.has(name))
    .sort()
    .map((name) => ({
      name,
      source: lock.skills[name].source,
      state: 'stale',
    }));

  return { remote, firstParty, stale };
}

export function buildInstallCommand(catalog, repoRoot) {
  const args = ['--yes', SKILLS_PACKAGE, 'add', repoRoot, '--skill', '*'];
  if (catalog.global) args.push('-g');
  args.push('-y');
  for (const agent of catalog.agents) {
    args.push('-a', agent);
  }
  return { cmd: 'npx', args };
}

export function formatStatus(report) {
  const lines = [];
  lines.push('Vendored');
  if (report.remote.length === 0) lines.push('  (none)');
  for (const item of report.remote) {
    const commit = item.commit ? ` ${item.commit.slice(0, 7)}` : '';
    lines.push(`  ${item.state.padEnd(16)} ${item.name}  ${item.source}${commit}`);
  }
  lines.push('First-party');
  if (report.firstParty.length === 0) lines.push('  (none)');
  for (const item of report.firstParty) {
    lines.push(`  ${item.state.padEnd(16)} ${item.name}`);
  }
  if (report.stale.length) {
    lines.push('Stale lock entries (removed from catalog; next sync deletes them)');
    for (const item of report.stale) {
      lines.push(`  ${item.state.padEnd(16)} ${item.name}  ${item.source}`);
    }
  }
  return lines.join('\n');
}

export function formatPlan(plan) {
  const lines = [];
  for (const item of plan.copy) {
    lines.push(`copy  ${item.name}  <-  ${item.source}  ${item.skillPath}  ${item.commit.slice(0, 7)}`);
  }
  for (const item of plan.remove) {
    lines.push(`rm    ${item.name}  (was ${item.source})`);
  }
  if (plan.copy.length === 0 && plan.remove.length === 0) {
    lines.push('nothing to do');
  }
  return lines.join('\n');
}

export async function runSync(root, { dryRun = false, fetchSource = fetchGitSource, log = console.log } = {}) {
  const catalog = loadCatalog(join(root, CATALOG_FILE));
  const lock = loadLock(join(root, LOCK_FILE));
  const errors = validateCatalog(catalog);
  if (errors.length) {
    throw new Error(errors.join('\n'));
  }

  const cacheDir = join(root, '.cache', 'sources');
  const fetched = {};
  for (const entry of remoteSources(catalog)) {
    log(`fetch ${entry.source}`);
    const result = fetchSource(entry.source, cacheDir);
    fetched[entry.source] = {
      ...result,
      skills: discoverSkills(result.path),
    };
  }

  const plan = planSync({
    catalog,
    lock,
    skillsDir: join(root, 'skills'),
    fetched,
  });
  if (plan.errors.length) {
    throw new Error(plan.errors.join('\n'));
  }

  log(formatPlan(plan));
  if (dryRun) return plan;

  applySync(plan, {
    skillsDir: join(root, 'skills'),
    thirdPartyDir: join(root, 'third_party'),
    lockPath: join(root, LOCK_FILE),
    lock,
  });
  return plan;
}

export function runStatus(root, { log = console.log } = {}) {
  const catalog = loadCatalog(join(root, CATALOG_FILE));
  const errors = validateCatalog(catalog);
  if (errors.length) throw new Error(errors.join('\n'));
  const report = statusReport({
    catalog,
    lock: loadLock(join(root, LOCK_FILE)),
    skillsDir: join(root, 'skills'),
  });
  log(formatStatus(report));
  return report;
}

export function runInstall(root, { dryRun = false, run = defaultRun, log = console.log } = {}) {
  const catalog = loadCatalog(join(root, CATALOG_FILE));
  const errors = validateCatalog(catalog);
  if (errors.length) throw new Error(errors.join('\n'));
  const { cmd, args } = buildInstallCommand(catalog, root);
  const printable = [cmd, ...args].join(' ');
  log(printable);
  if (dryRun) return { cmd, args };
  run(cmd, args, { cwd: root });
  return { cmd, args };
}

function printHelp(log = console.log) {
  log(`Usage: node scripts/cli.mjs <command> [--dry-run]

Commands:
  sync      Fetch remotes listed in catalog.json into skills/
  update    Same as sync
  status    Compare catalog.json, sources.lock.json, and skills/
  install   Install this repo's skills globally via npx skills
`);
}

export async function main(argv = process.argv.slice(2), opts = {}) {
  const root = opts.root ?? repoRootFromHere();
  const command = argv.find((arg) => !arg.startsWith('-')) ?? 'help';
  const dryRun = argv.includes('--dry-run');
  const log = opts.log ?? console.log;

  switch (command) {
    case 'sync':
    case 'update':
      await runSync(root, { dryRun, fetchSource: opts.fetchSource, log });
      return;
    case 'status':
      runStatus(root, { log });
      return;
    case 'install':
      runInstall(root, { dryRun, run: opts.run, log });
      return;
    case 'help':
    case '--help':
    case '-h':
      printHelp(log);
      return;
    default:
      throw new Error(`Unknown command: ${command}`);
  }
}

const invoked = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invoked) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

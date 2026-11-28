#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const SKILLS_PACKAGE = 'skills@latest';
export const CATALOG_FILE = 'catalog.json';
export const README_FILE = 'README.md';
export const SKILLS_DIR = 'skills';
export const SHARED_DIR = 'shared';
export const README_INDEX_START = '<!-- skills-index:start -->';
export const README_INDEX_END = '<!-- skills-index:end -->';

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

function unescapeYamlDoubleQuoted(value) {
  return value.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
}

function unescapeYamlSingleQuoted(value) {
  return value.replace(/''/g, "'");
}

function parseYamlBlock(lines, startIndex, indicator) {
  const block = [];
  let index = startIndex + 1;
  while (index < lines.length) {
    const line = lines[index];
    if (line === '' || /^\s+/.test(line)) {
      block.push(line.replace(/^ {2}/, ''));
      index += 1;
      continue;
    }
    break;
  }
  const raw = block.join(indicator.startsWith('>') ? ' ' : '\n');
  return { value: raw.replace(/\s+/g, ' ').trim(), nextIndex: index };
}

export function parseFrontmatter(skillMdContent) {
  const match = skillMdContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { name: null, description: '' };

  const lines = match[1].split(/\r?\n/);
  let name = null;
  let description = '';

  for (let i = 0; i < lines.length; i++) {
    const field = lines[i].match(/^(name|description):\s*(.*)$/);
    if (!field) continue;
    const [, key, rest] = field;
    let value = rest;
    if (rest === '>' || rest === '>-' || rest === '|' || rest === '|-') {
      const block = parseYamlBlock(lines, i, rest);
      value = block.value;
      i = block.nextIndex - 1;
    } else if (rest.startsWith('"') && rest.endsWith('"') && rest.length >= 2) {
      value = unescapeYamlDoubleQuoted(rest.slice(1, -1));
    } else if (rest.startsWith("'") && rest.endsWith("'") && rest.length >= 2) {
      value = unescapeYamlSingleQuoted(rest.slice(1, -1));
    } else {
      value = unquote(rest);
    }
    if (key === 'name') name = normalizeSkillName(value);
    if (key === 'description') description = value.replace(/\s+/g, ' ').trim();
  }

  return { name, description };
}

export function loadCatalog(catalogPath) {
  if (!existsSync(catalogPath)) {
    throw new Error(`Missing ${CATALOG_FILE} at ${catalogPath}`);
  }
  return JSON.parse(readFileSync(catalogPath, 'utf8'));
}

export function validateCatalog(catalog) {
  if (!catalog || typeof catalog !== 'object') {
    return ['catalog must be an object'];
  }
  const errors = [];
  if (catalog.global !== true) {
    errors.push('global must be true');
  }
  if (
    !Array.isArray(catalog.agents) ||
    catalog.agents.length === 0 ||
    catalog.agents.some((a) => typeof a !== 'string' || !a)
  ) {
    errors.push('agents must be a non-empty array of strings');
  }
  if (catalog.sources !== undefined) {
    errors.push('sources is not supported: every skill in skills/ is part of the collection');
  }
  if (catalog.notGrouped !== undefined && catalog.notGrouped !== 'top' && catalog.notGrouped !== 'bottom') {
    errors.push('notGrouped must be "top" or "bottom"');
  }
  if (
    catalog.notSkills !== undefined &&
    (!Array.isArray(catalog.notSkills) || catalog.notSkills.some((n) => typeof n !== 'string' || !n))
  ) {
    errors.push('notSkills must be an array of names that skill text may mention as /name without being a skill');
  }
  errors.push(...validateGroupings(catalog));
  errors.push(...validateShared(catalog));
  return errors;
}

function isSharedPath(path) {
  if (typeof path !== 'string' || !path || path.includes('\\') || path.startsWith('/')) return false;
  const parts = path.split('/');
  if (parts.some((part) => !part || part === '.' || part === '..')) return false;
  return !(parts.length === 1 && parts[0].toLowerCase() === 'skill.md');
}

export function validateShared(catalog) {
  if (catalog.shared === undefined) return [];
  if (!Array.isArray(catalog.shared)) return ['shared must be an array'];
  const errors = [];
  const seen = new Set();
  for (const [index, entry] of catalog.shared.entries()) {
    const prefix = `shared[${index}]`;
    if (!entry || typeof entry !== 'object') {
      errors.push(`${prefix} must be an object`);
      continue;
    }
    if (!isSharedPath(entry.path)) {
      errors.push(`${prefix}.path must be a relative path inside a skill, other than SKILL.md`);
      continue;
    }
    if (
      !Array.isArray(entry.skills) ||
      entry.skills.length === 0 ||
      entry.skills.some((name) => typeof name !== 'string' || !name.trim() || name.trim() === '*')
    ) {
      errors.push(`${prefix}.skills must be a non-empty array of skill names`);
      continue;
    }
    for (const raw of entry.skills) {
      const key = `${normalizeSkillName(raw)}/${entry.path}`;
      if (seen.has(key)) errors.push(`shared file ${key} is listed twice`);
      seen.add(key);
    }
  }
  return errors;
}

// Each catalog.shared entry copies shared/<path> to skills/<skill>/<path>.
// Installed skills stay self-contained; the repo keeps one source.
export function planShared({ catalog, skillsDir, sharedDir }) {
  const items = [];
  const errors = [];
  for (const entry of catalog.shared ?? []) {
    const parts = entry.path.split('/');
    const from = join(sharedDir, ...parts);
    if (!existsSync(from) || !statSync(from).isFile()) {
      errors.push(`${SHARED_DIR}/${entry.path} is not a file`);
      continue;
    }
    const content = readFileSync(from);
    for (const raw of entry.skills) {
      const skill = normalizeSkillName(raw);
      if (!existsSync(join(skillsDir, skill, 'SKILL.md'))) {
        errors.push(`${SHARED_DIR}/${entry.path} names "${skill}", which is not a skill in ${SKILLS_DIR}/`);
        continue;
      }
      const to = join(skillsDir, skill, ...parts);
      let state = 'ok';
      if (!existsSync(to)) state = 'missing';
      else if (!readFileSync(to).equals(content)) state = 'differs';
      items.push({ path: entry.path, skill, from, to, state });
    }
  }
  return { items, errors };
}

export function applyShared(items) {
  for (const item of items) {
    if (item.state === 'ok') continue;
    mkdirSync(dirname(item.to), { recursive: true });
    copyFileSync(item.from, item.to);
  }
}

const GROUP_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function titleCaseName(name) {
  return String(name)
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function validateGroupings(catalog) {
  if (catalog.groupings === undefined) return [];
  if (!Array.isArray(catalog.groupings)) return ['groupings must be an array'];

  const errors = [];
  const groupNames = new Set();
  const groupedSkills = new Map();

  for (const [index, group] of catalog.groupings.entries()) {
    const prefix = `groupings[${index}]`;
    if (!group || typeof group !== 'object') {
      errors.push(`${prefix} must be an object`);
      continue;
    }
    if (typeof group.name !== 'string' || !GROUP_NAME.test(group.name)) {
      errors.push(`${prefix}.name must be kebab-case`);
    } else if (groupNames.has(group.name)) {
      errors.push(`grouping "${group.name}" is declared twice`);
    } else {
      groupNames.add(group.name);
    }
    if (group.title !== undefined && (typeof group.title !== 'string' || !group.title.trim())) {
      errors.push(`${prefix}.title must be a non-empty string when set`);
    }
    if (
      group.description !== undefined &&
      (typeof group.description !== 'string' || !group.description.trim())
    ) {
      errors.push(`${prefix}.description must be a non-empty string when set`);
    }
    if (!Array.isArray(group.skills) || group.skills.length === 0) {
      errors.push(`${prefix}.skills must be a non-empty array`);
      continue;
    }
    if (group.skills.includes('*')) {
      errors.push(`${prefix}.skills cannot contain "*"`);
      continue;
    }
    if (group.skills.some((name) => typeof name !== 'string' || !name.trim())) {
      errors.push(`${prefix}.skills must contain only non-empty strings`);
      continue;
    }
    for (const raw of group.skills) {
      const name = normalizeSkillName(raw);
      const previous = groupedSkills.get(name);
      if (previous) {
        errors.push(`skill "${name}" is in both "${previous}" and "${group.name}"`);
      } else {
        groupedSkills.set(name, group.name);
      }
    }
  }
  return errors;
}

export function groupingMembershipErrors(catalog, knownNames) {
  const known = new Set([...knownNames].map(normalizeSkillName));
  const errors = [];
  for (const group of catalog.groupings ?? []) {
    for (const raw of group.skills ?? []) {
      const name = normalizeSkillName(raw);
      if (!known.has(name)) {
        errors.push(`grouping "${group.name}" lists "${name}", which is not in ${SKILLS_DIR}/`);
      }
    }
  }
  return errors;
}

export function renderMarketplaceJson(catalog) {
  return {
    name: 'skills',
    plugins: (catalog.groupings ?? []).map((group) => ({
      name: group.name,
      source: './',
      skills: group.skills.map((skill) => `./${SKILLS_DIR}/${normalizeSkillName(skill)}`),
    })),
  };
}

export function renderSkillsShJson(catalog) {
  return {
    $schema: 'https://skills.sh/schemas/skills.sh.schema.json',
    notGrouped: catalog.notGrouped === 'top' ? 'top' : 'bottom',
    groupings: (catalog.groupings ?? []).map((group) => ({
      title: group.title?.trim() || titleCaseName(group.name),
      ...(group.description?.trim() ? { description: group.description.trim() } : {}),
      skills: group.skills.map(normalizeSkillName),
    })),
  };
}

export function writeGeneratedConfigs(root, catalog, knownNames) {
  const errors = groupingMembershipErrors(catalog, knownNames);
  if (errors.length) throw new Error(errors.join('\n'));
  mkdirSync(join(root, '.claude-plugin'), { recursive: true });
  writeFileSync(
    join(root, '.claude-plugin', 'marketplace.json'),
    JSON.stringify(renderMarketplaceJson(catalog), null, 2) + '\n'
  );
  writeFileSync(join(root, 'skills.sh.json'), JSON.stringify(renderSkillsShJson(catalog), null, 2) + '\n');
}

// Every directory in skills/ with a SKILL.md is in the collection.
// A skill whose frontmatter name differs from its directory is marked name-mismatch.
export function listSkills(skillsDir) {
  const skills = [];
  if (!existsSync(skillsDir)) return skills;
  for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const skillMd = join(skillsDir, entry.name, 'SKILL.md');
    if (!existsSync(skillMd)) continue;
    const parsed = parseFrontmatter(readFileSync(skillMd, 'utf8'));
    skills.push({
      name: entry.name,
      description: parsed.description,
      state: parsed.name === entry.name ? 'ok' : 'name-mismatch',
    });
  }
  return skills.sort((a, b) => a.name.localeCompare(b.name));
}

export function escapeTableCell(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/\|/g, '\\|')
    .trim();
}

export function renderSkillsIndex(skills) {
  const table =
    skills.length === 0
      ? '_None._'
      : [
          '| Skill | Description |',
          '| --- | --- |',
          ...skills.map(
            (skill) =>
              `| [${skill.name}](${SKILLS_DIR}/${skill.name}/SKILL.md) | ${escapeTableCell(skill.description)} |`
          ),
        ].join('\n');
  return [
    README_INDEX_START,
    '',
    '## Skills',
    '',
    table,
    '',
    '_Generated by `node scripts/cli.mjs sync`. Do not edit this table by hand._',
    '',
    README_INDEX_END,
  ].join('\n');
}

export function updateReadme(readmePath, skills) {
  if (!existsSync(readmePath)) return false;
  const current = readFileSync(readmePath, 'utf8');
  const block = renderSkillsIndex(skills);
  const start = current.indexOf(README_INDEX_START);
  const end = current.indexOf(README_INDEX_END);
  let next;
  if (start !== -1 && end !== -1 && end >= start) {
    next = current.slice(0, start) + block + current.slice(end + README_INDEX_END.length);
  } else {
    const intro = current.match(/^# [^\n]+\n+(?:(?!^## ).*\n+)*/m);
    if (intro) {
      next = current.slice(0, intro[0].length) + block + '\n\n' + current.slice(intro[0].length);
    } else {
      next = `${block}\n\n${current}`;
    }
  }
  if (next === current) return false;
  writeFileSync(readmePath, next);
  return true;
}

export function defaultRun(cmd, args, opts = {}) {
  const { timeout = 180_000, ...rest } = opts;
  const result = spawnSync(cmd, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout,
    ...rest,
  });
  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || result.error?.message || '').trim();
    throw new Error(`${cmd} ${args.join(' ')} failed${detail ? `: ${detail}` : ''}`);
  }
  return result.stdout;
}

export const DESCRIPTION_MAX = 1024;

function listFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...listFiles(path));
    else files.push(path);
  }
  return files;
}

function withoutFences(text) {
  const out = [];
  let fence = null;
  for (const line of text.split(/\r?\n/)) {
    const marker = /^\s*(`{3,}|~{3,})/.exec(line)?.[1];
    if (fence) {
      if (marker && marker[0] === fence[0] && marker.length >= fence.length) fence = null;
      out.push('');
      continue;
    }
    if (marker) {
      fence = marker;
      out.push('');
      continue;
    }
    out.push(line.replace(/`[^`]*`/g, ''));
  }
  return out.join('\n');
}

// Lints each skill's text: the description fits the budget and is YAML-safe,
// every relative Markdown link resolves, and every `/name`, `$name`, or
// "`name` skill" mention names a skill in skills/ (or catalog.notSkills), and
// every principles/*.md copy is linked from the skill's own text.
export function lintSkills({ catalog, root }) {
  const skillsDir = join(root, SKILLS_DIR);
  const skills = listSkills(skillsDir);
  const known = new Set([...skills.map((skill) => skill.name), ...(catalog.notSkills ?? [])]);
  const problems = [];
  for (const { name, description } of skills) {
    const dir = join(skillsDir, name);
    const skillMd = readFileSync(join(dir, 'SKILL.md'), 'utf8');
    const raw = /^description: (.*)$/m.exec(skillMd)?.[1] ?? '';
    if (!description) problems.push(`${SKILLS_DIR}/${name}/SKILL.md: description is empty`);
    if (description.length > DESCRIPTION_MAX) {
      problems.push(`${SKILLS_DIR}/${name}/SKILL.md: description is ${description.length} characters, over ${DESCRIPTION_MAX}`);
    }
    if (!/^(["']).*\1$/.test(raw) && /: | #/.test(raw)) {
      problems.push(`${SKILLS_DIR}/${name}/SKILL.md: description holds ": " or " #" and must be quoted`);
    }
    for (const file of listFiles(dir).filter((path) => path.endsWith('.md'))) {
      const rel = file.slice(root.length + 1);
      const text = readFileSync(file, 'utf8');
      for (const [, target] of withoutFences(text).matchAll(/\]\(([^)\s]+)\)/g)) {
        if (/^[a-z]+:/i.test(target) || target.startsWith('#') || target.includes('<')) continue;
        const path = decodeURIComponent(target.split('#')[0]);
        if (!existsSync(resolve(dirname(file), path))) problems.push(`${rel}: link ${target} does not resolve`);
      }
      const mentions = [
        ...text.matchAll(/`[/$]([a-z][a-z0-9-]*)[`\s]/g),
        ...text.matchAll(/`([a-z][a-z0-9-]*)` skill\b/g),
      ];
      for (const [, mention] of mentions) {
        if (!known.has(mention)) problems.push(`${rel}: names a skill "${mention}" that is not in ${SKILLS_DIR}/`);
      }
    }
    const principles = join(dir, 'principles');
    if (existsSync(principles)) {
      const texts = listFiles(dir)
        .filter((path) => path.endsWith('.md') && !path.startsWith(principles))
        .map((path) => readFileSync(path, 'utf8'))
        .join('\n');
      for (const file of readdirSync(principles).filter((f) => f.endsWith('.md'))) {
        if (!texts.includes(`principles/${file}`)) {
          problems.push(`${SKILLS_DIR}/${name}/principles/${file}: no file of the skill links it; link it where it applies, or drop the skill from its shared entry`);
        }
      }
    }
  }
  return [...new Set(problems)];
}

export function statusReport({ catalog, root }) {
  const skills = listSkills(join(root, SKILLS_DIR));
  const shared = planShared({
    catalog,
    skillsDir: join(root, SKILLS_DIR),
    sharedDir: join(root, SHARED_DIR),
  });
  return {
    skills,
    groupingErrors: groupingMembershipErrors(
      catalog,
      skills.map((skill) => skill.name)
    ),
    shared: shared.items,
    sharedErrors: shared.errors,
    lint: lintSkills({ catalog, root }),
  };
}

export function statusProblems(report) {
  return [
    ...report.skills
      .filter((skill) => skill.state !== 'ok')
      .map((skill) => `${SKILLS_DIR}/${skill.name}/SKILL.md ${skill.state}: frontmatter name must match the directory`),
    ...report.groupingErrors,
    ...report.sharedErrors,
    ...report.shared
      .filter((item) => item.state !== 'ok')
      .map((item) => `${SKILLS_DIR}/${item.skill}/${item.path} ${item.state} from ${SHARED_DIR}/${item.path}`),
    ...(report.lint ?? []),
  ];
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
  const lines = ['Skills'];
  if (report.skills.length === 0) lines.push('  (none)');
  for (const skill of report.skills) {
    lines.push(`  ${skill.state.padEnd(16)} ${skill.name}`);
  }
  for (const message of report.groupingErrors) {
    lines.push(`  ${'error'.padEnd(16)} ${message}`);
  }
  if (report.shared.length || report.sharedErrors.length) {
    lines.push(`Shared files (edit ${SHARED_DIR}/, then run sync)`);
    for (const item of report.shared) {
      lines.push(`  ${item.state.padEnd(16)} ${item.skill}/${item.path}`);
    }
    for (const message of report.sharedErrors) {
      lines.push(`  ${'error'.padEnd(16)} ${message}`);
    }
  }
  if (report.lint?.length) {
    lines.push('Lint');
    for (const message of report.lint) lines.push(`  ${'error'.padEnd(16)} ${message}`);
  }
  return lines.join('\n');
}

function loadValidCatalog(root) {
  const catalog = loadCatalog(join(root, CATALOG_FILE));
  const errors = validateCatalog(catalog);
  if (errors.length) throw new Error(errors.join('\n'));
  return catalog;
}

// Copies shared files into the skills that list them, then regenerates the README index and group configs.
export function runSync(root, { dryRun = false, log = console.log } = {}) {
  const catalog = loadValidCatalog(root);
  const skillsDir = join(root, SKILLS_DIR);
  const shared = planShared({ catalog, skillsDir, sharedDir: join(root, SHARED_DIR) });
  if (shared.errors.length) throw new Error(shared.errors.join('\n'));

  const pending = shared.items.filter((item) => item.state !== 'ok');
  for (const item of pending) {
    log(`share ${item.skill}/${item.path}  <-  ${SHARED_DIR}/${item.path}  (${item.state})`);
  }
  if (pending.length === 0) log('shared files up to date');
  if (dryRun) return shared.items;

  applyShared(pending);
  const skills = listSkills(skillsDir);
  updateReadme(join(root, README_FILE), skills);
  writeGeneratedConfigs(
    root,
    catalog,
    skills.map((skill) => skill.name)
  );
  return shared.items;
}

export function runStatus(root, { log = console.log } = {}) {
  const report = statusReport({ catalog: loadValidCatalog(root), root });
  log(formatStatus(report));
  return report;
}

export function runInstall(root, { dryRun = false, run = defaultRun, log = console.log } = {}) {
  const catalog = loadValidCatalog(root);
  const problems = statusProblems(statusReport({ catalog, root }));
  if (problems.length) {
    throw new Error(`${problems.join('\n')}\nFix these, then run node scripts/cli.mjs sync before install.`);
  }
  const { cmd, args } = buildInstallCommand(catalog, root);
  log([cmd, ...args].join(' '));
  if (dryRun) return { cmd, args };
  run(cmd, args, { cwd: root });
  return { cmd, args };
}

function printHelp(log = console.log) {
  log(`Usage: node scripts/cli.mjs <command> [--dry-run]

Commands:
  sync      Copy shared/ files into the skills that list them, then regenerate
            the README index, .claude-plugin/marketplace.json, and skills.sh.json
  status    Check skills/, catalog.json groupings, and shared/ copies
  install   Install this repo's skills globally via npx skills
`);
}

export function main(argv = process.argv.slice(2), opts = {}) {
  const root = opts.root ?? repoRootFromHere();
  const command = argv.find((arg) => !arg.startsWith('-')) ?? 'help';
  const dryRun = argv.includes('--dry-run');
  const log = opts.log ?? console.log;

  switch (command) {
    case 'sync':
      runSync(root, { dryRun, log });
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
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

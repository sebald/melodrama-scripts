import test from 'ava';
import path from 'path';
import fs from 'fs-extra';
import { v4 } from 'uuid';
import {
  run,
  bootstrapDirectory,
  prepareInstallCommand,
  prepareDependencies } from './lib/bootstrap.js';

const testDir = path.resolve(process.cwd(), '.tmp/test');
const getTmpDir = () => path.resolve(testDir, v4());

test.before('clean up temporary directory', () => {
  fs.removeSync(testDir);
});

// Just a smoke test...
test('expose a `run` command', async t => {
  t.is(typeof run, 'function');
});

test('create package.json', async t => {
  const dir = getTmpDir();
  await bootstrapDirectory(dir);
  const pkg = fs.readJsonSync(`${dir}/package.json`);

  t.true(fs.existsSync(dir));
  t.is(pkg.name, path.basename(dir));
  t.is(pkg.version, '1.0.0');
  t.is(pkg.private, true);
  t.is(pkg.readme, 'README.md');
  t.regex(pkg.scripts.start, /melodrama-scripts start/);
});

test('update package.json', async t => {
  const dir = getTmpDir();
  fs.outputJsonSync(path.join(dir, 'package.json'), { name: 'my-presentation', version: '0.0.1' });
  await bootstrapDirectory(dir);
  const pkg = fs.readJsonSync(`${dir}/package.json`);

  t.is(pkg.name, 'my-presentation');
  t.is(pkg.version, '0.0.1');
  t.is(pkg.private, true);
  t.is(pkg.readme, 'README.md');
  t.regex(pkg.scripts.start, /melodrama-scripts start/);
});

test('create README', async t => {
  const dir = getTmpDir();
  await bootstrapDirectory(dir);
  t.true(fs.existsSync(path.join(dir, 'README.md')));
});

test('create index template', async t => {
  const dir = getTmpDir();
  await bootstrapDirectory(dir);
  t.true(fs.existsSync(path.join(dir, 'index.js')));
});

test('create gitignore', async t => {
  const dir = getTmpDir();
  await bootstrapDirectory(dir);
  t.true(fs.existsSync(path.join(dir, '.gitignore')));
});

test('prepare install command', async t => {
  const {cmd, args} = await prepareInstallCommand();

  t.regex(cmd, /yarn|npm/);
  t.regex(args[0], /add|install/);
  t.regex(args[1], /--exact|--SE/);
});

test('prepare dependencies (no syntax)', t => {
  let dependencies = prepareDependencies({ syntax: false });

  t.true(dependencies.indexOf('react') >= 0);
  t.true(dependencies.indexOf('react-dom') >= 0);
  t.true(dependencies.indexOf('spectacle') >= 0);
  t.false(dependencies.indexOf('prismjs') >= 0);
});

test('prepare dependencies (with syntax)', t => {
  let dependencies = prepareDependencies({ syntax: true });

  t.true(dependencies.indexOf('react') >= 0);
  t.true(dependencies.indexOf('react-dom') >= 0);
  t.true(dependencies.indexOf('spectacle') >= 0);
  t.true(dependencies.indexOf('prismjs') >= 0);
});

test('prepare dependencies (with theme)', t => {
  let dependencies = prepareDependencies({ syntax: true, theme: 'foo' });

  t.true(dependencies.indexOf('react') >= 0);
  t.true(dependencies.indexOf('react-dom') >= 0);
  t.true(dependencies.indexOf('spectacle') >= 0);
  t.true(dependencies.indexOf('prismjs') >= 0);
  t.true(dependencies.indexOf('spectacle-theme-foo') >= 0);
});
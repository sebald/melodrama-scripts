import test from 'ava';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import path from 'path';
import fs from 'fs-extra';
import { testDir, getTmpDir } from './_utils';

test.before('clean up temporary directory', () => {
  fs.removeSync(testDir);
});

test.beforeEach('proxy all the things', t => {
  t.context.request = sinon.stub();
  t.context.spinner = {
    succeed: sinon.stub(),
    fail: sinon.stub()
  };
  t.context.oraStart = sinon.stub().returns(t.context.spinner);

  t.context.lib = proxyquire('../lib/bootstrap', {
    ora: () => ({ start: t.context.oraStart }),
    got: t.context.request.returns(Promise.resolve({
      body: {
        results: [{
          package: { name:'spectacle-theme-unicorn' }
        }]
      }
    }))
  });
});

test('expose a `run` command', async t => {
  // Just a smoke test...
  t.is(typeof t.context.lib.run, 'function');
});

test('fetch themes', async t => {
  const { fetchSpectacleThemes } = t.context.lib;
  const { oraStart, spinner, request } = t.context;

  const success = await fetchSpectacleThemes();
  t.deepEqual(success, ['none', 'unicorn']);
  t.true(oraStart.calledOnce);
  t.true(spinner.succeed.called);
  t.truthy(spinner.text);

  request.returns(Promise.reject());
  const fail = await fetchSpectacleThemes();
  t.deepEqual(fail, ['none']);
  t.true(oraStart.calledTwice);
  t.true(spinner.fail.called);
  t.truthy(spinner.text);
});

test('install spinner', async t => {
  const { createInstallSpinner } = t.context.lib;
  const { oraStart, spinner } = t.context;

  await createInstallSpinner(Promise.resolve());
  t.true(oraStart.calledOnce);
  t.true(spinner.succeed.called);
  t.truthy(spinner.text);

  const err = await t.throws(createInstallSpinner(Promise.reject('whoops')));
  t.true(oraStart.calledTwice);
  t.true(spinner.fail.called);
  t.truthy(spinner.text);
  t.is(err, 'whoops');
});

test('create package.json', async t => {
  const { bootstrapDirectory } = t.context.lib;
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
  const { bootstrapDirectory } = t.context.lib;
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
  const { bootstrapDirectory } = t.context.lib;
  const dir = getTmpDir();
  await bootstrapDirectory(dir);
  t.true(fs.existsSync(path.join(dir, 'README.md')));
});

test('create index template', async t => {
  const { bootstrapDirectory } = t.context.lib;
  const dir = getTmpDir();
  await bootstrapDirectory(dir);
  t.true(fs.existsSync(path.join(dir, 'index.js')));
});

test('create gitignore', async t => {
  const { bootstrapDirectory } = t.context.lib;
  const dir = getTmpDir();
  await bootstrapDirectory(dir);
  t.true(fs.existsSync(path.join(dir, '.gitignore')));
});

test('prepare install command', async t => {
  const { prepareInstallCommand } = t.context.lib;
  const {cmd, args} = await prepareInstallCommand();

  t.regex(cmd, /yarn|npm/);
  t.regex(args[0], /add|install/);
  t.regex(args[1], /--exact|--SE/);
});

test('prepare dependencies (no syntax)', t => {
  const { prepareDependencies } = t.context.lib;
  let dependencies = prepareDependencies({ syntax: false });

  t.true(dependencies.indexOf('react') >= 0);
  t.true(dependencies.indexOf('react-dom') >= 0);
  t.true(dependencies.indexOf('spectacle') >= 0);
  t.false(dependencies.indexOf('prismjs') >= 0);
});

test('prepare dependencies (with syntax)', t => {
  const { prepareDependencies } = t.context.lib;
  let dependencies = prepareDependencies({ syntax: true });

  t.true(dependencies.indexOf('react') >= 0);
  t.true(dependencies.indexOf('react-dom') >= 0);
  t.true(dependencies.indexOf('spectacle') >= 0);
  t.true(dependencies.indexOf('prismjs') >= 0);
});

test('prepare dependencies (with theme)', t => {
  const { prepareDependencies } = t.context.lib;
  let dependencies = prepareDependencies({ syntax: true, theme: 'foo' });

  t.true(dependencies.indexOf('react') >= 0);
  t.true(dependencies.indexOf('react-dom') >= 0);
  t.true(dependencies.indexOf('spectacle') >= 0);
  t.true(dependencies.indexOf('prismjs') >= 0);
  t.true(dependencies.indexOf('spectacle-theme-foo') >= 0);
});
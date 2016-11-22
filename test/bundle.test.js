import test from 'ava';
import sinon from 'sinon';
import fs from 'fs-extra';
import { testDir, getTmpDir } from './_utils';
const proxyquire = require('proxyquire').noCallThru();

test.before('clean up temporary directory', () => {
  fs.removeSync(testDir);
});

test.beforeEach('proxy config', t => {
  t.context.emptyDir = sinon.stub().callsArgWith(1, null);
  t.context.outdir = getTmpDir();
  t.context.createConfig = sinon.stub().returns({
    plugins: [],
    output: { path: t.context.outdir }
  });
  t.context.compiler = {
    run: sinon.stub().callsArgWith(0, null, {
      toJson: () => ({ errors: [], time: 0, assets: [{size: 0}]})
    })
  };
  t.context.webpack = sinon.stub().returns(t.context.compiler);
  t.context.webpack.optimize = {
    OccurrenceOrderPlugin: sinon.stub(),
    DedupePlugin: sinon.stub(),
    UglifyJsPlugin: sinon.stub()
  };

  t.context.bundle = proxyquire('../lib/bundle', {
    'fs-extra': {
      emptyDir: t.context.emptyDir
    },
    './webpack.config': t.context.createConfig,
    webpack: t.context.webpack
  });
});

test('use config', async t => {
  const { bundle, createConfig } = t.context;
  const dir = getTmpDir();

  await bundle(dir);
  t.true(createConfig.calledWith(dir));
  t.true(t.context.webpack.optimize.OccurrenceOrderPlugin.called);
  t.true(t.context.webpack.optimize.DedupePlugin.called);
  t.true(t.context.webpack.optimize.UglifyJsPlugin.called);
});

test('empty build dir', async t => {
  const { bundle, emptyDir, outdir } = t.context;
  await bundle(getTmpDir());
  t.is(emptyDir.lastCall.args[0], outdir);
});

test('bundle with webpack', async t => {
  const { bundle, compiler, outdir } = t.context;

  const result = await bundle(getTmpDir());
  t.true(compiler.run.called);
  t.is(result.output, outdir);
  t.not(result.time, undefined);
  t.not(result.size, undefined);
});
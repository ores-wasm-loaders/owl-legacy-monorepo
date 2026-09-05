import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { checkComposition } from '../index.mjs';

const here = new URL('.', import.meta.url).pathname;
const plan = JSON.parse(readFileSync(join(here, '..', 'apps.json'), 'utf8'));
// ~/codes/<org>/<repo>: this checkout is <codes>/ores-wasm-loaders/owl-monorepo.
const codesRoot = join(here, '..', '..', '..');

test('every repo in both orgs carries the fleet conventions', () => {
  const report = checkComposition(codesRoot, plan);
  assert.deepEqual(report.problems, [], report.problems.join('\n'));
  assert.equal(report.checked, plan.repos.length + plan.testRepos.length);
});

test('the plan covers both orgs, including the test org', () => {
  assert.equal(plan.org, 'ores-wasm-loaders');
  assert.equal(plan.testOrg, 'ores-wasm-loaders-test');
  assert.ok(plan.testRepos.length >= 2, 'the -test org is part of the standard layout, not an afterthought');
});

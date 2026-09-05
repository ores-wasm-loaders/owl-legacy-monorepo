// Composition check: every repo in the org carries the conventions the fleet relies on.
//
// It runs against sibling checkouts (~/codes/<org>/<repo>), which is how the runner and a
// developer both have them, and reports every gap rather than stopping at the first.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const REQUIRED = ['.zpkg.toml', 'README.md', 'AGENTS.md', 'LICENSE', '.gitignore', '.github/workflows/ci.yml'];

export function checkComposition(codesRoot, plan) {
  const problems = [];
  let checked = 0;
  const groups = [
    [plan.org, plan.repos],
    [plan.testOrg, plan.testRepos],
  ];
  for (const [org, repos] of groups) {
    for (const repo of repos) {
      const dir = join(codesRoot, org, repo.name);
      if (!existsSync(dir)) {
        problems.push(`${org}/${repo.name}: not checked out at ${dir}`);
        continue;
      }
      checked += 1;
      for (const file of REQUIRED) {
        if (!existsSync(join(dir, file))) problems.push(`${org}/${repo.name}: missing ${file}`);
      }
      const descriptorPath = join(dir, '.zpkg.toml');
      if (existsSync(descriptorPath)) {
        const descriptor = readFileSync(descriptorPath, 'utf8');
        if (!descriptor.includes(`org = "${org}"`)) problems.push(`${org}/${repo.name}: .zpkg.toml declares another org`);
        if (!descriptor.includes(`name = "${repo.name}"`)) problems.push(`${org}/${repo.name}: .zpkg.toml name does not match the directory`);
        if (!descriptor.includes(`kind = "${repo.kind}"`)) problems.push(`${org}/${repo.name}: .zpkg.toml kind is not \`${repo.kind}\``);
      }
      // No repo in this org may take a third-party runtime dependency: the loading layer is
      // the first thing a page runs.
      const pkgPath = join(dir, 'package.json');
      if (existsSync(pkgPath)) {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
        for (const field of ['dependencies', 'peerDependencies']) {
          if (pkg[field] && Object.keys(pkg[field]).length) {
            problems.push(`${org}/${repo.name}: package.json declares ${field} — this org ships no third-party runtime dependencies`);
          }
        }
      }
      const cargoPath = join(dir, 'Cargo.toml');
      if (existsSync(cargoPath)) {
        const cargo = readFileSync(cargoPath, 'utf8');
        const deps = cargo.split('[dependencies]')[1]?.split('[')[0]?.trim();
        if (deps) problems.push(`${org}/${repo.name}: Cargo.toml declares dependencies (${deps.split('\n')[0]}) — this crate is standard-library only`);
      }
    }
  }
  return { checked, problems, ok: problems.length === 0 };
}

# owl-monorepo

The org's integration workspace: every repo as a git submodule under `apps/`, plus the zed composition and the fleet checks run across them.

Part of [`ores-wasm-loaders`](https://github.com/ores-wasm-loaders) — the org that owns the fleet's shared
web-loading layer for the 35+ marketing sites and their applications. Its sibling
[`ores-wasm-loaders-test`](https://github.com/ores-wasm-loaders-test) carries the external-facing test surface.

## What this org is for

Marketing sites are HTML-first and cheap. The applications behind them are not: a Flutter
web release or a Leptos/Dioxus island bundle costs a download, a compile and an
initialization before it is useful. This org shares the *loading and integration
infrastructure* across every product — one coordinator, one Flutter adapter, one Rust
adapter family, one manifest contract — so the expensive part is prepared while the visitor
is still reading, and so 80–90% of that plumbing is written once rather than 35 times.

It deliberately does **not** claim to share application bytes, application memory, or a
running runtime across a normal navigation. See `owl-docs/docs/architecture.md`.

## Depends on (zed-pkg)

- (none)

## Shared building blocks

| Concern | Repo |
| --- | --- |
| Auth (OAuth, SAML, SCIM, RBAC) | github.com/shared-auth |
| Cross-device sync | github.com/opto-sync |
| Logging / telemetry | github.com/ores-otel |
| Feature flags | github.com/flags-2-env |
| Packages | github.com/zed-pkg |
| Web ⇄ API transport | github.com/ORESoftware/ores-transport |
| Locks and leases | github.com/ORESoftware/ores-locks-and-leases |
| TypeSpec + JSON Schema parity | github.com/ORESoftware/ores-contracts |
| Reusable GitHub workflows | github.com/ORESoftware/ores-gha-workflows |
| Edge failover | github.com/ORESoftware/ores-edge-router |

## Conventions for this repository

- Submodules are pinned commits; ` M <path>` in `git status` is a pointer change, not a file edit.
- Composition is zed-pkg first (`.zpkg.toml`), submodules second — not submodules alone.

## Tests

```sh
node --test test/*.test.mjs
```

No third-party dependencies: the whole org builds and tests offline, because it has to run
in every product org's CI before anything else is installed.

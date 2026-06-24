# Neobank Stellar

Monorepo managed with **pnpm workspaces** + **Turborepo**.

## Structure

```
neobank-stellar/
├── apps/
│   └── web/                 # @neobank-stellar/web — Vite + React + TS app
├── packages/
│   └── shared/              # @neobank-stellar/shared — shared utils and types
├── package.json             # workspace root
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.json            # base TypeScript config
```

## Requirements

- Node.js >= 18
- pnpm >= 8

## Usage

```bash
pnpm install        # install dependencies across the monorepo
pnpm dev            # run dev tasks (turbo)
pnpm build          # build all packages
pnpm typecheck      # type checking
pnpm lint           # lint
pnpm test           # tests
```

To run only the web app:

```bash
pnpm --filter @neobank-stellar/web dev
```

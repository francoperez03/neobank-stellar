# Neobank Stellar

Monorepo gestionado con **pnpm workspaces** + **Turborepo**.

## Estructura

```
neobank-stellar/
├── apps/
│   └── web/                 # @neobank-stellar/web — servidor HTTP de ejemplo
├── packages/
│   └── shared/              # @neobank-stellar/shared — utils y tipos compartidos
├── package.json             # raíz del workspace
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.json            # config base de TypeScript
```

## Requisitos

- Node.js >= 18
- pnpm >= 8

## Uso

```bash
pnpm install        # instala dependencias de todo el monorepo
pnpm dev            # corre las tareas dev (turbo)
pnpm build          # build de todos los paquetes
pnpm typecheck      # chequeo de tipos
pnpm lint           # lint
pnpm test           # tests
```

Para correr solo la app web:

```bash
pnpm --filter @neobank-stellar/web dev
```

# Min iPaaS

A minimal Integration Platform as a Service (iPaaS) — think Workato or Zapier — built as a frontend-only prototype.

## Monorepo Structure

```
Min-iPaas/
└── WorkflowBuilder/    # React frontend service
```

Future services (backend API, worker, etc.) will live as sibling directories alongside `WorkflowBuilder/`.

## WorkflowBuilder

The frontend service. React 19 + TypeScript SPA with three pages:

- **Login** — hardcoded auth (`admin@minipaas.com` / `password`)
- **Workflows** — table of all workflows with status, trigger type, last run, and step count
- **Workflow Builder** — visual top-down linear flow editor with a right-side panel for adding nodes and configuring them

### Tech Stack

| Layer | Library |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Routing | React Router DOM v7 |
| UI components | ShadCN (Tailwind v4, oklch colors) |
| CSS | Tailwind v4 via `@tailwindcss/postcss` |
| Flow canvas | React Flow (`@xyflow/react` v12) |
| Graph layout | Dagre (`@dagrejs/dagre`) — top-down tree |
| Icons | Lucide React |

### Running locally

```bash
cd WorkflowBuilder
npm install
npm run dev       # http://localhost:3000
```

### Theme

- Background: pure black (`oklch(0 0 0)`)
- Primary / success: green `#22c55e`
- Destructive / failure: red `#ef4444`
- Canvas: animated parallax dot grid (CSS keyframe, no JS)

### Workflow Builder features

- **Trigger selection** — Executable, Webhook, App, Schedule (each with distinct accent color)
- **Linear top-down flow** — nodes are fixed-path, non-draggable; Dagre handles vertical layout
- **Add node panel** — opens on the right when the `+` button between nodes is clicked
- **Config panel** — opens on the right when a node is clicked; fields defined per node type
- **Node types** — Triggers (4), Actions (HTTP Request, Transform, Slack, Email Send), Conditions (Filter, Router)

### Adding a new service

Create a new top-level directory (e.g., `ApiServer/`) with its own `package.json`. Each service is self-contained — no shared root `node_modules`.

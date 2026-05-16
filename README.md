# Min iPaaS

A minimal Integration Platform as a Service (iPaaS) — think Workato or Zapier — built as a frontend-only prototype.

## Monorepo Structure

```
Min-iPaas/
├── WorkflowBuilder/    # React frontend service
├── Gateway/            # Spring Boot API gateway (MongoDB-backed)
└── GroovyService/      # gRPC service that executes Groovy scripts
```

Each service is self-contained. Future services live as sibling directories.

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

## GroovyService

gRPC service that executes Groovy scripts on demand. Used by the `Executable` trigger in WorkflowBuilder to run arbitrary user code.

### Tech Stack

| Layer | Library |
|---|---|
| Runtime | Java 21 |
| Framework | Spring Boot 4.0 + spring-grpc |
| Schema | Protocol Buffers (proto3) |
| Scripting | Apache Groovy 4.0 (`GroovyShell`) |
| Build | Maven (`protobuf-maven-plugin` for codegen) |

### Running locally

```bash
cd GroovyService
./mvnw spring-boot:run     # gRPC server on localhost:9090
```

### API

Service `RunGroovy` exposes a single unary RPC: `Run(Executable) → Output`.

**Executable**
- `input_code` (string) — Groovy source to evaluate
- `bindings` (map<string,string>) — variables injected into the script's binding
- `timeout_ms` (int32) — reserved for future use

**Output**
- `success` (bool) — false on any thrown exception (omitted in JSON when false)
- `stdout` / `stderr` (string) — captured streams
- `error_message` (string) — exception message on failure
- `duration_ms` (int64)

### Testing with grpcurl

Server reflection is enabled, so no `.proto` files needed:

```bash
grpcurl -plaintext localhost:9090 list
grpcurl -plaintext -d '{"input_code": "println \"hello\"; return 42"}' \
  localhost:9090 RunGroovy/Run
grpcurl -plaintext -d '{"input_code": "println name", "bindings": {"name": "Pulkit"}}' \
  localhost:9090 RunGroovy/Run
```

## ConnectorService

OAuth2 credential vault. Registers connections to external providers (authorization-code or client-credentials), stores access/refresh tokens, auto-refreshes them before expiry, and serves a guaranteed-valid access token by `connectionId` over gRPC.

### Tech Stack

| Layer | Library |
|---|---|
| Runtime | Java 21 |
| Framework | Spring Boot 4.0 + spring-grpc |
| Persistence | Spring Data JPA → Neon Postgres |
| Schema | Protocol Buffers (proto3) |

### Running locally

```bash
cd ConnectorService
./mvnw spring-boot:run -Dspring-boot.run.profiles=local   # REST :8081, gRPC :9090
```

Secrets (Neon URL/password, provider client secrets) live in the gitignored `src/main/resources/application-local.properties`.

### API

- REST `POST /connections` — register (client-credentials → `ACTIVE`; auth-code → returns `authorizationUrl`)
- REST `GET /oauth/callback` — provider redirect target
- gRPC `ConnectorTokens/GetAccessToken` — `{connection_id}` → valid access token

## AppCatalogService

Connector/action catalog: *what apps exist and how to call them* (auth config, actions, triggers, their props/JSON-schemas). Seeded from a vendored [Activepieces](https://www.activepieces.com) (MIT) metadata snapshot. Non-secret, read-heavy — kept separate from ConnectorService.

### Tech Stack

| Layer | Library |
|---|---|
| Runtime | Java 21 |
| Framework | Spring Boot 4.0 + spring-grpc (web variant) |
| Persistence | Spring Data MongoDB (Atlas; db `AppCatalog`) |
| Schema | Protocol Buffers (proto3, `google.protobuf.Struct` for prop passthrough) |

### Refreshing the catalog snapshot

```bash
cd AppCatalogService
bash scripts/fetch-snapshot.sh   # pulls cloud.activepieces.com → src/main/resources/catalog/activepieces-pieces.json
```

### Running locally

```bash
cd AppCatalogService
./mvnw spring-boot:run -Dspring-boot.run.profiles=local   # REST + gRPC on :8082
```

On first boot (empty collection, or `catalog.reseed=true`) the snapshot is loaded into MongoDB. Mongo URI lives in the gitignored `application-local.properties`.

### API

- REST `GET /apps?search=&category=`, `GET /apps/{key}`, `GET /apps/{key}/actions/{name}`, `GET /categories`
- gRPC `AppCatalog/{ListApps,GetApp,GetOperation}` (reflection enabled; no proto package, like `RunGroovy`)

## Adding a new service

Create a new top-level directory (e.g., `ApiServer/`) with its own build manifest (`package.json`, `pom.xml`, etc.). Each service is self-contained — no shared root dependencies.

# invoicelab-automation

API test automation and schema drift detection framework for [InvoiceLab](https://github.com/christianisita/invoicelab).

## What this does

- Runs **Playwright API tests** against the InvoiceLab REST API
- **Auto-generates** Zod schemas and TypeScript types from the OpenAPI/Swagger spec via [Orval](https://orval.dev)
- **Generates typed payload factories** for building realistic test data with Faker.js
- **Detects schema drift** on a daily schedule (GitHub Actions) and opens a PR automatically, with an optional Slack notification

## Dependency: InvoiceLab App

This repo tests the application in [christianisita/invoicelab](https://github.com/christianisita/invoicelab). That app must be **running locally** (or reachable at `API_BASE_URL`) before you run tests or any schema generation scripts.

Refer to that repo for setup and startup instructions.

## Prerequisites

- Node.js (LTS)
- npm
- [GitHub CLI (`gh`)](https://cli.github.com/) — required only for `schema:pr`
- InvoiceLab app running locally

## Setup

```bash
git clone https://github.com/christianisita/invoicelab-automation.git
cd invoicelab-automation

npm install
npx playwright install --with-deps

cp .env.example .env
# Open .env and set the values for your local environment
```

## Environment Variables

| Variable | Default | Required | Purpose |
|---|---|---|---|
| `SWAGGER_URL` | `http://localhost:3001/openapi.json` | Yes (schema scripts) | URL to the live OpenAPI spec served by the app |
| `API_BASE_URL` | `http://localhost:3001` | Yes (tests) | Base URL of the API under test |
| `SLACK_WEBHOOK_URL` | — | No | Slack incoming webhook URL for schema drift notifications |

## Scripts

### `npm test`

Runs all Playwright API tests.

```bash
npm test
```

Requires the InvoiceLab app to be running at `API_BASE_URL`. Test reports are saved to `playwright-report/`.

---

### `npm run schema:generate`

Fetches the latest OpenAPI spec from `SWAGGER_URL`, then regenerates:
- Zod schemas → `framework/api/schema/`
- TypeScript type inferences (appended to schema files)
- Payload factory functions → `framework/api/payload/`

```bash
npm run schema:generate
```

Run this after the app's API changes to keep generated files in sync. The InvoiceLab app must be running so the spec can be fetched.

---

### `npm run schema:sync`

Detects whether the live OpenAPI spec differs from the currently committed schemas, without making any changes.

```bash
npm run schema:sync
```

Useful for a quick drift check in CI or before deciding whether to open a PR.

---

### `npm run schema:pr`

Full schema synchronization workflow:

1. Regenerates schemas from the live spec
2. Commits changes to a new branch named `schema-sync/YYYY-MM-DD`
3. Opens a GitHub PR via the `gh` CLI
4. Posts a Slack notification listing changed files (if `SLACK_WEBHOOK_URL` is set)

```bash
npm run schema:pr
```

Requirements:
- GitHub CLI authenticated: `gh auth login`
- Write access to this repository
- `SLACK_WEBHOOK_URL` in `.env` (optional — skipped if not provided)

This script is also triggered automatically every day at 08:00 UTC via GitHub Actions.

## Project Structure

```
invoicelab-automation/
├── .github/workflows/
│   ├── playwright.yml          # Runs tests on push / PR to main
│   └── schema-sync.yml         # Daily schema drift detection and PR creation
├── framework/api/
│   ├── api/                    # Playwright API client functions
│   ├── schema/                 # Auto-generated Zod schemas — do not edit manually
│   └── payload/                # Auto-generated payload factories — do not edit manually
├── scripts/
│   ├── generate-types.ts       # Appends TypeScript types to schema files
│   ├── generate-payloads.ts    # Generates payload factory functions
│   ├── sync-schema.ts          # Schema sync utilities (drift detection)
│   └── create-schema-pr.ts     # Automated PR creation workflow
├── tests/
│   └── clients.spec.ts         # Playwright API test specs
├── .env.example                # Environment variable template
├── orval.config.ts             # Orval OpenAPI → Zod generator config
├── playwright.config.ts        # Playwright configuration
└── tsconfig.json               # TypeScript compiler config
```

## GitHub Actions

| Workflow | Trigger | Purpose |
|---|---|---|
| `playwright.yml` | Push or PR to `main` | Runs all API tests |
| `schema-sync.yml` | Daily 08:00 UTC or manual dispatch | Runs `schema:pr` to detect and surface schema drift |

The `schema-sync.yml` workflow requires the following repository secrets: `SWAGGER_URL`, `SLACK_WEBHOOK_URL`, `GITHUB_TOKEN`.

## Notes

- Files inside `framework/api/schema/` and `framework/api/payload/` are auto-generated. Do not edit them manually — changes will be overwritten on the next `schema:generate` run.
- The `schema:pr` script requires the `gh` CLI to be installed and authenticated (`gh auth login`) with write access to this repository.

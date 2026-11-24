# FormForge — Dynamic Form Builder & Submission Management System

FormForge is a full-stack technical-assessment project for creating dynamic forms, publishing public versions, and managing responses.

Repository: [github.com/Suriya-m-dev/FormForge](https://github.com/Suriya-m-dev/FormForge)

## Features

- Cookie-authenticated admin login, protected routes, and bcrypt password hashing.
- Draft, published, and archived forms with create, edit, publish, archive, and drag-to-reorder flows.
- Nine field types: `TEXT`, `EMAIL`, `NUMBER`, `PHONE`, `TEXTAREA`, `DATE`, `SELECT`, `RADIO`, and `CHECKBOX`.
- Field labels, keys, placeholders, required state, options, validation rules, and type-appropriate default values.
- Public forms dynamically rendered from published snapshots, with loading, error, and success states.
- Public validation plus paginated submission list, detail, and deletion views for administrators.

## Stack

| Area | Technologies |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4 |
| State and data | Redux Toolkit, RTK Query, React Hook Form, Zod |
| Backend | Node.js, Express 5, TypeScript |
| Database | MongoDB, Mongoose |
| Security and logging | JWT, bcrypt, HTTP-only cookies, Helmet, CORS, express-rate-limit, Pino |
| Tests | Vitest, Supertest, mongodb-memory-server |

## Architecture

The frontend is feature-oriented: `auth`, `dashboard`, `forms`, and `submissions` live under `client/src/features`; shared UI and layout are in `components`. `app/baseApi.ts` owns one RTK Query API slice, into which feature endpoints are injected. RTK Query manages server state—fetching, cached results, mutations, and tag invalidation—while builder input, drag state, modal state, and public-form values remain local component state.

The backend is layered:

`routes → middleware → controller → service → repository → Mongoose model`

```text
client/src/
  app/ components/ features/ routes/
server/src/
  config/ middlewares/ modules/ routes/
```

Fields are embedded in their form document. Publishing writes a versioned snapshot; a submission records that form version and snapshot alongside validated response data. Later field edits therefore do not rewrite historical submissions.

## Setup

Prerequisites: Node.js, npm, and MongoDB.

```bash
git clone https://github.com/Suriya-m-dev/FormForge.git
cd FormForge

cd server
npm install
copy .env.example .env
npm run dev
```

In another terminal:

```bash
cd client
npm install
copy .env.example .env
npm run dev
```

Use `cp` instead of `copy` on macOS/Linux. Defaults are API `http://localhost:5000` and client `http://localhost:5173`.

Create the initial administrator after setting the `ADMIN_*` values in `server/.env`:

```bash
cd server
npm run seed:admin
```

The seed script hashes the password and does nothing if the email already exists. Never commit `.env` files or production secrets.

### Environment variables

| File | Variables |
| --- | --- |
| `server/.env` | `NODE_ENV`, `PORT`, `LOG_LEVEL`, `CLIENT_URL`, `MONGODB_URI`, `JWT_SECRET` (32+ chars), `JWT_EXPIRES_IN`, `COOKIE_SECRET` (32+ chars), and seed-only `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` |
| `client/.env` | `VITE_API_BASE_URL`, normally `http://localhost:5000/api/v1` |

Use the included `server/.env.example` and `client/.env.example` templates as the source of exact local configuration.

## Database design and pagination

`Form` stores the owner, status, editable field definitions, version, and optional `publishedSnapshot`. `Submission` stores `formId`, `formVersion`, `formSnapshot`, normalized `data`, and `submittedAt`.

Implemented indexes:

- `Form`: `{ status: 1, createdAt: -1 }`
- `Form`: `{ createdBy: 1, createdAt: -1 }`
- `Submission`: `{ formId: 1, submittedAt: -1 }`

Admin lists use newest-first offset pagination, with `page`, `limit`, `total`, and `totalPages`; `limit` is capped at 100. Form lists omit published snapshots and submission lists omit form snapshots, keeping list responses small.

## Authentication and security

Login verifies a bcrypt hash, signs a JWT, and sets an HTTP-only `formforge_token` cookie. It is secure in production and `SameSite=Lax`. Admin routes authenticate the cookie and require the `ADMIN` role; public form retrieval and submission are intentionally unauthenticated.

The current API also uses Helmet, configured credentialed CORS, 1 MB request limits, Zod auth/form validation, submission validation against the published snapshot, rejection of unexpected submission fields, Pino logging, and rate limits. Limits are currently 200 API requests per 15 minutes and 10 login or public-submission requests per 15 minutes (disabled in tests).

## API

Base path: `/api/v1`. Admin routes require the login cookie.

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/health` | Public | Health check |
| POST | `/auth/login` | Public | Log in |
| GET | `/auth/me` | Admin | Current admin |
| POST | `/auth/logout` | Public | Clear auth cookie |
| POST | `/forms` | Admin | Create draft |
| GET | `/forms?page=1&limit=10&status=&search=` | Admin | List owned forms |
| GET / PUT / DELETE | `/forms/:id` | Admin owner | Get / update / archive |
| PATCH | `/forms/:id/publish` | Admin owner | Publish snapshot |
| GET | `/public/forms/:formId` | Public | Get published form |
| POST | `/submissions/:formId` | Public | Submit response |
| GET | `/submissions/:formId?page=1&limit=10` | Admin owner | List submissions |
| GET / DELETE | `/submissions/:formId/:submissionId` | Admin owner | Get / delete submission |

Import [docs/FormForge.postman_collection.json](docs/FormForge.postman_collection.json) into Postman for representative bodies and variables. Log in first; Postman retains the HTTP-only cookie for requests to the same `baseUrl`.

## Testing and production builds

Run commands in their relevant package directories:

```bash
# server
npm test
npm run test:integration
npm run typecheck
npm run build

# client
npm run typecheck
npm run lint
npm run build
```

## Scaling: current baseline and future work

Implemented today: the indexes above, bounded offset pagination, list projections, request validation, and per-process rate limiting. These are a good baseline, not a claim that the current deployment alone handles 50,000+ forms, 10 million+ submissions, or high concurrent traffic.

For that scale, profile actual MongoDB query plans and add measured workload-specific compound indexes. Cursor/keyset pagination using stable `(submittedAt, _id)` is preferable for very deep submission lists because it avoids the rising scan cost of `skip`. Keep list projections small and fetch snapshots only where required.

Future production infrastructure should run stateless API instances behind a load balancer; use shared Redis-backed rate-limit storage; move email, notifications, exports, and heavy work to durable background queues; and add log aggregation, metrics, tracing, alerts, database slow-query/index monitoring, backups, and load tests. Redis, queues, load balancing, monitoring infrastructure, and cursor pagination are proposals, not implemented features.

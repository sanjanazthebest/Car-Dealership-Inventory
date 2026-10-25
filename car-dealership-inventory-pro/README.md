# AutoLot — Car Dealership Inventory System

Full-stack REST API and React SPA built with Node.js, Express, MongoDB, React, Vite, and Tailwind CSS.

## Included
- JWT authentication; public registration creates customer accounts only; admin is provisioned from environment variables.
- Role-based authorization (`customer`, `admin`).
- Vehicle CRUD, search/filter, sorting, pagination, low-stock metadata.
- Atomic stock decrement for purchases, preventing negative inventory under concurrent requests.
- Admin-only restock and deletion; inventory movement/audit records.
- Purchase history, profile endpoint, health/readiness endpoint, request IDs, centralized error handling.
- Validation, password hashing, rate limiting, Helmet, CORS allow-list, MongoDB indexes, structured request logging.
- React responsive catalogue, search/filter, login/register, purchase flow, admin vehicle management.
- Backend tests using Jest + Supertest and an isolated MongoDB-memory-server test database.

## Requirements
Node.js 20+, npm, and MongoDB 7+ (local or Atlas). A real MongoDB database is required for normal operation; tests use an isolated disposable test database.

## Run locally
1. Copy `.env.example` to `backend/.env` and set strong secrets and MongoDB URI.
2. In one terminal:
   ```bash
   cd backend
   npm install
   npm run seed:admin
   npm run dev
   ```
3. In another terminal:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. Open the Vite URL (normally http://localhost:5173). Backend defaults to http://localhost:5000.

The admin email/password come from `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env`. Do not use the example password in production. The seed command creates or updates that admin account.

## Test (TDD)
```bash
cd backend
npm install
npm test
npm run test:coverage
```
The tests use `mongodb-memory-server` only for test isolation; application runtime uses MongoDB. Run tests first, observe failures, implement, then refactor to keep the Red-Green-Refactor history visible in Git. A generated report is not included as a claimed test result; run the suite locally and save the actual output.

## API overview
All routes are prefixed with `/api`.

### Auth
- `POST /auth/register` — name, email, password; customer role only.
- `POST /auth/login` — returns JWT and user.
- `GET /auth/me` — current user (JWT).

### Vehicles (JWT required)
- `GET /vehicles` — available stock; query params `q`, `make`, `model`, `category`, `minPrice`, `maxPrice`, `sort`, `page`, `limit`, `includeOutOfStock` (admin only for out-of-stock visibility).
- `GET /vehicles/search` — same search/filter parameters.
- `GET /vehicles/:id` — vehicle details.
- `POST /vehicles` — admin only; make, model, category, price, quantity, optional year, description, VIN.
- `PUT /vehicles/:id` — admin only; partial update of vehicle details.
- `DELETE /vehicles/:id` — admin only.
- `POST /vehicles/:id/purchase` — quantity (defaults to 1), optional idempotencyKey.
- `POST /vehicles/:id/restock` — admin only; positive quantity and optional note.

### Extra endpoints
- `GET /purchases/me` — signed-in user's purchase history.
- `GET /admin/audit-logs` — admin inventory audit trail with pagination.
- `GET /health` — liveness.
- `GET /ready` — database readiness.

Responses use `{ success, data }` or `{ success:false, error:{code,message,details?}, requestId }`. Pagination metadata is returned as `meta`.

## Security and production notes
- Set `JWT_SECRET` to a random secret (32+ bytes), `CLIENT_ORIGIN` to the deployed frontend origin, and `NODE_ENV=production` in deployment.
- Use HTTPS, secrets management, MongoDB least-privilege credentials, backups, monitoring, and dependency scanning.
- JWTs are stored in browser memory for this demo (page refresh signs the user out). For production, consider secure HttpOnly refresh cookies, refresh-token rotation/revocation, email verification, password reset, and CSRF controls if cookies are introduced.
- Purchases update stock atomically and record a purchase; this kata does not process payments. Do not collect payment card data directly.
- The frontend is a demonstration UI; add e2e tests and accessibility review before production.

## Git / TDD workflow
Make small commits such as `test: cover registration validation`, `feat: add registration service`, `refactor: isolate inventory service`. For each AI-assisted commit, add two blank lines and the required `Co-authored-by` trailer using the AI tool's accurate name/email. Keep your actual prompts in root `PROMPTS.md`; do not invent or summarize logs. This starter includes a template, not fabricated chat history.

## My AI Usage
Replace this template with your truthful account of the AI tools you actually used, what you asked them to do, what you verified manually, and what you changed. Example structure:
- **Tools used:** [list only tools actually used].
- **Use:** [specific help with architecture, boilerplate, test ideas, debugging, documentation].
- **Verification:** [tests run, code reviewed, security assumptions checked].
- **Reflection:** [where AI saved time, limitations/errors found, what you learned].

## Screenshots
Place genuine screenshots from your running app in `docs/screenshots/` and link them here. Do not use mock screenshots as proof of a running application.

## License
For educational use. Review dependencies and choose a license before public release.

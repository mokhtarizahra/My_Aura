# My Aura — Backend API

Production-oriented REST API for **My Aura**, a sports venue booking and
professional-coaching marketplace. This repository contains the backend
service responsible for authentication, authorization, session management
and the broader marketplace domain.

Built with an emphasis on **security, testability and internationalization
readiness**. Every authentication flow is covered by an extensive unit and
integration test suite (Vitest + Supertest + real MongoDB).

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Key Features](#key-features)
- [Authentication Domain](#authentication-domain)
- [Security Measures](#security-measures)
- [Internationalization (i18n) Contract](#internationalization-i18n-contract)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Testing](#testing)
- [Docker](#docker)
- [Design Decisions](#design-decisions)
- [Roadmap](#roadmap)

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Runtime | Node.js 22 (ESM) |
| Framework | Express.js 5 |
| Database | MongoDB 7 (Mongoose) |
| Auth | JWT (`jsonwebtoken`) — access + refresh, HS256 |
| Password hashing | `bcrypt` (cost factor 12) |
| Validation | **Zod v4** (schema-first, per-route middleware) |
| Rate limiting | `express-rate-limit` (per-endpoint policies) |
| SMS | sms.ir (via `smsProvider`) |
| Testing | Vitest + Supertest + in-memory MongoDB |
| Container | Docker / Docker Compose |

---

## Architecture Overview

```
┌────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Route    │───▶│  Middleware  │───▶│  Controller  │───▶│   Service    │
│            │    │              │    │              │    │              │
│  (Express) │    │ rateLimit    │    │ Orchestrates │    │ Domain logic │
│            │    │ validateBody │    │ use cases    │    │ Pure & testable│
│            │    │ validateParams│   │              │    │ No HTTP, no req│
│            │    │ authenticate │    │              │    │              │
└────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
                                                                │
                                                                ▼
                                                        ┌──────────────┐
                                                        │ Mongoose     │
                                                        │  Models      │
                                                        └──────────────┘
```

**Principles:**

- **Thin controllers.** Controllers only translate HTTP ↔ domain. Business
  rules live in services.
- **Zod as the single source of validation truth.** Controllers assume
  `req.body` / `req.params` are already sanitized by middleware.
- **`AppError` for domain errors.** Services never throw raw `Error`.
  Every error carries a stable machine-readable `code` and an HTTP `status`.
- **Defense in depth.** Rate limiting, ownership checks (IDOR prevention),
  refresh-token rotation and session revocation.

---

## Key Features

### Authentication & Session Lifecycle

- **OTP-based registration** (phone or email), with hashed, single-use,
  expiring OTP records and brute-force protection.
- **Password-based login** with access + refresh token issuance.
- **Refresh token rotation** — each refresh invalidates the previous token.
- **Change password** (authenticated) — verifies current password,
  rejects reuse of the current one, revokes all other sessions.
- **Forgot password** — OTP-driven reset flow with verification tokens.
- **Session management** — list active sessions, revoke a specific
  session (with IDOR protection), revoke all sessions, revoke current.

### Security Hardening

- **Rate limiting** on every sensitive endpoint
  (`/otp/request`, `/otp/verify`, `/login`, `/register`, `/password/reset`,
  `/password/change`, `/refresh`).
- **JWT validation** with algorithm pinning (`HS256` only),
  `issuer`, `audience`, `tokenType`, and required claims (`sub`,
  `accountType`).
- **Refresh tokens stored as SHA-256 hashes** — never in plaintext.
- **HTTP-only, `SameSite=Strict`, `Secure` (in production) cookies**
  for refresh tokens; access tokens remain in memory on the client.
- **Partial unique indexes** on `email` and `phone` so multiple accounts
  can coexist with one credential missing, without triggering false
  `E11000` duplicate-key errors.

---

## Authentication Domain

### Flows

```
1. Registration
   POST /otp/request   →  POST /otp/verify  →  POST /register
                                                        │
                                                        ▼
                                         (verification token, then access + refresh)

2. Login
   POST /login  →  access token (in memory) + refresh token (HTTP-only cookie)

3. Refresh
   POST /refresh  →  rotates refresh token, issues new access token

4. Logout
   POST /logout  →  revokes the current refresh-token session

5. Change Password (authenticated)
   POST /password/change  →  verifies current password,
                              rejects identical new password,
                              revokes ALL sessions

6. Forgot Password
   POST /otp/request (purpose=password_reset)
     →  POST /otp/verify
     →  POST /password/reset

7. Session Management (authenticated)
   GET    /sessions           →  list active sessions
   DELETE /sessions/current   →  revoke current session
   DELETE /sessions/:id       →  revoke one session (IDOR-protected)
   DELETE /sessions           →  revoke all
```

---

## Security Measures

| Threat | Mitigation |
| --- | --- |
| Credential brute force | Per-route rate limiting + bcrypt cost 12 |
| OTP brute force | Max attempts, cooldown, single-use, hashed storage |
| Token theft (refresh) | HTTP-only + Secure + SameSite=Strict cookie, hashed at rest |
| Token theft (access) | Short TTL (15 min), algorithm-pinned verification |
| IDOR on sessions | Every session lookup filtered by `accountId` + `accountType` |
| Mass assignment | Zod strips unknown fields (`safeParse` + `.data` assignment) |
| Information disclosure | Public error codes (`INVALID_CREDENTIALS`), never stack traces |
| Algorithm confusion | `algorithms: ['HS256']` pinning in every `jwt.verify` |

---

## Internationalization (i18n) Contract

Every error returned by the API includes a **machine-readable `code`** in
`UPPER_SNAKE_CASE`. This is the contract between backend and frontend:

```json
{
  "success": false,
  "code": "INVALID_CURRENT_PASSWORD",
  "message": "Current password is incorrect"
}
```

- `code` → the frontend maps it to a localized string.
- `message` → human-readable, English only, for logs and debugging.
- **The backend never returns UI strings.** Translation is 100% the
  frontend's responsibility.

This keeps the API locale-agnostic and makes adding new languages a
frontend-only change.

---

## Project Structure

```
src/
├── app.js                      # Express app (CORS, JSON, cookies, routes)
├── server.js                   # Bootstrap (env, DB, listen)
├── config/
│   └── db.js                   # Mongo connection
├── constants/
│   └── messages.js             # Centralized error codes
├── errors/
│   ├── AppError.js             # Domain error base class
│   └── authErrors.js           # Auth-specific error factories
├── middlewares/
│   ├── auth.middleware.js      # Bearer token verification
│   ├── rateLimiter.js          # Per-endpoint rate limiters
│   └── validate.js             # validateBody / validateParams (Zod)
├── routes/
│   └── authRoutes.js           # /api/auth/* router
├── controllers/
│   └── authController.js       # HTTP ↔ domain translation
├── services/
│   └── authentication/
│       ├── account.service.js
│       ├── otp.service.js
│       ├── token.service.js
│       ├── refreshToken.service.js
│       ├── registration.service.js
│       └── sms.service.js
├── models/
│   ├── account/                # PersonalAccount, OrganizationAccount, StaffAccount
│   ├── authentication/         # RefreshToken, TempOTP
│   ├── identity/               # PersonalUser, StaffUser, Organization
│   └── ...
├── validators/
│   └── auth.validator.js       # All Zod schemas
├── utils/
│   ├── verifyAccessToken.js
│   ├── verifyRefreshToken.js
│   ├── verifyVerificationToken.js
│   ├── generateToken.js
│   ├── generateOTP.js
│   ├── hashToken.js
│   ├── hashOTP.js
│   ├── cookie.js
│   └── smsProvider.js
└── test/
    └── integration/
        └── authentication/
            └── auth.integration.test.js
```

---

## API Endpoints

All routes are prefixed with `/api/auth`.

### Public

| Method | Endpoint | Rate Limit | Validation |
| --- | --- | --- | --- |
| `POST` | `/otp/request` | 5 / 15 min | `requestOTPSchema` |
| `POST` | `/otp/verify` | 5 / 10 min | `verifyOTPSchema` |
| `POST` | `/register` | 3 / 1 hour | `registerSchema` |
| `POST` | `/login` | 5 / 15 min | `loginSchema` |
| `POST` | `/password/reset` | 3 / 15 min | `passwordResetSchema` |
| `POST` | `/refresh` | 30 / 15 min | — |
| `POST` | `/logout` | — | — |

### Authenticated (`Bearer <accessToken>`)

| Method | Endpoint | Notes |
| --- | --- | --- |
| `POST` | `/password/change` | Verifies current password; revokes all sessions |
| `GET` | `/sessions` | Lists active refresh-token sessions |
| `GET` | `/sessions/history` | Includes revoked / expired |
| `DELETE` | `/sessions/current` | Revokes current session |
| `DELETE` | `/sessions/:id` | IDOR-protected (ownership check) |
| `DELETE` | `/sessions` | Revokes all |

---

## Environment Variables

```env
# Server
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/myapp_db

# JWT
JWT_SECRET=<at-least-32-random-bytes>
JWT_ISSUER=https://auth.myaura.app
JWT_AUDIENCE=myaura-api

# SMS provider (sms.ir)
SMS_IR_API_KEY=<key>

# Tests
MONGODB_URI_TEST=mongodb://localhost:27018/myapp_test
```

---

## Running Locally

```bash
# Install dependencies
npm install

# Start MongoDB (via Docker)
docker compose up -d mongodb

# Start the API in watch mode
npm run dev
```

Server listens on `http://localhost:5000`.

---

## Testing

```bash
# Full suite
npm test -- --run

# Single file
npx vitest run src/test/integration/authentication/auth.integration.test.js
```

Coverage highlights:

- **Auth domain** — ~140 unit tests + **41 integration tests**
  (real MongoDB, real controllers, real services).
- Integration tests are **end-to-end** for the entire auth flow
  (registration → OTP → login → refresh → session revocation).
- **IDOR protection** is explicitly tested.
- **`AppError.code` propagation** is explicitly tested.

> Non-auth modules (`financial`, `marketplace`, `team`, `profile`) have
> placeholder test files and are being progressively brought up to the
> same standard.

---

## Docker

```bash
docker compose up -d
```

Services:

| Service | Port |
| --- | --- |
| `backend` | 5000 |
| `frontend` | 3000 |
| `mongodb` | 27017 |
| `mongodb-test` | 27018 |

---

## Design Decisions

- **Zod over manual validation.** One schema, one source of truth. Tests
  target the route level so schemas are exercised end-to-end.
- **`AppError` over `Error`.** Stable error codes decouple backend from
  frontend translations. No string matching in the frontend.
- **Refresh token rotation + hashed storage.** Refresh tokens are rotated
  on every use; the previous token is revoked. Storage is SHA-256 only.
- **Partial unique indexes instead of `sparse: true`.** `sparse` treats
  `null` as a value; `partialFilterExpression: { field: { $type: 'string' } }`
  correctly allows multiple accounts without that credential.
- **Per-endpoint rate limits.** Login and OTP have different threat models
  and therefore different policies.
- **No raw token in responses.** Access token in the JSON body, refresh
  token exclusively via HTTP-only cookie.

---

## Roadmap

- [ ] Extend Zod middleware to the remaining domains
  (marketplace, financial, team).
- [ ] Add `validateQuery` middleware for pagination endpoints.
- [ ] Add `refreshTokenRotation` audit trail.
- [ ] Migrate the remaining placeholder test suites to the auth-domain
  standard.
- [ ] OpenAPI 3.1 specification generated from Zod schemas.

---

## License

Private — © My Aura.
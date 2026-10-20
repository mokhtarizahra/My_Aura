# My Aura — Frontend

Next.js 16 (App Router) frontend for **My Aura**, a sports venue booking
and professional-coaching marketplace. Built around a **fully
internationalized (i18n) shell**, a resilient authentication layer, and a
**translation-driven error surface** that consumes machine-readable error
codes from the backend.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Internationalization](#internationalization)
- [Authentication State](#authentication-state)
- [Route Protection](#route-protection)
- [Error Handling Contract](#error-handling-contract)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Testing](#testing)
- [Design Decisions](#design-decisions)
- [Roadmap](#roadmap)

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | **Next.js 16** (App Router, Turbopack) |
| React | **React 19** |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS + **shadcn/ui** (Radix primitives) |
| Forms | React Hook Form + **Zod v4** |
| HTTP | Axios (singleton with interceptors) |
| i18n | **next-intl v4** (server + client) |
| Testing | Vitest + Testing Library |
| Icons | Lucide |

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                       app/[locale]/                          │
│  Route segments with mandatory locale prefix (/fa, /en)      │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                     proxy.ts (middleware)                    │
│  1. i18n locale negotiation                                  │
│  2. Auth guard (cookie-based)                                │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│              components/  +  hooks/  +  services/            │
│  - Components: pure UI + i18n                                │
│  - Hooks: auth flows, error mapping                          │
│  - Services: axios wrappers, error-code normalization        │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                  Backend API (see backend README)            │
└──────────────────────────────────────────────────────────────┘
```

**Principles:**

- **Thin pages.** Every route file (`app/[locale]/…/page.tsx`) is a
  minimal wrapper that renders a single feature component.
- **Logic in hooks.** `useOTP`, `usePhone`, `usePassword`,
  `useRegistration`, `useSessions`, `useAccountTypeRedirect` —
  each encapsulates one business flow.
- **Error codes, not strings.** The backend returns `code`; the frontend
  maps it to a translation key. **No string matching anywhere.**

---

## Internationalization

Powered by **`next-intl` v4** with a fully segmented routing model.

### Locales

| Locale | Prefix | Direction |
| --- | --- | --- |
| Persian | *(none)* | `rtl` |
| English | `/en` | `ltr` |

Routing mode is `as-needed` — Persian is the default and lives at the
root; English is explicitly prefixed.

### Files

```
frontend/
├── i18n/
│   ├── routing.ts        # defineRouting({ locales, defaultLocale, localePrefix })
│   ├── navigation.ts     # Localized <Link>, useRouter, usePathname
│   └── request.ts        # Per-request message loading via next/root-params
├── messages/
│   ├── fa.json
│   └── en.json
└── proxy.ts              # Locale detection + auth guard
```

### Language Switcher

`components/layout/LanguageSwitcher.tsx` — a shadcn `Select` that swaps
locale via `useRouter().replace(pathname, { locale })`, preserving the
current route. Layout direction and `<html lang>` update automatically.

### Message Coverage

Translation domains currently shipped:

- `Common` — shared UI strings
- `AccountType` — personal / organization / staff
- `Auth.login`, `Auth.phone`, `Auth.otp`,
  `Auth.completeRegistration`, `Auth.resetPassword`,
  `Auth.changePassword`, `Auth.sessions`, `Auth.forbidden`
- `Home` — landing page sections (hero, categories, search bar)
- `Validation` — validation error codes

---

## Authentication State

`AuthenticationProvider` (in `context/authentication/`) exposes:

```ts
{
  session: Session | null;
  accessToken: string | null;
  isLoading: boolean;
  loginWithPassword(identifier, password, identifierType?, accountType?);
  register(verificationToken, firstName, lastName, password);
  logout();
  getSessions();
  revokeSession();
  revokeAllSessions();
}
```

### Token Strategy

| Token | Storage | Rationale |
| --- | --- | --- |
| Access token | In-memory + `sessionStorage` | Short TTL (15 min), rehydrated on refresh |
| Refresh token | **HTTP-only cookie** | Inaccessible to JS, `SameSite=Strict` |

### Axios Interceptors

`lib/client.ts` implements the full auth lifecycle transparently:

1. **Request:** attaches `Authorization: Bearer <accessToken>`.
2. **401 response:** triggers a **single-flight token refresh**, queues
   concurrent failed requests, then replays them.
3. **403 response:** clears local state and redirects to `/auth/403`.
4. **Refresh failure:** clears storage and redirects to `/auth/login`.

Concurrent requests during a refresh are queued and replayed — no
thundering herd, no duplicate refreshes.

---

## Route Protection

`proxy.ts` (the Next.js 16 successor to `middleware.ts`) runs two
pipelines:

1. **i18n** — normalizes the path, negotiates locale, redirects
   missing prefixes.
2. **Auth guard** — cookie-based check on `/dashboard` and `/settings`.
   Redirects unauthenticated users to `/auth/login`, authenticated
   users away from `/auth/*`.

The middleware intentionally does **not** trust cookies for authorization
— only for UX. The backend remains the source of truth for every
authenticated request.

---

## Error Handling Contract

Every form follows the same pattern:

```ts
const errorKeyMap: Record<string, string> = {
  INVALID_CREDENTIALS: 'errors.invalidCredentials',
  ACCOUNT_NOT_ACTIVE: 'errors.accountNotActive',
  VALIDATION_FAILED: 'errors.validationFailed',
  // …
};

const translationKey = errorKeyMap[code];
setErrorMessage(translationKey ? t(translationKey) : t('errors.generic'));
```

- **The backend's `code` is the only signal.** No `err.message.includes(…)`.
- Unknown codes fall back to a generic localized error.
- Success and failure are structurally discriminated by the backend
  (`{ success: true, data }` vs `{ success: false, code }`).

---

## Project Structure

```
frontend/
├── app/
│   └── [locale]/
│       ├── auth/
│       │   ├── login/
│       │   ├── register/
│       │   ├── otp/
│       │   ├── complete-registration/
│       │   ├── forgot-password/
│       │   ├── reset-password/
│       │   └── 403/
│       ├── dashboard/
│       ├── settings/
│       │   ├── password/
│       │   └── sessions/
│       ├── layout.tsx           # Locale-aware <html dir> + Providers
│       └── page.tsx
├── components/
│   ├── auth/                    # LoginForm, PhoneForm, OTPForm,
│   │                            #   CompleteRegistrationForm, ResetPasswordForm
│   ├── settings/                # SettingsPasswordForm, SessionList,
│   │                            #   SessionCard, SessionsManager
│   ├── sections/                # HeroSection, CategoriesSection, SearchBar
│   ├── layout/                  # LanguageSwitcher
│   └── ui/                      # shadcn primitives
├── context/
│   └── authentication/
│       └── AuthenticationProvider.tsx
├── hooks/
│   ├── authentication/          # useOTP, usePhone, usePassword,
│   │                            #   useRegistration, useSessions
│   └── useAccountTypeRedirect.ts
├── i18n/                        # routing.ts, navigation.ts, request.ts
├── lib/
│   ├── client.ts                # Axios + refresh interceptor
│   ├── storage.ts               # sessionStorage abstraction
│   ├── errors.ts                # extractErrorCode()
│   └── numbers.ts               # Persian → Latin digit normalization
├── messages/                    # fa.json, en.json
├── services/
│   └── authentication/          # auth.Service, otp.service,
│                                #   password.service, session.service
├── types/                       # auth.ts (Session, AccountType, …)
├── proxy.ts                     # i18n + auth middleware
└── vitest.config.ts
```

---

## Environment Variables

```env
# Same-origin API calls (proxied by Next.js rewrites)
NEXT_PUBLIC_API_URL=/api

# Backend origin for the dev proxy
BACKEND_URL=http://localhost:5000
```

The frontend **never** calls the backend cross-origin. `/api/*` is
rewritten to `BACKEND_URL/*` at the Next.js layer, keeping cookies
first-party and eliminating CORS entirely in the browser.

---

## Running Locally

```bash
npm install
npm run dev
```

App is served at `http://localhost:3000` (Persian) and
`http://localhost:3000/en` (English).

---

## Testing

```bash
# Full suite
npx vitest run

# Single file
npx vitest run components/auth/LoginForm.test.tsx
```

Coverage:

- **57 tests** across components, hooks and services.
- Every form has a full behavioural test:
  empty submission, invalid input, successful submission,
  backend error code → localized message, loading state.
- **`NextIntlClientProvider` is used in every test** so translations
  are exercised end-to-end, not mocked.
- **`vi.mock` for `@/i18n/navigation`** so localized `<Link>` and
  `useRouter` are handled in the test environment.
- **Stable module-level mocks** prevent re-render loops caused by
  unstable `useCallback`/`useMemo` dependencies.

---

## Design Decisions

- **`next-intl` over `next-i18next`.** App Router native, server and
  client support, and `root-params`-based locale resolution.
- **`as-needed` locale prefix.** Persian (the primary audience) keeps
  clean URLs; English is explicitly prefixed for SEO.
- **Zod both client- and server-side.** The client validates before
  submission; the server is the authoritative gate. The two schemas
  must stay aligned.
- **Error codes, not localized strings, from the backend.** The
  backend stays locale-agnostic; adding a language is a frontend-only
  change.
- **`proxy.ts` over `middleware.ts`.** Next.js 16 renamed the file;
  we migrated early and deprecated the old name.
- **Session, not user, in context.** The backend no longer returns a
  user object on login — only a session. Profile data is fetched
  separately when needed.
- **`sessionStorage`, not `localStorage`, for access token.** The
  token is cleared when the tab closes, and XSS exposure is
  bounded to the current tab.
- **Digits normalized before validation.** `toEnglishDigits()` in
  `lib/numbers.ts` converts Persian/Arabic numerals so users can
  type with a Persian keyboard.

---

## Roadmap

- [ ] Split `messages/*.json` into namespaced files
  (`messages/fa/auth.json`, `messages/fa/home.json`, …) with
  **lazy loading** in `i18n/request.ts`.
- [ ] Full English test coverage (`locale="en"`) for every component
  that uses `useTranslations`.
- [ ] Add `SettingsPasswordForm` English-locale test parity.
- [ ] Migrate to `next/root-params` fully (remove
  `setRequestLocale` deprecation).
- [ ] Add design tokens layer on top of shadcn.
- [ ] Storybook for the `components/ui` primitives.

---

## License

Private — © My Aura.
# CLAUDE.md

## Project Overview

NestJS REST API backend with Firebase authentication, WebSocket support, push notifications, and PostgreSQL persistence.

## Tech Stack

- **Framework:** NestJS v10 (TypeScript)
- **Database:** PostgreSQL via TypeORM v0.2
- **Auth:** Firebase Admin SDK + Passport.js + JWT
- **Real-time:** Socket.io via @nestjs/websockets
- **Push Notifications:** Expo Server SDK
- **Email:** SendGrid
- **Validation:** class-validator + class-transformer
- **Testing:** Jest + ts-jest
- **Package Manager:** Yarn

## Common Commands

```bash
# Development
yarn start:dev          # Hot-reload dev server (nodemon)
yarn start:debug        # Debug mode with inspector

# Build & Production
yarn build              # Compile to dist/
yarn start:prod         # Run compiled output

# Code Quality
yarn lint               # ESLint with auto-fix
yarn format             # Prettier formatting

# Testing
yarn test               # Unit tests
yarn test:watch         # Watch mode
yarn test:cov           # Coverage report
yarn test:debug         # Debug mode
yarn test:e2e           # End-to-end tests

# Database Migrations
yarn typeorm:migration:generate -n <MigrationName>   # Generate from entity changes
yarn typeorm:migration:create -n <MigrationName>     # Create empty migration
yarn typeorm:migration:run                            # Run pending migrations
yarn tmr                                              # Shorthand for migration:run
```

## Architecture

```
src/
├── config/             # ConfigService — singleton env var management
├── dto/                # Shared global DTOs
├── entities/           # TypeORM entities
├── firebase/           # Firebase Admin SDK initialization (global module)
├── firebase-auth/      # Firebase auth flow, OTP, token refresh
├── migration/          # TypeORM migration files
├── notifications/      # Push notification tokens and delivery
├── users/              # User CRUD, profile, onboarding
├── utils/              # Error handling, exceptions, filters, pipes
├── app.module.ts       # Root module — imports all features, TypeORM config
├── main.ts             # Bootstrap — CORS, global pipes/filters, static assets
├── socket.gateway.ts   # WebSocket gateway
└── socket.module.ts    # WebSocket module (global)
```

### Module Responsibilities

| Module | Responsibility |
|---|---|
| `UsersModule` | User CRUD, profile management, onboarding step tracking |
| `FirebaseAuthModule` | Firebase token verification, OTP, JWT refresh |
| `NotificationModule` | Push token registration, notification delivery and history |
| `FirebaseModule` | Firebase Admin SDK wrapper (globally exported) |
| `SocketModule` | Real-time WebSocket communication |
| `ConfigModule` | Environment loading and validation |

## Key Entities

- **FirebaseUser** — Firebase-authenticated users; has `onboardingStep` enum, `photoUrl`, OneToMany `pushTokens`
- **PushToken** — Device tokens for Expo push notifications
- **Notification** — Notification delivery history
- **OtpCode** — One-time passwords for 2FA flows
- **Session / TfaSession** — Auth session tracking
- **BaseEntity** — Abstract base with `id`, `createdAt`, `updatedAt`

## Environment Variables

Copy `.env.example` to `.env`. Required groups:

```
# Database
POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DATABASE

# Server
PORT, MODE (DEV|PROD), APP (DEV|PROD), RUN_MIGRATIONS (true|false)

# Auth
JWT_SECRET, ACCESS_TOKEN_TTL_MINUTES, REFRESH_TOKEN_TTL_DAYS, SOCKET_TOKEN

# Firebase
WITH_FIREBASE (true|false), FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY

# External Services
EXPO_ACCESS_TOKEN, SENDGRID_API_KEY, SENDGRID_FROM_EMAIL
IP_REGISTRY_API_URL, IP_REGISTRY_API_KEY

# CORS
CORS_ALLOWED_ORIGINS (comma-separated), FRONTEND_URL, API_URL
```

Access env vars only through `ConfigService` — never `process.env` directly.

## Code Style

- **Prettier:** single quotes, trailing commas everywhere
- **ESLint:** TypeScript-aware, relaxed (`@typescript-eslint/no-explicit-any` is off)
- **No strict TypeScript** — `strict: false` in tsconfig
- DTOs use `class-validator` decorators for request validation
- Follow NestJS naming conventions: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.guard.ts`, `*.dto.ts`, `*.entity.ts`

## Patterns to Follow

- **Config:** Always use `ConfigService.getValue()` — never read `process.env` directly
- **Guards:** Firebase auth guard applied at controller or route level via `@UseGuards(FirebaseAuthGuard)`
- **Current user:** Extract via `@Req() request: RequestWithFirebaseUser`, then `request.user`
- **Pagination:** Use `nestjs-typeorm-paginate` with `PaginatedListDto` for list endpoints
- **Errors:** Throw NestJS built-in HTTP exceptions (`NotFoundException`, `BadRequestException`, etc.); the global `GlobalExceptionFilter` handles formatting
- **Migrations:** Always generate a migration when changing entities; never use `synchronize: true` in production
- **Response DTOs:** Always map entity data through a DTO before returning from controllers

## Database Notes

- TypeORM configured in `app.module.ts` and `ormconfig.json`
- Migrations auto-run on startup when `RUN_MIGRATIONS=true`
- Migration files live in `src/migration/` with timestamp naming convention
- `dropSchema` is `false` — safe for production

## Testing

**Stack:** Jest + ts-jest, running in Node environment.

**File conventions:**
- Unit tests: `src/**/*.spec.ts` (co-located with source files)
- E2E tests: `./test/` directory, configured via `jest-e2e.json`

**Writing tests:**
- Use `Test.createTestingModule()` from `@nestjs/testing` to bootstrap isolated modules
- Mock dependencies with `{ provide: ServiceName, useValue: mockObject }`
- Mock TypeORM repositories with `getRepositoryToken(Entity)` from `@nestjs/typeorm`
- Mock `ConfigService` when testing services that depend on env vars

**Example unit test structure:**
```ts
describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(FirebaseUser), useValue: mockRepository },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should ...', async () => {
    // arrange, act, assert
  });
});
```

**Coverage output:** `../coverage` (relative to `src/`)
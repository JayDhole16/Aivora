# Aivora - Multi-tenant AI Voice Receptionist Platform

Aivora is a multi-tenant SaaS backend for an AI voice receptionist, WhatsApp assistant, and website builder platform for small businesses.

## Architecture

```
┌─────────────────┐     ┌──────────────────────┐
│   apps/api      │◄───►│  apps/ai-orchestrator│
│   (NestJS)      │     │  (FastAPI + Python)  │
│   - Postgres    │     │  - LLM Conversation  │
│   - Redis       │     │  - Tool Calling      │
│   - Auth/RBAC   │     │  - RAG Integration   │
│   - Booking     │     │                      │
└─────────────────┘     └──────────────────────┘
         ▲
         │
    ┌────┴────┐
    │  PostgreSQL + pgvector │
    │  (Multi-tenant with RLS)│
    └────────────────────────┘
```

### Services

| Service | Technology | Port | Description |
|---------|------------|------|-------------|
| API | NestJS + TypeScript | 3001 | REST API, Auth, Multi-tenancy, Booking, Voice Config |
| AI Orchestrator | FastAPI + Python | 8000 | LLM conversation loop, tool calling, RAG |
| PostgreSQL | pgvector/pg16 | 5432 | Primary database with vector embeddings |
| Redis | Redis 7 | 6379 | Caching, BullMQ job queues |

## Quick Start

### Prerequisites

- Node.js 20 LTS
- Python 3.11+
- pnpm 9+
- Docker & Docker Compose
- uv (Python package manager)

### 1. Clone and Install

```bash
git clone <repository>
cd aivora

# Install Node.js dependencies
pnpm install

# Install Python dependencies
cd apps/ai-orchestrator && uv sync && cd ../..
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your API keys (at minimum OPENAI_API_KEY for embeddings)
```

### 3. Start Infrastructure

```bash
# Start PostgreSQL and Redis
docker-compose -f infra/docker-compose.yml up -d postgres redis

# Or start everything including apps
docker-compose -f infra/docker-compose.yml up -d
```

### 4. Run Migrations & Seed

```bash
# Run database migrations
cd apps/api && pnpm db:migrate

# Seed demo data
pnpm db:seed
```

### 5. Start Development Servers

```bash
# Terminal 1: Start API
cd apps/api && pnpm start:dev

# Terminal 2: Start AI Orchestrator
cd apps/ai-orchestrator && uv run uvicorn app.main:app --reload --port 8000
```

### 6. Verify

- API: http://localhost:3001/api
- Swagger Docs: http://localhost:3001/docs
- AI Orchestrator: http://localhost:8000
- Health Check: http://localhost:3001/api/health

## Project Structure

```
aivora/
├── apps/
│   ├── api/                    # NestJS API
│   │   ├── src/
│   │   │   ├── auth/           # Authentication & OTP
│   │   │   ├── tenancy/        # Multi-tenancy & RLS
│   │   │   ├── secrets/        # Secrets vault abstraction
│   │   │   ├── business-profile/
│   │   │   ├── knowledge-base/ # KB with pgvector embeddings
│   │   │   ├── appointments/   # Booking engine
│   │   │   ├── voice/          # Voice receptionist
│   │   │   ├── credentials/    # Credential management
│   │   │   ├── audit/          # Audit logging
│   │   │   └── health/
│   │   └── prisma/             # Schema & migrations
│   │
│   └── ai-orchestrator/        # FastAPI AI service
│       └── app/
│           ├── config.py
│           ├── models.py
│           ├── api_client.py   # Calls apps/api REST endpoints
│           ├── orchestrator.py # LLM conversation loop
│           └── main.py
│
├── packages/
│   └── shared-types/           # TypeScript types shared with frontend
│
├── infra/
│   ├── docker-compose.yml
│   ├── Dockerfile.api
│   └── Dockerfile.ai-orchestrator
│
├── turbo.json                  # Turborepo config
├── package.json                # Root package.json (pnpm workspaces)
└── Makefile                    # Common commands
```

## Key Features

### Multi-tenancy with Row-Level Security
- Every tenant-scoped table has `org_id`
- RLS policies enforce isolation at database level
- `TenantContextService` sets `app.current_org_id` per request
- Automated test verifies cross-org isolation

### Authentication
- Email + OTP signup/login
- Google & Microsoft OAuth (structured, mockable)
- JWT access tokens (15min) + refresh tokens (7d) as httpOnly cookies
- RBAC: owner, admin, agent, viewer roles enforced at controller level

### Secrets Vault
- `SecretsProvider` interface with `LocalAesGcmSecretsProvider` (dev) and `AwsKmsSecretsProvider` (prod stub)
- AES-256-GCM encryption, keys from `SECRETS_MASTER_KEY`
- Raw secrets never appear in API responses or logs

### Knowledge Base with RAG
- PDF upload → text extraction → LLM structuring → candidate entries for review
- Embeddings generated on create/update (OpenAI/Anthropic configurable)
- pgvector cosine similarity search via `POST /knowledge-base/search`

### Appointment Booking Engine
- Services with duration, buffers, pricing
- Staff with working hours, service assignments
- Availability calculation respecting hours, buffers, existing bookings
- **Concurrency-safe**: Exclusion constraint prevents double-booking, race condition handled with re-check in transaction
- BullMQ reminder jobs (24h, 1h before)

### Voice Receptionist
- Voice agent config: persona, greeting, voice, escalation, consent
- Twilio phone number search/purchase (with nearby area code fallback)
- Webhook pipeline: Twilio → Deepgram STT → AI Orchestrator → ElevenLabs TTS → Twilio
- Mandatory AI disclosure + consent greeting
- Hardened system prompt against injection
- Tool calling: check_availability, book_appointment, transfer_to_human, take_message
- Sandbox/preview mode (is_sandbox flag, no billing impact)
- Go Live check: preview opened + all credentials connected

### Audit Logging
- Interceptor-based logging for credential changes, service status changes
- Actor, action, resource, before/after state

## API Endpoints

### Authentication
```
POST   /api/v1/auth/signup
POST   /api/v1/auth/send-otp
POST   /api/v1/auth/verify-otp
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
POST   /api/v1/auth/invite
```

### Business Profile
```
POST   /api/v1/business-profile
GET    /api/v1/business-profile
PUT    /api/v1/business-profile
DELETE /api/v1/business-profile
```

### Knowledge Base
```
POST   /api/v1/knowledge-base
POST   /api/v1/knowledge-base/bulk
GET    /api/v1/knowledge-base
GET    /api/v1/knowledge-base/:id
PUT    /api/v1/knowledge-base/:id
DELETE /api/v1/knowledge-base/:id
POST   /api/v1/knowledge-base/search
POST   /api/v1/knowledge-base/extract
```

### Credentials
```
POST   /api/v1/credentials
GET    /api/v1/credentials
GET    /api/v1/credentials/:id
PUT    /api/v1/credentials/:id
DELETE /api/v1/credentials/:id
POST   /api/v1/credentials/:id/test
```

### Appointments
```
POST   /api/v1/appointments/services
GET    /api/v1/appointments/services
GET    /api/v1/appointments/services/:id
PUT    /api/v1/appointments/services/:id
DELETE /api/v1/appointments/services/:id

POST   /api/v1/appointments/staff
GET    /api/v1/appointments/staff
GET    /api/v1/appointments/staff/:id
PUT    /api/v1/appointments/staff/:id
DELETE /api/v1/appointments/staff/:id

GET    /api/v1/appointments/availability
POST   /api/v1/appointments
GET    /api/v1/appointments
GET    /api/v1/appointments/:id
PUT    /api/v1/appointments/:id
DELETE /api/v1/appointments/:id
POST   /api/v1/appointments/:id/no-show
```

### Voice
```
POST   /api/v1/voice/services/:serviceId/config
GET    /api/v1/voice/services/:serviceId/config
PUT    /api/v1/voice/services/:serviceId/config
DELETE /api/v1/voice/services/:serviceId/config

GET    /api/v1/voice/phone-numbers/search
POST   /api/v1/voice/phone-numbers/purchase
GET    /api/v1/voice/phone-numbers
DELETE /api/v1/voice/phone-numbers/:id

GET    /api/v1/voice/services/:serviceId/go-live-check
POST   /api/v1/voice/services/:serviceId/sandbox-call

POST   /api/v1/voice/webhook/incoming
POST   /api/v1/voice/webhook/status
POST   /api/v1/voice/webhook/recording
POST   /api/v1/voice/webhook/process-speech
```

### Audit Logs
```
GET    /api/v1/audit-logs
GET    /api/v1/audit-logs/:id
```

## Testing

```bash
# API tests
cd apps/api && pnpm test

# AI Orchestrator tests
cd apps/ai-orchestrator && uv run pytest

# Integration tests (requires Docker)
cd apps/api && pnpm test:e2e
```

## Environment Variables

See `.env.example` for all configuration options. Key variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `REDIS_URL` | Redis connection string | Yes |
| `JWT_ACCESS_SECRET` | JWT access token secret (32+ chars) | Yes |
| `JWT_REFRESH_SECRET` | JWT refresh token secret (32+ chars) | Yes |
| `SECRETS_MASTER_KEY` | AES-256-GCM master key (64 hex chars) | Yes |
| `OPENAI_API_KEY` | OpenAI API key for embeddings/LLM | Yes |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID | For voice |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | For voice |
| `DEEPGRAM_API_KEY` | Deepgram API key for STT | For voice |
| `ELEVENLABS_API_KEY` | ElevenLabs API key for TTS | For voice |

## Production Deployment

1. Set `NODE_ENV=production`
2. Use `SECRETS_PROVIDER=aws_kms` with valid AWS KMS credentials
3. Configure real OAuth credentials
4. Set up SSL/TLS termination (nginx, ALB, etc.)
5. Use managed PostgreSQL (RDS, Cloud SQL) with pgvector
6. Use managed Redis (ElastiCache, Redis Cloud)
7. Configure S3-compatible storage for recordings
8. Set up monitoring (Prometheus, Grafana, Datadog)

## License

MIT
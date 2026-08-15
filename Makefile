.PHONY: help install dev build test lint docker-up docker-down docker-logs db-migrate db-seed db-studio clean

help:
	@echo "Aivora - Multi-tenant AI Voice Receptionist Platform"
	@echo ""
	@echo "Usage:"
	@echo "  make install       Install all dependencies"
	@echo "  make dev           Start development servers"
	@echo "  make build         Build all packages"
	@echo "  make test          Run all tests"
	@echo "  make lint          Lint all packages"
	@echo "  make docker-up     Start Docker services"
	@echo "  make docker-down   Stop Docker services"
	@echo "  make docker-logs   View Docker logs"
	@echo "  make db-migrate    Run database migrations"
	@echo "  make db-seed       Seed database with demo data"
	@echo "  make db-studio     Open Prisma Studio"
	@echo "  make clean         Clean build artifacts"

install:
	pnpm install
	cd apps/ai-orchestrator && uv sync

dev:
	pnpm dev

build:
	pnpm build

test:
	pnpm test

lint:
	pnpm lint

docker-up:
	docker-compose -f infra/docker-compose.yml up -d

docker-down:
	docker-compose -f infra/docker-compose.yml down

docker-logs:
	docker-compose -f infra/docker-compose.yml logs -f

docker-rebuild:
	docker-compose -f infra/docker-compose.yml up -d --build

db-migrate:
	cd apps/api && pnpm db:migrate

db-migrate-dev:
	cd apps/api && pnpm db:migrate:dev

db-seed:
	cd apps/api && pnpm db:seed

db-studio:
	cd apps/api && pnpm db:studio

db-reset:
	cd apps/api && pnpm prisma migrate reset --force && pnpm db:seed

clean:
	rm -rf apps/api/dist apps/api/node_modules apps/ai-orchestrator/.venv packages/shared-types/dist
	find . -name "node_modules" -type d -prune -exec rm -rf {} +
	find . -name "dist" -type d -prune -exec rm -rf {} +

# Development helpers
api-logs:
	docker-compose -f infra/docker-compose.yml logs -f api

orchestrator-logs:
	docker-compose -f infra/docker-compose.yml logs -f ai-orchestrator

postgres-shell:
	docker-compose -f infra/docker-compose.yml exec postgres psql -U aivora -d aivora

redis-shell:
	docker-compose -f infra/docker-compose.yml exec redis redis-cli
.PHONY: help setup db-build db-start db-stop backend-run frontend-public frontend-backoffice docker-up docker-down

help:
	@echo "PierCloud Status Page - Commands"
	@echo ""
	@echo "Setup:"
	@echo "  make setup           - Install all dependencies"
	@echo ""
	@echo "Database:"
	@echo "  make db-build        - Build PostgreSQL Docker image"
	@echo "  make db-start        - Start PostgreSQL container"
	@echo "  make db-stop         - Stop PostgreSQL container"
	@echo ""
	@echo "Development:"
	@echo "  make backend-run     - Run backend server"
	@echo "  make frontend-public - Run public status page"
	@echo "  make frontend-backoffice - Run backoffice"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-up       - Start all services with docker-compose"
	@echo "  make docker-down     - Stop all services"

setup:
	@echo "📦 Installing dependencies..."
	cd backend && go mod download
	cd frontend/public-page && npm install
	cd frontend/backoffice && npm install
	@echo "✅ Setup complete!"

db-build:
	@echo "🐘 Building PostgreSQL image..."
	docker build -f Dockerfile.postgres -t statuspage-postgres .

db-start:
	@echo "🚀 Starting PostgreSQL..."
	docker run -d \
		--name statuspage-postgres \
		-p 5432:5432 \
		-e POSTGRES_DB=statuspage \
		-e POSTGRES_USER=postgres \
		-e POSTGRES_PASSWORD=postgres \
		-v statuspage-postgres-data:/var/lib/postgresql/data \
		statuspage-postgres
	@echo "✅ PostgreSQL running on port 5432"

db-stop:
	@echo "🛑 Stopping PostgreSQL..."
	docker stop statuspage-postgres
	docker rm statuspage-postgres

backend-run:
	@echo "🚀 Starting backend..."
	cd backend && go run main.go

frontend-public:
	@echo "🚀 Starting public status page..."
	cd frontend/public-page && npm run dev

frontend-backoffice:
	@echo "🚀 Starting backoffice..."
	cd frontend/backoffice && npm run dev

docker-up:
	@echo "🐳 Starting all services..."
	docker-compose up -d
	@echo "✅ All services running!"

docker-down:
	@echo "🛑 Stopping all services..."
	docker-compose down

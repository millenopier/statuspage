#!/bin/bash

echo "🚀 Setting up PierCloud Status Page..."

# Backend
echo "📦 Setting up Backend..."
cd backend
cp .env.example .env
go mod download
cd ..

# Frontend - Public Page
echo "📦 Setting up Public Status Page..."
cd frontend/public-page
npm install
cd ../..

# Frontend - Backoffice
echo "📦 Setting up Backoffice..."
cd frontend/backoffice
npm install
cd ../..

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Create PostgreSQL database: createdb statuspage"
echo "2. Run schema: psql -d statuspage -f backend/database/schema.sql"
echo "3. Run seed: psql -d statuspage -f backend/database/seed.sql"
echo "4. Start backend: cd backend && go run main.go"
echo "5. Start public page: cd frontend/public-page && npm run dev"
echo "6. Start backoffice: cd frontend/backoffice && npm run dev"
echo ""
echo "Or use Docker: docker-compose up"

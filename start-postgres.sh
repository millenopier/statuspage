#!/bin/bash

echo "🐘 Building PostgreSQL Docker image..."
docker build -f Dockerfile.postgres -t statuspage-postgres .

echo "🚀 Starting PostgreSQL container..."
docker run -d \
  --name statuspage-postgres \
  -p 5432:5432 \
  -e POSTGRES_DB=statuspage \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -v statuspage-postgres-data:/var/lib/postgresql/data \
  statuspage-postgres

echo "✅ PostgreSQL is running on port 5432"
echo ""
echo "Connection details:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: statuspage"
echo "  User: postgres"
echo "  Password: postgres"
echo ""
echo "To stop: docker stop statuspage-postgres"
echo "To remove: docker rm statuspage-postgres"

#!/bin/bash
set -e

echo "🚀 Deploying PierCloud Status Page..."

# Ir para o diretório do projeto
cd /opt/statuspage

# Atualizar código do GitHub
echo "📥 Pulling latest code..."
git pull

# Rebuild Backend
echo "🔨 Building backend..."
cd backend
go build -o statuspage main.go
sudo systemctl restart statuspage-backend

# Rebuild Frontend - Public Page
echo "🔨 Building public page..."
cd /opt/statuspage/frontend/public-page
npm install --legacy-peer-deps
npm run build

# Rebuild Frontend - Backoffice
echo "🔨 Building backoffice..."
cd /opt/statuspage/frontend/backoffice
npm install --legacy-peer-deps
npm run build

# Restart Nginx
echo "🔄 Restarting nginx..."
sudo systemctl restart nginx

echo "✅ Deploy complete!"
echo "🌐 Public Page: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo "🔐 Backoffice: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)/admin"

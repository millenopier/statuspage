#!/bin/bash

echo "=== Aplicando Service Visibility ==="

# 1. Migration no banco
echo "1. Rodando migration..."
sudo -u postgres psql statuspage -c "ALTER TABLE services ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;"
sudo -u postgres psql statuspage -c "CREATE INDEX IF NOT EXISTS idx_services_visible ON services(is_visible);"

# 2. Pull do código
echo "2. Atualizando código..."
cd /opt/statuspage
git pull

# 3. Atualizar backend/handlers/admin.go manualmente
echo "3. Atualizando backend handlers..."

# Backup
cp backend/handlers/admin.go backend/handlers/admin.go.bak

# Atualizar GetServices - adicionar is_visible no SELECT e Scan
sed -i 's/SELECT id, name, description, status, position, url, heartbeat_interval, request_timeout, retries, created_at, updated_at FROM services/SELECT id, name, description, status, position, url, heartbeat_interval, request_timeout, retries, is_visible, created_at, updated_at FROM services/g' backend/handlers/admin.go

# 4. Atualizar backend/handlers/public.go
echo "4. Atualizando public handlers..."
cp backend/handlers/public.go backend/handlers/public.go.bak
sed -i 's/SELECT id, name, description, status, position, url, heartbeat_interval, request_timeout, retries, created_at, updated_at FROM services ORDER BY position/SELECT id, name, description, status, position, url, heartbeat_interval, request_timeout, retries, created_at, updated_at FROM services WHERE is_visible = true ORDER BY position/g' backend/handlers/public.go

# 5. Rebuild backend
echo "5. Rebuilding backend..."
cd backend
go build -o statuspage main.go
sudo systemctl restart statuspage-backend

# 6. Rebuild frontend
echo "6. Rebuilding frontend..."
cd ../frontend/backoffice
npm run build

cd ../public-page
npm run build

# 7. Restart nginx
echo "7. Restarting nginx..."
sudo systemctl restart nginx

echo "=== Concluído! ==="
echo "Limpe o cache do navegador: Ctrl+Shift+R"

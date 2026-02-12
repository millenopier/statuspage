#!/bin/bash
# Execute este script no EC2 para aplicar a migração

echo "🗄️ Aplicando migração do banco de dados..."

sudo -u postgres psql -d statuspage << 'EOF'
-- Add incident and incident_published columns to services
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS incident TEXT,
ADD COLUMN IF NOT EXISTS incident_published BOOLEAN DEFAULT false;

-- Add is_visible column to incidents if not exists
ALTER TABLE incidents 
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- Add is_visible column to services if not exists
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- Verificar colunas
\d services
EOF

echo "✅ Migração concluída!"
echo "🔄 Reiniciando backend..."
sudo systemctl restart statuspage-backend
echo "✅ Pronto!"

#!/bin/bash
set -e

# Logs
exec > >(tee /var/log/user-data.log)
exec 2>&1

echo "=== Starting PierCloud Status Page Setup (ARM64) ==="

# ⚠️ SUBSTITUA PELO SEU TOKEN DO GITHUB
GITHUB_TOKEN="SEU_TOKEN_AQUI"

# Atualizar sistema
apt-get update
apt-get upgrade -y

# Instalar dependências
apt-get install -y \
    git curl wget nginx postgresql postgresql-contrib \
    python3 python3-pip build-essential

# Instalar Node.js 20.x (ARM64)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Instalar Go 1.21 (ARM64)
wget https://go.dev/dl/go1.21.0.linux-arm64.tar.gz
rm -rf /usr/local/go
tar -C /usr/local -xzf go1.21.0.linux-arm64.tar.gz
export PATH=$PATH:/usr/local/go/bin

# Configurar PostgreSQL
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
sudo -u postgres createdb statuspage || true

# Clonar repositório privado
cd /opt
git clone https://${GITHUB_TOKEN}@github.com/millenopier/statuspage.git
cd statuspage

# Setup banco de dados
sudo -u postgres psql -d statuspage -f backend/database/schema.sql
sudo -u postgres psql -d statuspage -f backend/database/seed.sql

# Configurar Backend
cd backend
cat > .env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=statuspage
JWT_SECRET=$(openssl rand -hex 32)
PORT=8080
EOF

go mod download
go build -o statuspage main.go

# Criar serviço systemd para backend
cat > /etc/systemd/system/statuspage-backend.service << EOF
[Unit]
Description=PierCloud Status Page Backend
After=network.target postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/statuspage/backend
ExecStart=/opt/statuspage/backend/statuspage
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable statuspage-backend
systemctl start statuspage-backend

# Build Frontend - Public Page
cd /opt/statuspage/frontend/public-page
npm install --legacy-peer-deps
npm run build

# Build Frontend - Backoffice
cd /opt/statuspage/frontend/backoffice
npm install --legacy-peer-deps
npm run build

# Configurar Nginx
cat > /etc/nginx/sites-available/statuspage << 'EOF'
server {
    listen 80;
    server_name _;

    # Public Status Page
    location / {
        root /opt/statuspage/frontend/public-page/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backoffice
    location /admin {
        alias /opt/statuspage/frontend/backoffice/dist;
        try_files $uri $uri/ /admin/index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

ln -sf /etc/nginx/sites-available/statuspage /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

# Instalar dependências Python
pip3 install requests

echo "=== Setup Complete ==="
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
echo "✅ Public Page: http://${PUBLIC_IP}"
echo "✅ Backoffice: http://${PUBLIC_IP}/admin"
echo "✅ Backend API: http://${PUBLIC_IP}/api"
echo ""
echo "📝 Credentials:"
echo "   Email: admin@piercloud.io"
echo "   Password: admin123"

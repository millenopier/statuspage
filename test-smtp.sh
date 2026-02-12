#!/bin/bash
# Script para testar SMTP no EC2

echo "🧪 Testing SMTP Configuration..."

# Carregar variáveis do .env
cd /opt/statuspage/backend
source <(grep -v '^#' .env | sed 's/^/export /')

echo "SMTP_HOST: $SMTP_HOST"
echo "SMTP_PORT: $SMTP_PORT"
echo "SMTP_USERNAME: ${SMTP_USERNAME:0:10}..."
echo "SES_FROM_EMAIL: $SES_FROM_EMAIL"

# Testar conexão SMTP
echo ""
echo "Testing SMTP connection..."
timeout 5 bash -c "cat < /dev/null > /dev/tcp/$SMTP_HOST/$SMTP_PORT" && echo "✅ SMTP connection successful!" || echo "❌ SMTP connection failed!"

# Verificar subscribers
echo ""
echo "Checking subscribers..."
sudo -u postgres psql -d statuspage -c "SELECT COUNT(*) as total_subscribers, COUNT(*) FILTER (WHERE is_active = true) as active_subscribers FROM subscribers;"

echo ""
echo "✅ Test complete!"

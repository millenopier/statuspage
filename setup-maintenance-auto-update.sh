#!/bin/bash

echo "🔧 Setting up maintenance auto-update cron job..."

# Criar script wrapper que carrega variáveis de ambiente
cat > /opt/statuspage/run-maintenance-update.sh << 'EOF'
#!/bin/bash
export SLACK_WEBHOOK=$(grep SLACK_WEBHOOK /opt/statuspage/backend/.env | cut -d '=' -f2)
cd /opt/statuspage
/usr/bin/python3 auto-update-maintenances.py >> /var/log/maintenance-update.log 2>&1
EOF

chmod +x /opt/statuspage/run-maintenance-update.sh

# Adicionar ao crontab (executa a cada minuto)
(crontab -l 2>/dev/null | grep -v "run-maintenance-update.sh"; echo "* * * * * /opt/statuspage/run-maintenance-update.sh") | crontab -

echo "✅ Cron job configured to run every minute"
echo "📝 Logs: /var/log/maintenance-update.log"

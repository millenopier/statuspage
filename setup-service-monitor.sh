#!/bin/bash

echo "🔧 Setting up service monitoring cron job..."

# Criar script wrapper
cat > /opt/statuspage/run-service-monitor.sh << 'EOF'
#!/bin/bash
export SLACK_WEBHOOK=$(grep SLACK_WEBHOOK /opt/statuspage/backend/.env | cut -d '=' -f2-)
cd /opt/statuspage
$(which python3) monitor-services.py >> /var/log/service-monitor.log 2>&1
EOF

chmod +x /opt/statuspage/run-service-monitor.sh

# Adicionar ao crontab (executa a cada 1 minuto)
(crontab -l 2>/dev/null | grep -v "run-service-monitor.sh"; echo "* * * * * /opt/statuspage/run-service-monitor.sh") | crontab -

echo "✅ Service monitoring configured to run every minute"
echo "📝 Logs: /var/log/service-monitor.log"

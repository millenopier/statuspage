#!/bin/bash
# Script de correção rápida dos alertas do Slack

echo "🔧 Fixing Slack Alerts..."

# 1. Instalar python-dotenv
echo "📦 Installing python-dotenv..."
pip3 install python-dotenv

# 2. Criar arquivo de configuração se não existir
if [ ! -f "monitor-config.env" ]; then
    echo "📝 Creating monitor-config.env from example..."
    
    if [ -f "monitor-config.env.example" ]; then
        cp monitor-config.env.example monitor-config.env
        echo "✅ Created monitor-config.env"
    else
        cat > monitor-config.env << 'EOF'
# Monitor Configuration
SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/HERE
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=statuspage
BACKEND_URL=http://localhost:8080/api/monitors/report
EOF
        echo "✅ Created monitor-config.env"
    fi
    
    echo ""
    echo "⚠️  IMPORTANTE: Edite monitor-config.env com suas credenciais reais!"
    echo "   nano monitor-config.env"
    echo ""
else
    echo "✅ monitor-config.env já existe"
fi

# 3. Proteger arquivo
chmod 600 monitor-config.env
echo "🔒 Permissions set to 600"

# 4. Verificar se scripts existem
if [ -f "monitor.py" ]; then
    echo "✅ monitor.py encontrado"
else
    echo "❌ monitor.py não encontrado!"
fi

if [ -f "auto-monitor-services.py" ]; then
    echo "✅ auto-monitor-services.py encontrado"
else
    echo "❌ auto-monitor-services.py não encontrado!"
fi

echo ""
echo "✅ Setup completo!"
echo ""
echo "📋 Próximos passos:"
echo "1. Edite monitor-config.env com suas credenciais:"
echo "   nano monitor-config.env"
echo ""
echo "2. Teste o monitor:"
echo "   python3 monitor.py"
echo ""
echo "3. Teste o Slack:"
echo "   python3 test-slack.py"
echo ""
echo "4. Verifique os logs:"
echo "   tail -f monitor.log"

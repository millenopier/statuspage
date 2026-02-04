#!/bin/bash

cd /Users/milleno/Documents/statuspage

# Limpar portas
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null

# Iniciar Public Page
cd frontend/public-page
npm run dev > ../../public-page.log 2>&1 &
PUBLIC_PID=$!
echo "Public Page iniciado (PID: $PUBLIC_PID)"

# Iniciar Backoffice
cd ../backoffice
npm run dev > ../../backoffice.log 2>&1 &
BACKOFFICE_PID=$!
echo "Backoffice iniciado (PID: $BACKOFFICE_PID)"

# Iniciar Monitor
cd ../..
python3 monitor.py > monitor.log 2>&1 &
MONITOR_PID=$!
echo "Monitor iniciado (PID: $MONITOR_PID)"

echo ""
echo "✅ Aplicação iniciada!"
echo "📊 Status Page: http://localhost:3000"
echo "⚙️  Backoffice: http://localhost:3001"
echo "🔧 Backend API: http://localhost:8080"
echo "👁️  Monitor: Rodando em background"
echo ""
echo "PIDs: Public=$PUBLIC_PID | Backoffice=$BACKOFFICE_PID | Monitor=$MONITOR_PID"

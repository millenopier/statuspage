#!/bin/bash

# Script para configurar monitoramento automático

SCRIPT_DIR="/Users/milleno/Documents/statuspage-new"
CRON_SCHEDULE="* * * * *"  # A cada 1 minuto (60 segundos)

echo "Configurando monitoramento automático..."
echo ""
echo "Script: $SCRIPT_DIR/monitor.py"
echo "Frequência: A cada 60 segundos"
echo "Timeout: 120 segundos"
echo "Retries: 5"
echo ""

# Adicionar ao crontab
(crontab -l 2>/dev/null | grep -v "monitor.py"; echo "$CRON_SCHEDULE cd $SCRIPT_DIR && /usr/bin/python3 monitor.py >> /tmp/statuspage-monitor.log 2>&1") | crontab -

echo "✅ Cron job configurado!"
echo ""
echo "Para ver logs: tail -f /tmp/statuspage-monitor.log"
echo "Para remover: crontab -e (e deletar a linha do monitor.py)"
echo ""
echo "Executando primeira verificação..."
cd $SCRIPT_DIR && python3 monitor.py

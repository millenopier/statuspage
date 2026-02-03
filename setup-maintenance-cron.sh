#!/bin/bash

SCRIPT_DIR="/Users/milleno/Documents/statuspage-new"
CRON_SCHEDULE="* * * * *"  # A cada 1 minuto

echo "Configurando atualização automática de manutenções..."
echo ""
echo "Script: $SCRIPT_DIR/auto-complete-maintenances.py"
echo "Frequência: A cada 1 minuto"
echo ""

# Adicionar ao crontab
(crontab -l 2>/dev/null | grep -v "auto-complete-maintenances.py"; echo "$CRON_SCHEDULE cd $SCRIPT_DIR && /usr/local/bin/python3 auto-complete-maintenances.py >> /tmp/maintenance-auto.log 2>&1") | crontab -

echo "✅ Cron job configurado!"
echo ""
echo "Para ver logs: tail -f /tmp/maintenance-auto.log"
echo "Para remover: crontab -e (e deletar a linha do auto-complete-maintenances.py)"
echo ""
echo "Executando primeira verificação..."
cd $SCRIPT_DIR && python3 auto-complete-maintenances.py

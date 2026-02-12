#!/usr/bin/env python3
import requests
import os
from datetime import datetime
from dotenv import load_dotenv

# Carregar configurações
load_dotenv('/Users/milleno/Documents/statuspage/monitor-config.env')
load_dotenv('monitor-config.env')  # Fallback para path relativo

SLACK_WEBHOOK = os.getenv('SLACK_WEBHOOK', '')

if not SLACK_WEBHOOK:
    print("❌ SLACK_WEBHOOK não configurado no monitor-config.env")
    exit(1)

# Teste de alerta
payload = {
    "attachments": [{
        "color": "danger",
        "title": "🚨 ALERT: Test Service is DOWN",
        "fields": [
            {"title": "Service", "value": "Test Service", "short": True},
            {"title": "URL", "value": "https://example-down.com", "short": True},
            {"title": "Status", "value": "Error: Connection timeout", "short": False},
            {"title": "Time", "value": datetime.now().strftime('%Y-%m-%d %H:%M:%S'), "short": True}
        ]
    }]
}

response = requests.post(SLACK_WEBHOOK, json=payload)
print(f"Slack alert sent! Status: {response.status_code}")

#!/usr/bin/env python3
import requests
from datetime import datetime

SLACK_WEBHOOK = "https://hooks.slack.com/services/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"

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

#!/usr/bin/env python3
import requests

SLACK_WEBHOOK = "https://hooks.slack.com/services/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"

payload = {
    "attachments": [{
        "color": "good",
        "title": "📝 Incident Update: Novo Teste",
        "fields": [
            {"title": "Status", "value": "resolved", "short": True},
            {"title": "Update", "value": "Status changed from identified to resolved", "short": False}
        ]
    }]
}

print("🧪 Testando webhook Slack diretamente...")
response = requests.post(SLACK_WEBHOOK, json=payload)
print(f"Status: {response.status_code}")
print(f"Response: {response.text}")

if response.status_code == 200:
    print("\n✅ Webhook funcionando! Verifique o Slack")
else:
    print(f"\n❌ Erro no webhook: {response.status_code}")

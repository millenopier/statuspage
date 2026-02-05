#!/bin/bash

# Teste de conectividade Slack
WEBHOOK="https://hooks.slack.com/services/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"

echo "🧪 Testing Slack webhook..."

curl -X POST "$WEBHOOK" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "✅ Test from EC2 - Slack integration working!"
  }'

echo ""
echo "✅ Test sent! Check your Slack channel."

# Troubleshooting - EC2 Deploy

## Problemas Corrigidos

### 1. ✅ Subscribe não funcionava
**Causa**: URL hardcoded `localhost:8080` no SubscribeForm
**Solução**: Usar `api` do services/api.js

### 2. ✅ Slack não envia notificações
**Causa**: Webhook hardcoded no código + possível bloqueio de rede
**Solução**: 
- Webhook movido para variável de ambiente `SLACK_WEBHOOK`
- Adicionar ao `.env` na EC2

## Deploy das Correções

```bash
# 1. Local - Commit e push
git add .
git commit -m "fix: subscribe form and slack webhook from env"
git push origin main

# 2. EC2 - Deploy
ssh ubuntu@ec2.pierstatuspage.internal.piercloud.io
cd /opt/statuspage
sudo bash deploy-ec2.sh
```

## Configurar Slack na EC2

```bash
# Na EC2, edite o .env do backend
sudo nano /opt/statuspage/backend/.env

# Adicione esta linha:
SLACK_WEBHOOK=https://hooks.slack.com/services/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

# Salve (Ctrl+O, Enter, Ctrl+X)

# Restart backend
sudo systemctl restart statuspage-backend
```

## Testar Slack

```bash
# Na EC2, execute:
cd /opt/statuspage
bash test-slack-ec2.sh
```

Se não funcionar, verifique:

1. **Firewall/Security Group**: EC2 precisa ter saída HTTPS (443) liberada
2. **Webhook válido**: Teste no navegador ou com curl local
3. **Logs do backend**:
```bash
sudo journalctl -u statuspage-backend -f
```

## Verificar Subscribe

1. Acesse: http://ec2.pierstatuspage.internal.piercloud.io/
2. Clique em "Subscribe to Updates"
3. Digite um email
4. Verifique no backoffice em "Subscribers"

## Verificar Incidents/Maintenances no Slack

1. Acesse backoffice: http://ec2.pierstatuspage.internal.piercloud.io/admin/
2. Crie um incident ou maintenance
3. Verifique o canal do Slack

Se não aparecer:
- Verifique logs: `sudo journalctl -u statuspage-backend -f`
- Teste webhook: `bash test-slack-ec2.sh`
- Verifique se SLACK_WEBHOOK está no .env

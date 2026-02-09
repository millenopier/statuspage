# Atualizar .env no EC2

No EC2, edite o arquivo `/opt/statuspage/backend/.env` e adicione:

```bash
SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR_WEBHOOK_URL
```

Depois reinicie o backend:

```bash
sudo systemctl restart statuspage-backend
```

## Verificar se está funcionando

```bash
# Ver logs do backend
sudo journalctl -u statuspage-backend -f

# Testar criando um incident no backoffice
```

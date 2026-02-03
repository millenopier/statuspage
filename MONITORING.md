# Sistema de Monitoramento Automático

## Configurações

- **Request Timeout**: 120 segundos
- **Retries**: 5 tentativas
- **Heartbeat Interval**: 60 segundos (1 minuto)
- **Slack Alerts**: Integrado

## Como Funciona

1. **Script Python** (`monitor.py`) lê o arquivo JSON com as URLs
2. Faz requisições HTTP/HTTPS para cada URL
3. Envia os resultados ao backend via API
4. Backend cria automaticamente:
   - Monitor (registro do check)
   - Service (se não existir)
5. Atualiza o status do service baseado no resultado

## Status Codes

- **200-299** ou **400-499**: ✅ Operational
- **Outros códigos**: 🚨 Degraded
- **Erro de conexão**: 🚨 Outage

## Uso Manual

```bash
# Executar uma vez
python3 monitor.py

# Ver monitores criados
curl http://localhost:8080/api/monitors | python3 -m json.tool

# Ver services
curl http://localhost:8080/api/public/services | python3 -m json.tool
```

## Configurar Execução Automática

```bash
# Configurar cron (a cada 5 minutos)
chmod +x setup-monitor-cron.sh
./setup-monitor-cron.sh

# Ver logs
tail -f /tmp/statuspage-monitor.log

# Remover cron
crontab -e  # Deletar linha do monitor.py
```

## API Endpoints

### Reportar Check de Monitor
```bash
POST /api/monitors/report
Content-Type: application/json

{
  "name": "My Service",
  "url": "https://example.com",
  "status_code": 200,
  "error": ""
}
```

### Listar Monitores
```bash
GET /api/monitors
```

## Arquivo JSON

Formato: `/Users/milleno/Documents/bl/statuspage/arquivo.json`

```json
{
  "Name": "Service Name",
  "URL": "https://example.com"
}
```

## Integração com Status Page

Os services criados automaticamente aparecem na status page pública:
- http://localhost:3000

E podem ser gerenciados no backoffice:
- http://localhost:3001

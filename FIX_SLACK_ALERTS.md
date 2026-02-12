# 🔧 FIX: Alertas do Slack Não Funcionam

## Problema
Após mudar as senhas do banco e admin, os alertas do Slack pararam de funcionar porque:
1. Scripts Python tinham credenciais hardcoded
2. SLACK_WEBHOOK estava hardcoded no código
3. Faltava validação se o webhook está configurado

## Solução Implementada

### 1. Arquivo de Configuração Centralizado
Criado: `monitor-config.env`

```env
SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR_WEBHOOK_HERE
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=statuspage
BACKEND_URL=http://localhost:8080/api/monitors/report
```

### 2. Scripts Atualizados
- ✅ `monitor.py` - Agora lê do .env
- ✅ `auto-monitor-services.py` - Agora lê do .env

## 🚀 Como Configurar na EC2

### Passo 1: Instalar python-dotenv
```bash
pip3 install python-dotenv
```

### Passo 2: Criar arquivo de configuração
```bash
cd /home/ubuntu/statuspage  # ou seu diretório
nano monitor-config.env
```

Cole e ajuste com suas credenciais REAIS:
```env
SLACK_WEBHOOK=https://hooks.slack.com/services/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
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=seu_usuario_real
DB_PASSWORD=sua_senha_real
DB_NAME=statuspage
BACKEND_URL=http://localhost:8080/api/monitors/report
```

### Passo 3: Proteger o arquivo
```bash
chmod 600 monitor-config.env
```

### Passo 4: Atualizar scripts na EC2
Copie os arquivos atualizados:
- `monitor.py`
- `auto-monitor-services.py`

Ou aplique as mudanças manualmente:

**monitor.py** - Adicione no topo:
```python
from dotenv import load_dotenv

# Carregar configurações do arquivo .env
load_dotenv('/caminho/completo/monitor-config.env')

BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:8080/api/monitors/report')
SLACK_WEBHOOK = os.getenv('SLACK_WEBHOOK', '')
```

**auto-monitor-services.py** - Adicione no topo:
```python
from dotenv import load_dotenv

# Carregar configurações
load_dotenv('/caminho/completo/monitor-config.env')

DB_CONFIG = {
    'host': os.getenv('DB_HOST', '127.0.0.1'),
    'port': int(os.getenv('DB_PORT', 5432)),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'postgres'),
    'database': os.getenv('DB_NAME', 'statuspage')
}
```

### Passo 5: Testar
```bash
# Testar monitor.py
python3 monitor.py

# Testar auto-monitor-services.py
python3 auto-monitor-services.py

# Testar Slack diretamente
python3 test-slack.py
```

### Passo 6: Reiniciar Cron (se estiver usando)
```bash
# Ver cron atual
crontab -l

# Não precisa mudar nada no cron, apenas reiniciar
sudo systemctl restart cron
```

## 🔍 Verificar se Está Funcionando

### 1. Verificar logs
```bash
tail -f monitor.log
```

Deve aparecer:
```
✅ Service Name: operational
   → Slack alert sent (good)
   → Reported to backend
```

### 2. Criar serviço de teste com URL inválida
No backoffice, crie um serviço:
- Name: Test Alert
- URL: https://invalid-url-that-does-not-exist-12345.com
- Heartbeat: 60s

Aguarde 1-2 minutos e verifique:
- ✅ Alerta no Slack
- ✅ Status muda para "outage" no painel
- ✅ Incident criado automaticamente

### 3. Verificar webhook do Slack
```bash
curl -X POST $SLACK_WEBHOOK \
  -H 'Content-Type: application/json' \
  -d '{"text":"🧪 Test from statuspage monitor"}'
```

## ⚠️ Troubleshooting

### Erro: "No module named 'dotenv'"
```bash
pip3 install python-dotenv
```

### Erro: "Slack webhook not configured"
Verifique se o `SLACK_WEBHOOK` está correto no `monitor-config.env`

### Erro: "Connection refused" ao banco
Verifique as credenciais do banco no `monitor-config.env`

### Alertas não aparecem no Slack
1. Verifique se o webhook está válido
2. Teste com curl (comando acima)
3. Verifique logs: `tail -f monitor.log`
4. Confirme que o serviço tem URL configurada

### Service criado mas não monitora
1. Verifique se o campo `url` está preenchido
2. Confirme que o cron está rodando: `crontab -l`
3. Execute manualmente: `python3 monitor.py`

## 📝 Checklist Final

- [ ] `pip3 install python-dotenv` instalado
- [ ] `monitor-config.env` criado com credenciais corretas
- [ ] `chmod 600 monitor-config.env` aplicado
- [ ] Scripts atualizados com `load_dotenv()`
- [ ] Teste manual funcionou
- [ ] Alerta apareceu no Slack
- [ ] Cron reiniciado (se aplicável)

## 🎯 Próximos Passos

Após corrigir, você pode:
1. Adicionar alertas por email (já está no backend)
2. Configurar múltiplos canais do Slack
3. Adicionar webhooks para outros serviços (Discord, Teams, etc)

## 📚 Arquivos Relacionados

- `monitor.py` - Script principal de monitoramento
- `auto-monitor-services.py` - Monitor automático via banco
- `monitor-config.env` - Configurações centralizadas
- `backend/.env` - Configurações do backend Go
- `test-slack.py` - Script de teste do Slack

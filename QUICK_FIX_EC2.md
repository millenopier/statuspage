# 🚀 GUIA RÁPIDO - Configurar Alertas do Slack na EC2

## ⚡ Solução Rápida (5 minutos)

### 1️⃣ Instalar dependência
```bash
pip3 install python-dotenv
```

### 2️⃣ Criar arquivo de configuração
```bash
cd /home/ubuntu/statuspage  # ou seu diretório
nano monitor-config.env
```

Cole e **AJUSTE COM SUAS CREDENCIAIS REAIS**:
```env
SLACK_WEBHOOK=https://hooks.slack.com/services/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
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=seu_usuario_postgres
DB_PASSWORD=sua_senha_postgres
DB_NAME=statuspage
BACKEND_URL=http://localhost:8080/api/monitors/report
```

Salve: `Ctrl+O` → `Enter` → `Ctrl+X`

### 3️⃣ Proteger arquivo
```bash
chmod 600 monitor-config.env
```

### 4️⃣ Atualizar scripts Python

Copie os arquivos atualizados do seu repositório local para a EC2:
```bash
# No seu Mac
scp monitor.py ubuntu@SEU_IP_EC2:/home/ubuntu/statuspage/
scp auto-monitor-services.py ubuntu@SEU_IP_EC2:/home/ubuntu/statuspage/
scp monitor-services.py ubuntu@SEU_IP_EC2:/home/ubuntu/statuspage/
scp auto-update-maintenances.py ubuntu@SEU_IP_EC2:/home/ubuntu/statuspage/
scp test-slack.py ubuntu@SEU_IP_EC2:/home/ubuntu/statuspage/
scp validate-monitor-config.py ubuntu@SEU_IP_EC2:/home/ubuntu/statuspage/
```

### 5️⃣ Validar configuração
```bash
python3 validate-monitor-config.py
```

Deve mostrar tudo ✅ verde!

### 6️⃣ Testar Slack
```bash
python3 test-slack.py
```

Deve aparecer mensagem no seu canal do Slack!

### 7️⃣ Testar monitor
```bash
python3 monitor.py
```

---

## 🔧 Alternativa: Editar Manualmente (se não puder copiar arquivos)

Se não puder copiar os arquivos, edite manualmente cada script Python:

### monitor.py
```bash
nano monitor.py
```

Adicione no topo (após os imports):
```python
from dotenv import load_dotenv

# Carregar configurações do arquivo .env
load_dotenv('/home/ubuntu/statuspage/monitor-config.env')

BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:8080/api/monitors/report')
SLACK_WEBHOOK = os.getenv('SLACK_WEBHOOK', '')
```

E na função `send_slack_alert`, adicione no início:
```python
def send_slack_alert(name, url, status_code, error, is_recovery=False):
    """Envia alerta para o Slack"""
    if not SLACK_WEBHOOK:
        print("   → Slack webhook not configured")
        return
    
    if is_recovery:
```

### auto-monitor-services.py
```bash
nano auto-monitor-services.py
```

Substitua o topo:
```python
from dotenv import load_dotenv

# Carregar configurações
load_dotenv('/home/ubuntu/statuspage/monitor-config.env')

DB_CONFIG = {
    'host': os.getenv('DB_HOST', '127.0.0.1'),
    'port': int(os.getenv('DB_PORT', 5432)),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'postgres'),
    'database': os.getenv('DB_NAME', 'statuspage')
}

SLACK_WEBHOOK = os.getenv('SLACK_WEBHOOK', '')
```

### monitor-services.py
```bash
nano monitor-services.py
```

Mesmo padrão do auto-monitor-services.py

### auto-update-maintenances.py
```bash
nano auto-update-maintenances.py
```

Mesmo padrão do auto-monitor-services.py

### test-slack.py
```bash
nano test-slack.py
```

Substitua o topo:
```python
from dotenv import load_dotenv

# Carregar configurações
load_dotenv('/home/ubuntu/statuspage/monitor-config.env')

SLACK_WEBHOOK = os.getenv('SLACK_WEBHOOK', '')

if not SLACK_WEBHOOK:
    print("❌ SLACK_WEBHOOK não configurado no monitor-config.env")
    exit(1)
```

---

## ✅ Verificação Final

### Teste 1: Configuração
```bash
python3 validate-monitor-config.py
```

Esperado:
```
✅ ENV: OK
✅ DATABASE: OK
✅ SLACK: OK
✅ BACKEND: OK
```

### Teste 2: Slack
```bash
python3 test-slack.py
```

Esperado: Mensagem no Slack

### Teste 3: Monitor
```bash
python3 monitor.py
```

Esperado: Logs de verificação dos serviços

### Teste 4: Criar serviço com URL inválida

1. Acesse o backoffice: http://SEU_IP:3001
2. Crie um serviço:
   - Name: Test Alert
   - URL: https://invalid-url-12345.com
   - Heartbeat: 60s
3. Aguarde 1-2 minutos
4. Verifique:
   - ✅ Alerta no Slack
   - ✅ Status "outage" no painel
   - ✅ Incident criado

---

## 🐛 Troubleshooting

### Erro: "No module named 'dotenv'"
```bash
pip3 install python-dotenv
```

### Erro: "Slack webhook not configured"
Verifique o arquivo `monitor-config.env`:
```bash
cat monitor-config.env | grep SLACK_WEBHOOK
```

### Erro: "Connection refused" ao banco
Verifique as credenciais:
```bash
psql -h 127.0.0.1 -U seu_usuario -d statuspage
```

### Alertas não aparecem
1. Teste o webhook diretamente:
```bash
curl -X POST "$(grep SLACK_WEBHOOK monitor-config.env | cut -d'=' -f2)" \
  -H 'Content-Type: application/json' \
  -d '{"text":"🧪 Test"}'
```

2. Verifique logs:
```bash
tail -f monitor.log
```

3. Execute manualmente:
```bash
python3 monitor.py
```

---

## 📋 Checklist

- [ ] `pip3 install python-dotenv` executado
- [ ] `monitor-config.env` criado com credenciais corretas
- [ ] `chmod 600 monitor-config.env` aplicado
- [ ] Scripts Python atualizados
- [ ] `validate-monitor-config.py` passou (tudo ✅)
- [ ] `test-slack.py` enviou mensagem
- [ ] `monitor.py` executou sem erros
- [ ] Teste com serviço inválido funcionou
- [ ] Alerta apareceu no Slack

---

## 📚 Arquivos Modificados

✅ `monitor.py` - Agora usa .env
✅ `auto-monitor-services.py` - Agora usa .env
✅ `monitor-services.py` - Agora usa .env
✅ `auto-update-maintenances.py` - Agora usa .env
✅ `test-slack.py` - Agora usa .env
🆕 `monitor-config.env` - Configurações centralizadas
🆕 `validate-monitor-config.py` - Script de validação
🆕 `fix-slack-alerts.sh` - Script de instalação automática

---

## 🎯 Próximos Passos

Após tudo funcionando:

1. **Configurar cron** (se ainda não estiver):
```bash
crontab -e
```

Adicione:
```
*/1 * * * * cd /home/ubuntu/statuspage && python3 monitor.py >> monitor.log 2>&1
*/5 * * * * cd /home/ubuntu/statuspage && python3 auto-update-maintenances.py >> maintenance.log 2>&1
```

2. **Backup do arquivo de configuração**:
```bash
cp monitor-config.env monitor-config.env.backup
```

3. **Adicionar ao .gitignore** (se usar git):
```bash
echo "monitor-config.env" >> .gitignore
```

---

## 💡 Dica

Para facilitar, você pode usar o script automático:
```bash
./fix-slack-alerts.sh
```

Ele faz os passos 1-3 automaticamente!

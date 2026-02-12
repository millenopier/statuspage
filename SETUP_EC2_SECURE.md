# 🔐 Configuração Segura - Apenas na EC2

## ⚠️ IMPORTANTE
- O arquivo `monitor-config.env` com suas credenciais reais **NÃO** está no GitHub
- Você precisa criar manualmente na EC2 com suas senhas reais
- O arquivo `monitor-config.env.example` é apenas um modelo

---

## 🚀 Setup na EC2 (3 passos)

### 1. Instalar dependência
```bash
pip3 install python-dotenv
```

### 2. Criar arquivo de configuração
```bash
cd /home/ubuntu/statuspage
nano monitor-config.env
```

Cole e **substitua com suas credenciais reais**:
```env
SLACK_WEBHOOK=https://hooks.slack.com/services/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
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=seu_usuario_real
DB_PASSWORD=sua_senha_real_do_banco
DB_NAME=statuspage
BACKEND_URL=http://localhost:8080/api/monitors/report
```

Salve: `Ctrl+O` → `Enter` → `Ctrl+X`

### 3. Proteger o arquivo
```bash
chmod 600 monitor-config.env
```

---

## ✅ Testar

```bash
# Validar configuração
python3 validate-monitor-config.py

# Testar Slack
python3 test-slack.py

# Testar monitor
python3 monitor.py
```

---

## 📋 Checklist

- [ ] `pip3 install python-dotenv` executado
- [ ] `monitor-config.env` criado na EC2 com credenciais reais
- [ ] `chmod 600 monitor-config.env` aplicado
- [ ] Testes passaram (validate, test-slack, monitor)
- [ ] Alerta apareceu no Slack

---

## 🔒 Segurança

✅ `monitor-config.env` está no `.gitignore`
✅ Credenciais reais ficam apenas na EC2
✅ GitHub tem apenas `monitor-config.env.example` (sem credenciais)
✅ Arquivo protegido com `chmod 600`

---

## 💡 Dica

Se precisar atualizar as credenciais:
```bash
nano monitor-config.env
```

Não precisa reiniciar nada, os scripts leem o arquivo a cada execução.

# ✅ PROBLEMA RESOLVIDO: Alertas do Slack

## 🔍 Problema Identificado

Após mudar as senhas do banco e admin, os alertas do Slack pararam porque:

1. **Credenciais hardcoded** nos scripts Python
2. **SLACK_WEBHOOK hardcoded** no código
3. Scripts não validavam se webhook estava configurado

## 🛠️ Solução Implementada

### Arquivos Modificados
✅ `monitor.py` - Agora lê configurações de arquivo .env
✅ `auto-monitor-services.py` - Agora lê configurações de arquivo .env
✅ `monitor-services.py` - Agora lê configurações de arquivo .env
✅ `auto-update-maintenances.py` - Agora lê configurações de arquivo .env
✅ `test-slack.py` - Agora lê configurações de arquivo .env
✅ `.gitignore` - Adicionado `monitor-config.env` para não expor credenciais

### Arquivos Criados
🆕 `monitor-config.env.example` - Template de configuração (sem credenciais)
🆕 `validate-monitor-config.py` - Script de validação
🆕 `fix-slack-alerts.sh` - Script de instalação automática
🆕 `SETUP_EC2_SECURE.md` - Guia de configuração segura
🆕 `FIX_SLACK_ALERTS.md` - Documentação completa
🆕 `QUICK_FIX_EC2.md` - Guia rápido

## 🔐 Segurança

- ✅ Credenciais reais ficam **apenas na EC2**
- ✅ `monitor-config.env` está no `.gitignore`
- ✅ GitHub tem apenas o `.example` (sem credenciais)
- ✅ Arquivo protegido com `chmod 600`

## 🚀 Como Aplicar na EC2

### Opção 1: Script Automático (Recomendado)
```bash
cd /home/ubuntu/statuspage
./fix-slack-alerts.sh
nano monitor-config.env  # Adicionar credenciais reais
python3 validate-monitor-config.py
```

### Opção 2: Manual (3 passos)
```bash
# 1. Instalar dependência
pip3 install python-dotenv

# 2. Criar configuração
cp monitor-config.env.example monitor-config.env
nano monitor-config.env  # Adicionar credenciais reais
chmod 600 monitor-config.env

# 3. Validar
python3 validate-monitor-config.py
```

## 📋 Checklist de Deploy

- [ ] Fazer commit e push das mudanças
- [ ] Na EC2: `git pull`
- [ ] Na EC2: `pip3 install python-dotenv`
- [ ] Na EC2: Criar `monitor-config.env` com credenciais reais
- [ ] Na EC2: `chmod 600 monitor-config.env`
- [ ] Na EC2: `python3 validate-monitor-config.py` (deve passar)
- [ ] Na EC2: `python3 test-slack.py` (deve enviar mensagem)
- [ ] Na EC2: Criar serviço de teste com URL inválida
- [ ] Verificar alerta no Slack

## 🎯 Resultado Esperado

Após configurar:
1. ✅ Alertas do Slack funcionando
2. ✅ Incidents criados automaticamente
3. ✅ Status atualizado no painel
4. ✅ Credenciais seguras (não expostas no GitHub)

## 📚 Documentação

- `SETUP_EC2_SECURE.md` - Guia de configuração segura (LEIA ESTE)
- `FIX_SLACK_ALERTS.md` - Documentação completa
- `QUICK_FIX_EC2.md` - Guia rápido de 5 minutos

## 💡 Próximos Passos

Após tudo funcionando:
1. Configurar cron (se ainda não estiver)
2. Fazer backup do `monitor-config.env`
3. Testar com serviço real

## 🐛 Troubleshooting

Se algo não funcionar:
```bash
# Validar configuração
python3 validate-monitor-config.py

# Ver logs
tail -f monitor.log

# Testar manualmente
python3 monitor.py
```

---

**Leia:** `SETUP_EC2_SECURE.md` para instruções detalhadas

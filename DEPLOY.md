# Deploy na EC2

## Problema Identificado

Os frontends estavam com `API_URL` hardcoded para `http://localhost:8080/api`, impedindo a comunicação com o backend na EC2.

## Solução Implementada

1. **Variáveis de ambiente** criadas:
   - `frontend/public-page/.env.production`
   - `frontend/backoffice/.env.production`
   - Ambos apontam para `/api` (URL relativa)

2. **API atualizada** para usar `import.meta.env.VITE_API_URL`

3. **Script de deploy** criado: `deploy-ec2.sh`

## Como Fazer Deploy

### 1. Commit e Push das Alterações

```bash
git add .
git commit -m "fix: configure API URL for production"
git push origin main
```

### 2. Na EC2, Execute o Deploy

```bash
ssh ec2-user@ec2.pierstatuspage.internal.piercloud.io
cd /opt/statuspage
sudo bash deploy-ec2.sh
```

O script irá:
- ✅ Fazer pull do código atualizado
- ✅ Rebuild do backend
- ✅ Rebuild dos frontends (com `.env.production`)
- ✅ Restart dos serviços

### 3. Testar

- **Página Pública**: http://ec2.pierstatuspage.internal.piercloud.io/
- **Backoffice**: http://ec2.pierstatuspage.internal.piercloud.io/admin/

Agora as alterações no backoffice devem aparecer na página principal! 🎉

## Fluxo de Deploy Futuro

Sempre que alterar o código:

```bash
# Local
git add .
git commit -m "sua mensagem"
git push

# EC2
ssh ec2-user@ec2.pierstatuspage.internal.piercloud.io
cd /opt/statuspage
sudo bash deploy-ec2.sh
```

## Verificar Logs

```bash
# Backend
sudo journalctl -u statuspage-backend -f

# Nginx
sudo tail -f /var/log/nginx/error.log
```

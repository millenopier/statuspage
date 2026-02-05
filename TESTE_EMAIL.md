# Guia de Teste - AWS SES Email

## 1. Configurar Credenciais

Edite o arquivo `backend/.env` e adicione suas credenciais:

```env
# AWS SES SMTP
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USERNAME=seu-smtp-username-aqui
SMTP_PASSWORD=sua-smtp-password-aqui
SES_FROM_EMAIL=noreply@piercloud.com
```

## 2. Testar Credenciais SMTP

Execute o script de teste:

```bash
cd backend
go run test_email.go
```

Digite um email de destino quando solicitado.

### Possíveis Erros:

**❌ Erro de autenticação**
- Verifique se `SMTP_USERNAME` e `SMTP_PASSWORD` estão corretos

**❌ Erro no remetente**
- O email em `SES_FROM_EMAIL` precisa estar verificado no AWS SES
- Vá em AWS SES → Verified identities → Create identity

**❌ Erro no destinatário (Sandbox Mode)**
- Se sua conta AWS SES está em Sandbox Mode, o email de destino também precisa estar verificado
- Adicione o email em Verified identities
- OU solicite saída do Sandbox Mode

## 3. Testar no Sistema

### 3.1. Adicionar Subscriber

```bash
curl -X POST http://localhost:8080/api/public/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"seu-email@gmail.com"}'
```

### 3.2. Criar Manutenção

1. Acesse o backoffice: http://localhost:3001
2. Faça login (admin@piercloud.io / admin123)
3. Vá em **Maintenances** → **New Maintenance**
4. Preencha:
   - Title: "Teste de Email"
   - Description: "Testando envio de emails"
   - Status: "scheduled"
   - Start: Data futura
   - End: Data futura
5. Clique em **Create**

### 3.3. Verificar Email

- Verifique sua caixa de entrada
- Verifique a pasta de spam
- O email deve ter o assunto: "Scheduled Maintenance: Teste de Email"

## 4. Verificar Logs

No terminal onde o backend está rodando, você verá se houve algum erro no envio.

## 5. Sair do Sandbox Mode (Produção)

Para enviar emails para qualquer endereço:

1. Acesse AWS SES Console
2. Vá em **Account dashboard**
3. Clique em **Request production access**
4. Preencha:
   - Mail type: **Transactional**
   - Website URL: Seu domínio
   - Use case: "Status page maintenance notifications for subscribers"
   - Compliance: Confirme que tem opt-in dos usuários
5. Aguarde aprovação (geralmente 24h)

## 6. Troubleshooting

### Email não chega

1. Verifique se o email está verificado no SES
2. Verifique se está em Sandbox Mode
3. Verifique a pasta de spam
4. Verifique os logs do backend
5. Execute o script de teste (`test_email.go`)

### Erro "MessageRejected"

- O email de destino não está verificado (Sandbox Mode)
- OU o email de origem não está verificado

### Erro "Daily sending quota exceeded"

- Você atingiu o limite diário do Sandbox Mode (200 emails/dia)
- Solicite saída do Sandbox Mode

## 7. Limites AWS SES

### Sandbox Mode
- 200 emails por dia
- 1 email por segundo
- Só pode enviar para emails verificados

### Production Mode
- 50.000 emails por dia (inicial)
- 14 emails por segundo
- Pode enviar para qualquer email

## 8. Custos

- Primeiros 62.000 emails/mês: **GRÁTIS** (se usar EC2)
- Após isso: $0.10 por 1.000 emails
- Muito barato para status pages!

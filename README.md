# PierCloud Status Page

Sistema completo de status page com backend em Go e frontend em React.

## Estrutura do Projeto

```
statuspage-new/
├── backend/          # Go 1.25 API
├── frontend/
│   ├── public-page/  # React 19.2 - Status Page Pública
│   └── backoffice/   # React 19.2 - Backoffice Administrativo
└── database/         # PostgreSQL 18 Schema
```

## Tecnologias

- **Backend**: Go 1.25
- **Frontend**: React 19.2
- **Database**: PostgreSQL 18
- **Auth**: JWT

## Setup Rápido

### Opção 1: Docker Compose (Recomendado)

```bash
# Subir todos os serviços
docker-compose up -d

# Backend: http://localhost:8080
# PostgreSQL: localhost:5432
```

### Opção 2: Docker PostgreSQL + Manual

```bash
# 1. PostgreSQL com Docker
make db-build
make db-start

# Ou manualmente:
docker build -f Dockerfile.postgres -t statuspage-postgres .
docker run -d --name statuspage-postgres -p 5432:5432 statuspage-postgres

# 2. Backend
cd backend
cp .env.example .env
go mod download
go run main.go

# 3. Frontend - Status Page
cd frontend/public-page
npm install
npm run dev

# 4. Frontend - Backoffice
cd frontend/backoffice
npm install
npm run dev
```

### Opção 3: PostgreSQL Local

```bash
# 1. Criar banco de dados
createdb statuspage

# 2. Executar schema
psql -d statuspage -f backend/database/schema.sql

# 3. Executar seed (opcional)
psql -d statuspage -f backend/database/seed.sql

# 4. Backend
cd backend
cp .env.example .env
go mod download
go run main.go

# 5. Frontend - Status Page
cd frontend/public-page
npm install
npm run dev

# 6. Frontend - Backoffice
cd frontend/backoffice
npm install
npm run dev
```

## URLs

- **Status Page Pública**: http://localhost:3000
- **Backoffice**: http://localhost:3001
- **Backend API**: http://localhost:8080

## Credenciais Padrão

- **Email**: admin@piercloud.io
- **Password**: admin123

## API Endpoints

### Públicos (sem autenticação)
- `GET /api/status-page/heartbeat/app` - Status geral
- `GET /api/public/services` - Lista de serviços
- `GET /api/public/incidents` - Incidentes
- `GET /api/public/maintenances` - Manutenções

### Autenticação
- `POST /api/auth/login` - Login

### Admin (requer JWT)
- **Services**: `POST/PUT/DELETE /api/admin/services`
- **Incidents**: `POST/PUT/DELETE /api/admin/incidents`
- **Incident Updates**: `POST /api/admin/incidents/:id/updates`
- **Maintenances**: `POST/PUT/DELETE /api/admin/maintenances`

## Comandos Make

```bash
make help                    # Ver todos os comandos
make setup                   # Instalar dependências
make db-build                # Build PostgreSQL Docker
make db-start                # Iniciar PostgreSQL
make db-stop                 # Parar PostgreSQL
make backend-run             # Rodar backend
make frontend-public         # Rodar status page
make frontend-backoffice     # Rodar backoffice
make docker-up               # Subir tudo com Docker
make docker-down             # Parar Docker
```

## Build para Produção

### Backend
```bash
cd backend
go build -o statuspage
./statuspage
```

### Frontend
```bash
# Status Page
cd frontend/public-page
npm run build

# Backoffice
cd frontend/backoffice
npm run build
```

## Variáveis de Ambiente

Arquivo: `backend/.env`

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=statuspage
JWT_SECRET=your-secret-key-change-in-production
PORT=8080

# Slack Notifications (opcional)
SLACK_WEBHOOK=

# AWS SES Email Notifications (opcional)
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USERNAME=your-smtp-username
SMTP_PASSWORD=your-smtp-password
SES_FROM_EMAIL=noreply@piercloud.io
```

### Configurar AWS SES para Emails

1. Acesse o [AWS SES Console](https://console.aws.amazon.com/ses/)
2. Vá em **SMTP Settings** → **Create SMTP credentials**
3. Copie as credenciais geradas
4. Adicione no `.env`:
   - `SMTP_USERNAME`: SMTP Username
   - `SMTP_PASSWORD`: SMTP Password
   - `SES_FROM_EMAIL`: Email verificado no SES
5. Verifique um email em **Verified identities**
6. (Produção) Solicite saída do Sandbox Mode

## Docker

### PostgreSQL
```bash
# Build
docker build -f Dockerfile.postgres -t statuspage-postgres .

# Run
docker run -d --name statuspage-postgres -p 5432:5432 statuspage-postgres

# Stop
docker stop statuspage-postgres
docker rm statuspage-postgres
```

### Backend
```bash
cd backend
docker build -t statuspage-backend .
docker run -p 8080:8080 statuspage-backend
```

### Docker Compose
```bash
# Iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down

# Parar e remover volumes
docker-compose down -v
```

## Estrutura de Dados

### Services
- `id`, `name`, `description`, `status`, `position`
- Status: `operational`, `degraded`, `outage`, `maintenance`

### Incidents
- `id`, `title`, `description`, `severity`, `status`, `service_id`
- Severity: `info`, `minor`, `major`, `critical`
- Status: `investigating`, `identified`, `monitoring`, `resolved`

### Maintenances
- `id`, `title`, `description`, `status`, `scheduled_start`, `scheduled_end`
- Status: `scheduled`, `in_progress`, `completed`

## Desenvolvimento

### Backend (Go 1.25)
- Framework: net/http + gorilla/mux
- Database: lib/pq (PostgreSQL driver)
- Auth: golang-jwt/jwt
- CORS: rs/cors

### Frontend (React 19.2)
- Build: Vite
- Router: react-router-dom
- State: Zustand
- HTTP: Axios
- Styling: Tailwind CSS

## Licença

© 2024 PierCloud. All rights reserved.

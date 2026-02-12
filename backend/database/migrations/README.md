# Incident Tracking em Services

## Novos Campos

A tabela `services` agora possui dois novos campos para rastreamento de incidents:

- **incident** (TEXT): Descrição do incident relacionado ao service
- **incident_published** (BOOLEAN): Define se o incident deve ser publicado no histórico de recent incidents

## Funcionalidade

### Ao Criar/Atualizar um Service

Quando você cria ou atualiza um service com os campos `incident` e `incident_published`:

1. **incident_published = false**: O incident é registrado apenas no campo do service, não aparece no histórico público
2. **incident_published = true**: Além de registrar no service, cria automaticamente um registro na tabela `incidents` que aparecerá no histórico de "Recent Incidents"

### Exemplo de Uso

#### Criar Service com Incident (não publicado)
```json
POST /api/admin/services
{
  "name": "API Gateway",
  "description": "Main API Gateway",
  "status": "degraded",
  "position": 1,
  "incident": "Experiencing high latency due to increased traffic",
  "incident_published": false
}
```

#### Criar Service com Incident (publicado no histórico)
```json
POST /api/admin/services
{
  "name": "Database",
  "description": "PostgreSQL Database",
  "status": "outage",
  "position": 2,
  "incident": "Database connection issues affecting all services",
  "incident_published": true
}
```

Neste caso, será criado automaticamente um incident:
- Title: "Database Incident"
- Description: "Database connection issues affecting all services"
- Severity: "major"
- Status: "investigating"
- Service ID: [ID do service criado]
- Visible: true

## Migração

Para adicionar os novos campos ao banco existente:

```bash
psql -d statuspage -f backend/database/migrations/001_add_incident_fields.sql
```

Ou se estiver usando Docker:

```bash
docker exec -i statuspage-postgres psql -U postgres -d statuspage < backend/database/migrations/001_add_incident_fields.sql
```

## API Response

Os services agora retornam:

```json
{
  "id": 1,
  "name": "API Gateway",
  "description": "Main API Gateway",
  "status": "degraded",
  "position": 1,
  "incident": "Experiencing high latency",
  "incident_published": false,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

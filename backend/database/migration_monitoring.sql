-- Adicionar campos de monitoramento na tabela services
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS url TEXT,
ADD COLUMN IF NOT EXISTS heartbeat_interval INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS request_timeout INTEGER DEFAULT 120,
ADD COLUMN IF NOT EXISTS retries INTEGER DEFAULT 5;

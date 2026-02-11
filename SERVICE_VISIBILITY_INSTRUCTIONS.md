# Adicionar Visibilidade em Services

## 1. Rodar migration no banco (EC2):
```bash
sudo -u postgres psql statuspage -c "ALTER TABLE services ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;"
sudo -u postgres psql statuspage -c "CREATE INDEX IF NOT EXISTS idx_services_visible ON services(is_visible);"
```

## 2. Atualizar backend/handlers/admin.go:

### GetServices (linha ~230):
Mudar de:
```go
rows, err := h.DB.Query("SELECT id, name, description, status, position, url, heartbeat_interval, request_timeout, retries, created_at, updated_at FROM services ORDER BY position")
```
Para:
```go
rows, err := h.DB.Query("SELECT id, name, description, status, position, url, heartbeat_interval, request_timeout, retries, is_visible, created_at, updated_at FROM services ORDER BY position")
```

E no Scan:
```go
if err := rows.Scan(&s.ID, &s.Name, &s.Description, &s.Status, &s.Position, &s.URL, &s.HeartbeatInterval, &s.RequestTimeout, &s.Retries, &s.IsVisible, &s.CreatedAt, &s.UpdatedAt); err != nil {
```

### CreateService (linha ~260):
Mudar INSERT para:
```go
err := h.DB.QueryRow(
    "INSERT INTO services (name, description, status, position, url, heartbeat_interval, request_timeout, retries, is_visible) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, created_at, updated_at",
    s.Name, s.Description, s.Status, s.Position, s.URL, s.HeartbeatInterval, s.RequestTimeout, s.Retries, true,
).Scan(&s.ID, &s.CreatedAt, &s.UpdatedAt)
```

### UpdateService (linha ~320):
Mudar UPDATE para:
```go
_, err := h.DB.Exec(
    "UPDATE services SET name=$1, description=$2, status=$3, position=$4, url=$5, heartbeat_interval=$6, request_timeout=$7, retries=$8, is_visible=$9, updated_at=$10 WHERE id=$11",
    s.Name, s.Description, s.Status, s.Position, s.URL, s.HeartbeatInterval, s.RequestTimeout, s.Retries, s.IsVisible, time.Now(), id,
)
```

### Adicionar novo endpoint (após DeleteService):
```go
// Toggle Service Visibility
func (h *AdminHandler) ToggleServiceVisibility(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	var req struct {
		IsVisible bool `json:"is_visible"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	_, err := h.DB.Exec("UPDATE services SET is_visible = $1, updated_at = $2 WHERE id = $3", req.IsVisible, time.Now(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"id": id, "is_visible": req.IsVisible})
}
```

## 3. Atualizar backend/main.go:
Adicionar rota:
```go
admin.HandleFunc("/services/{id}/visibility", adminHandler.ToggleServiceVisibility).Methods("PATCH")
```

## 4. Atualizar backend/handlers/public.go GetHeartbeat:
Mudar SELECT para filtrar apenas visíveis:
```go
rows, err := h.DB.Query("SELECT id, name, description, status, position, url, heartbeat_interval, request_timeout, retries, created_at, updated_at FROM services WHERE is_visible = true ORDER BY position")
```

E no Scan adicionar is_visible (ou remover do SELECT se não precisar no frontend público).

## 5. Rebuild backend:
```bash
cd /opt/statuspage/backend
go build -o statuspage main.go
sudo systemctl restart statuspage-backend
```

package handlers

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"net/http"
	"statuspage/models"
	"strconv"
	"time"

	"github.com/gorilla/mux"
)

const SLACK_WEBHOOK = "https://hooks.slack.com/services/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"

type AdminHandler struct {
	DB *sql.DB
}

func sendSlackIncidentAlert(incident models.Incident, serviceName string) {
	color := "warning"
	if incident.Severity == "critical" {
		color = "danger"
	} else if incident.Severity == "minor" || incident.Severity == "info" {
		color = "#439FE0"
	}

	payload := map[string]interface{}{
		"attachments": []map[string]interface{}{
			{
				"color": color,
				"title": "🚨 New Incident: " + incident.Title,
				"fields": []map[string]interface{}{
					{"title": "Severity", "value": incident.Severity, "short": true},
					{"title": "Status", "value": incident.Status, "short": true},
					{"title": "Service", "value": serviceName, "short": true},
					{"title": "Description", "value": incident.Description, "short": false},
				},
			},
		},
	}

	jsonData, _ := json.Marshal(payload)
	http.Post(SLACK_WEBHOOK, "application/json", bytes.NewBuffer(jsonData))
}

func sendSlackIncidentUpdate(incidentTitle, updateMessage, status string) {
	color := "good"
	if status == "resolved" {
		color = "good"
	} else if status == "monitoring" {
		color = "warning"
	}

	payload := map[string]interface{}{
		"attachments": []map[string]interface{}{
			{
				"color": color,
				"title": "📝 Incident Update: " + incidentTitle,
				"fields": []map[string]interface{}{
					{"title": "Status", "value": status, "short": true},
					{"title": "Update", "value": updateMessage, "short": false},
				},
			},
		},
	}

	jsonData, _ := json.Marshal(payload)
	http.Post(SLACK_WEBHOOK, "application/json", bytes.NewBuffer(jsonData))
}

func sendSlackMaintenanceAlert(maintenance models.Maintenance, isCompleted bool) {
	color := "#439FE0"
	title := "🔧 Scheduled Maintenance: " + maintenance.Title
	
	if isCompleted {
		color = "good"
		title = "✅ Maintenance Completed: " + maintenance.Title
	} else if maintenance.Status == "in_progress" {
		color = "warning"
		title = "🚧 Maintenance Started: " + maintenance.Title
	}

	// Subtrair 3 horas para São Paulo (UTC-3)
	startSP := maintenance.ScheduledStart.Add(-3 * time.Hour)
	endSP := maintenance.ScheduledEnd.Add(-3 * time.Hour)

	payload := map[string]interface{}{
		"attachments": []map[string]interface{}{
			{
				"color": color,
				"title": title,
				"fields": []map[string]interface{}{
					{"title": "Status", "value": maintenance.Status, "short": true},
					{"title": "Start (SP)", "value": startSP.Format("02/01/2006 15:04"), "short": true},
					{"title": "End (SP)", "value": endSP.Format("02/01/2006 15:04"), "short": true},
					{"title": "Description", "value": maintenance.Description, "short": false},
				},
			},
		},
	}

	jsonData, _ := json.Marshal(payload)
	http.Post(SLACK_WEBHOOK, "application/json", bytes.NewBuffer(jsonData))
}

// Services
func (h *AdminHandler) CreateService(w http.ResponseWriter, r *http.Request) {
	var s models.Service
	if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err := h.DB.QueryRow(
		"INSERT INTO services (name, description, status, position) VALUES ($1, $2, $3, $4) RETURNING id, created_at, updated_at",
		s.Name, s.Description, s.Status, s.Position,
	).Scan(&s.ID, &s.CreatedAt, &s.UpdatedAt)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(s)
}

func (h *AdminHandler) UpdateService(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	var s models.Service
	if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	_, err := h.DB.Exec(
		"UPDATE services SET name=$1, description=$2, status=$3, position=$4, updated_at=$5 WHERE id=$6",
		s.Name, s.Description, s.Status, s.Position, time.Now(), id,
	)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	s.ID = id
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(s)
}

func (h *AdminHandler) DeleteService(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	_, err := h.DB.Exec("DELETE FROM services WHERE id=$1", id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// Incidents
func (h *AdminHandler) CreateIncident(w http.ResponseWriter, r *http.Request) {
	var i models.Incident
	if err := json.NewDecoder(r.Body).Decode(&i); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err := h.DB.QueryRow(
		"INSERT INTO incidents (title, description, severity, status, service_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at, updated_at",
		i.Title, i.Description, i.Severity, i.Status, i.ServiceID,
	).Scan(&i.ID, &i.CreatedAt, &i.UpdatedAt)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Buscar nome do serviço
	var serviceName string
	if i.ServiceID != nil {
		h.DB.QueryRow("SELECT name FROM services WHERE id = $1", *i.ServiceID).Scan(&serviceName)
	} else {
		serviceName = "All Services"
	}

	// Enviar alerta ao Slack
	sendSlackIncidentAlert(i, serviceName)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(i)
}

func (h *AdminHandler) UpdateIncident(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	var i models.Incident
	if err := json.NewDecoder(r.Body).Decode(&i); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Buscar status anterior
	var oldStatus string
	h.DB.QueryRow("SELECT status FROM incidents WHERE id = $1", id).Scan(&oldStatus)

	_, err := h.DB.Exec(
		"UPDATE incidents SET title=$1, description=$2, severity=$3, status=$4, service_id=$5, updated_at=$6 WHERE id=$7",
		i.Title, i.Description, i.Severity, i.Status, i.ServiceID, time.Now(), id,
	)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Se o status mudou, enviar notificação
	if oldStatus != i.Status {
		sendSlackIncidentUpdate(i.Title, "Status changed from "+oldStatus+" to "+i.Status, i.Status)
	}

	i.ID = id
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(i)
}

func (h *AdminHandler) DeleteIncident(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	_, err := h.DB.Exec("DELETE FROM incidents WHERE id=$1", id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *AdminHandler) AddIncidentUpdate(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	incidentID, _ := strconv.Atoi(vars["id"])

	var u models.IncidentUpdate
	if err := json.NewDecoder(r.Body).Decode(&u); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err := h.DB.QueryRow(
		"INSERT INTO incident_updates (incident_id, message, status) VALUES ($1, $2, $3) RETURNING id, created_at",
		incidentID, u.Message, u.Status,
	).Scan(&u.ID, &u.CreatedAt)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Buscar título do incidente
	var incidentTitle string
	h.DB.QueryRow("SELECT title FROM incidents WHERE id = $1", incidentID).Scan(&incidentTitle)

	// Enviar update ao Slack
	sendSlackIncidentUpdate(incidentTitle, u.Message, u.Status)

	u.IncidentID = incidentID
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(u)
}

// Maintenances
func (h *AdminHandler) CreateMaintenance(w http.ResponseWriter, r *http.Request) {
	var m models.Maintenance
	if err := json.NewDecoder(r.Body).Decode(&m); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err := h.DB.QueryRow(
		"INSERT INTO maintenances (title, description, status, scheduled_start, scheduled_end) VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at, updated_at",
		m.Title, m.Description, m.Status, m.ScheduledStart, m.ScheduledEnd,
	).Scan(&m.ID, &m.CreatedAt, &m.UpdatedAt)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Enviar alerta ao Slack
	sendSlackMaintenanceAlert(m, false)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(m)
}

func (h *AdminHandler) UpdateMaintenance(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	var m models.Maintenance
	if err := json.NewDecoder(r.Body).Decode(&m); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Buscar status anterior
	var oldStatus string
	h.DB.QueryRow("SELECT status FROM maintenances WHERE id = $1", id).Scan(&oldStatus)

	_, err := h.DB.Exec(
		"UPDATE maintenances SET title=$1, description=$2, status=$3, scheduled_start=$4, scheduled_end=$5, updated_at=$6 WHERE id=$7",
		m.Title, m.Description, m.Status, m.ScheduledStart, m.ScheduledEnd, time.Now(), id,
	)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Se mudou para completed, enviar notificação
	if oldStatus != "completed" && m.Status == "completed" {
		sendSlackMaintenanceAlert(m, true)
	} else if oldStatus == "scheduled" && m.Status == "in_progress" {
		// Notificar quando começa
		sendSlackMaintenanceAlert(m, false)
	}

	m.ID = id
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(m)
}

func (h *AdminHandler) DeleteMaintenance(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	_, err := h.DB.Exec("DELETE FROM maintenances WHERE id=$1", id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

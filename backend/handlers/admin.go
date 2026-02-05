package handlers

import (
	"bytes"
	"crypto/tls"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"net/smtp"
	"os"
	"statuspage/models"
	"strconv"
	"time"

	"github.com/gorilla/mux"
)

func sendMaintenanceEmails(db *sql.DB, maintenance models.Maintenance) {
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")
	smtpUser := os.Getenv("SMTP_USERNAME")
	smtpPass := os.Getenv("SMTP_PASSWORD")
	fromEmail := os.Getenv("SES_FROM_EMAIL")
	
	if smtpHost == "" || smtpUser == "" || smtpPass == "" || fromEmail == "" {
		return
	}

	rows, err := db.Query("SELECT email FROM subscribers WHERE is_active = true")
	if err != nil {
		return
	}
	defer rows.Close()

	startSP := maintenance.ScheduledStart.Add(-3 * time.Hour)
	endSP := maintenance.ScheduledEnd.Add(-3 * time.Hour)

	subject := fmt.Sprintf("Scheduled Maintenance: %s", maintenance.Title)
	htmlBody := fmt.Sprintf(`<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
	<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
		<h2 style="color: #2563eb;">Scheduled Maintenance Notification</h2>
		<div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
			<h3 style="margin-top: 0;">%s</h3>
			<p>%s</p>
			<p><strong>Start (São Paulo):</strong> %s</p>
			<p><strong>End (São Paulo):</strong> %s</p>
		</div>
		<p style="color: #666; font-size: 12px;">
			You are receiving this email because you subscribed to maintenance notifications.
		</p>
	</div>
</body>
</html>`, maintenance.Title, maintenance.Description, startSP.Format("02/01/2006 15:04"), endSP.Format("02/01/2006 15:04"))

	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)
	
	for rows.Next() {
		var email string
		if err := rows.Scan(&email); err != nil {
			continue
		}

		msg := []byte(fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n%s",
			fromEmail, email, subject, htmlBody))

		// Conectar sem TLS primeiro (porta 587 usa STARTTLS)
		conn, err := smtp.Dial(smtpHost + ":" + smtpPort)
		if err != nil {
			continue
		}

		// Iniciar STARTTLS
		tlsConfig := &tls.Config{ServerName: smtpHost}
		if err = conn.StartTLS(tlsConfig); err != nil {
			conn.Close()
			continue
		}

		if err = conn.Auth(auth); err != nil {
			conn.Close()
			continue
		}

		if err = conn.Mail(fromEmail); err != nil {
			conn.Close()
			continue
		}

		if err = conn.Rcpt(email); err != nil {
			conn.Close()
			continue
		}

		w, err := conn.Data()
		if err != nil {
			conn.Close()
			continue
		}

		_, err = w.Write(msg)
		if err != nil {
			w.Close()
			conn.Close()
			continue
		}

		w.Close()
		conn.Quit()
	}
}

var SLACK_WEBHOOK = os.Getenv("SLACK_WEBHOOK")

type AdminHandler struct {
	DB *sql.DB
}

func sendSlackIncidentAlert(incident models.Incident, serviceName string) {
	if SLACK_WEBHOOK == "" {
		return
	}
	
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
	if SLACK_WEBHOOK == "" {
		return
	}
	
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
	if SLACK_WEBHOOK == "" {
		return
	}
	
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

	// Valores padrão
	if s.HeartbeatInterval == 0 {
		s.HeartbeatInterval = 60
	}
	if s.RequestTimeout == 0 {
		s.RequestTimeout = 120
	}
	if s.Retries == 0 {
		s.Retries = 5
	}

	err := h.DB.QueryRow(
		"INSERT INTO services (name, description, status, position, url, heartbeat_interval, request_timeout, retries) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, created_at, updated_at",
		s.Name, s.Description, s.Status, s.Position, s.URL, s.HeartbeatInterval, s.RequestTimeout, s.Retries,
	).Scan(&s.ID, &s.CreatedAt, &s.UpdatedAt)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(s)
}

func sendSlackServiceStatusChange(serviceName, oldStatus, newStatus string) {
	if SLACK_WEBHOOK == "" {
		return
	}

	color := "good"
	title := "✅ Service Restored: " + serviceName
	emoji := "✅"

	if newStatus == "operational" && oldStatus != "operational" {
		color = "good"
		title = "✅ Service Restored: " + serviceName
		emoji = "✅"
	} else if newStatus == "degraded" {
		color = "warning"
		title = "⚠️ Service Degraded: " + serviceName
		emoji = "⚠️"
	} else if newStatus == "outage" {
		color = "danger"
		title = "🔴 Service Outage: " + serviceName
		emoji = "🔴"
	} else if newStatus == "maintenance" {
		color = "#439FE0"
		title = "🔧 Service Under Maintenance: " + serviceName
		emoji = "🔧"
	}

	payload := map[string]interface{}{
		"attachments": []map[string]interface{}{
			{
				"color": color,
				"title": title,
				"fields": []map[string]interface{}{
					{"title": "Previous Status", "value": oldStatus, "short": true},
					{"title": "Current Status", "value": newStatus, "short": true},
					{"title": "Service", "value": serviceName, "short": true},
					{"title": "Time", "value": time.Now().Add(-3 * time.Hour).Format("02/01/2006 15:04"), "short": true},
				},
			},
		},
	}

	jsonData, _ := json.Marshal(payload)
	http.Post(SLACK_WEBHOOK, "application/json", bytes.NewBuffer(jsonData))
}

func (h *AdminHandler) UpdateService(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	var s models.Service
	if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Buscar status anterior
	var oldStatus, oldName string
	h.DB.QueryRow("SELECT status, name FROM services WHERE id = $1", id).Scan(&oldStatus, &oldName)

	_, err := h.DB.Exec(
		"UPDATE services SET name=$1, description=$2, status=$3, position=$4, url=$5, heartbeat_interval=$6, request_timeout=$7, retries=$8, updated_at=$9 WHERE id=$10",
		s.Name, s.Description, s.Status, s.Position, s.URL, s.HeartbeatInterval, s.RequestTimeout, s.Retries, time.Now(), id,
	)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Se o status mudou, enviar notificação ao Slack
	if oldStatus != s.Status {
		sendSlackServiceStatusChange(s.Name, oldStatus, s.Status)
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

	// Enviar emails para subscribers
	go sendMaintenanceEmails(h.DB, m)

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

// Subscribers
func (h *AdminHandler) GetSubscribers(w http.ResponseWriter, r *http.Request) {
	rows, err := h.DB.Query("SELECT id, email, is_active, created_at FROM subscribers ORDER BY created_at DESC")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var subscribers []models.Subscriber
	for rows.Next() {
		var s models.Subscriber
		if err := rows.Scan(&s.ID, &s.Email, &s.IsActive, &s.CreatedAt); err != nil {
			continue
		}
		subscribers = append(subscribers, s)
	}

	if subscribers == nil {
		subscribers = []models.Subscriber{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(subscribers)
}

func (h *AdminHandler) DeleteSubscriber(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	_, err := h.DB.Exec("DELETE FROM subscribers WHERE id=$1", id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

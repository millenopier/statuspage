package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"statuspage/models"
	"time"
)

type PublicHandler struct {
	DB *sql.DB
}

func (h *PublicHandler) GetHeartbeat(w http.ResponseWriter, r *http.Request) {
	var status string
	var services []models.Service

	rows, err := h.DB.Query("SELECT id, name, description, status, position FROM services ORDER BY position")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	allOperational := true
	for rows.Next() {
		var s models.Service
		if err := rows.Scan(&s.ID, &s.Name, &s.Description, &s.Status, &s.Position); err != nil {
			continue
		}
		services = append(services, s)
		if s.Status != "operational" {
			allOperational = false
		}
	}

	if allOperational {
		status = "operational"
	} else {
		status = "degraded"
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(models.StatusResponse{
		Status:   status,
		Services: services,
	})
}

func (h *PublicHandler) GetServices(w http.ResponseWriter, r *http.Request) {
	rows, err := h.DB.Query("SELECT id, name, description, status, position, created_at, updated_at FROM services ORDER BY position")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var services []models.Service
	for rows.Next() {
		var s models.Service
		if err := rows.Scan(&s.ID, &s.Name, &s.Description, &s.Status, &s.Position, &s.CreatedAt, &s.UpdatedAt); err != nil {
			continue
		}
		services = append(services, s)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(services)
}

func (h *PublicHandler) GetIncidents(w http.ResponseWriter, r *http.Request) {
	rows, err := h.DB.Query(`
		SELECT id, title, description, severity, status, service_id, created_at, updated_at, resolved_at 
		FROM incidents 
		ORDER BY created_at DESC
		LIMIT 10
	`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var incidents []models.Incident
	for rows.Next() {
		var i models.Incident
		if err := rows.Scan(&i.ID, &i.Title, &i.Description, &i.Severity, &i.Status, &i.ServiceID, &i.CreatedAt, &i.UpdatedAt, &i.ResolvedAt); err != nil {
			continue
		}

		updateRows, _ := h.DB.Query("SELECT id, incident_id, message, status, created_at FROM incident_updates WHERE incident_id = $1 ORDER BY created_at DESC", i.ID)
		for updateRows.Next() {
			var u models.IncidentUpdate
			if err := updateRows.Scan(&u.ID, &u.IncidentID, &u.Message, &u.Status, &u.CreatedAt); err == nil {
				i.Updates = append(i.Updates, u)
			}
		}
		updateRows.Close()

		incidents = append(incidents, i)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(incidents)
}

func (h *PublicHandler) GetMaintenances(w http.ResponseWriter, r *http.Request) {
	rows, err := h.DB.Query(`
		SELECT id, title, description, status, scheduled_start, scheduled_end, actual_start, actual_end, created_at, updated_at 
		FROM maintenances 
		ORDER BY created_at DESC
		LIMIT 10
	`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var maintenances []models.Maintenance
	for rows.Next() {
		var m models.Maintenance
		if err := rows.Scan(&m.ID, &m.Title, &m.Description, &m.Status, &m.ScheduledStart, &m.ScheduledEnd, &m.ActualStart, &m.ActualEnd, &m.CreatedAt, &m.UpdatedAt); err != nil {
			continue
		}
		maintenances = append(maintenances, m)
	}

	if maintenances == nil {
		maintenances = []models.Maintenance{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(maintenances)
}

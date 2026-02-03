package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"statuspage/models"
	"time"
)

type MonitorHandler struct {
	DB *sql.DB
}

func (h *MonitorHandler) ReportMonitorCheck(w http.ResponseWriter, r *http.Request) {
	var req models.MonitorCheckRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Determinar status baseado no status code
	var status string
	if req.Error != "" {
		status = "outage"
	} else if (req.StatusCode >= 200 && req.StatusCode <= 299) || (req.StatusCode >= 400 && req.StatusCode <= 499) {
		status = "operational"
	} else {
		status = "degraded"
	}

	// Verificar se monitor existe
	var monitorID int
	var serviceID *int
	err := h.DB.QueryRow("SELECT id, service_id FROM monitors WHERE url = $1", req.URL).Scan(&monitorID, &serviceID)

	if err == sql.ErrNoRows {
		// Criar novo monitor e service
		var newServiceID int
		err = h.DB.QueryRow(
			"INSERT INTO services (name, description, status, position) VALUES ($1, $2, $3, (SELECT COALESCE(MAX(position), 0) + 1 FROM services)) RETURNING id",
			req.Name, req.URL, status,
		).Scan(&newServiceID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		serviceID = &newServiceID

		// Criar monitor
		var lastError *string
		if req.Error != "" {
			lastError = &req.Error
		}

		err = h.DB.QueryRow(
			"INSERT INTO monitors (name, url, service_id, status, last_status_code, last_check, last_error) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
			req.Name, req.URL, serviceID, status, req.StatusCode, time.Now(), lastError,
		).Scan(&monitorID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	} else if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	} else {
		// Atualizar monitor existente
		var lastError *string
		if req.Error != "" {
			lastError = &req.Error
		}

		_, err = h.DB.Exec(
			"UPDATE monitors SET status=$1, last_status_code=$2, last_check=$3, last_error=$4, updated_at=$5 WHERE id=$6",
			status, req.StatusCode, time.Now(), lastError, time.Now(), monitorID,
		)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Atualizar status do service
		if serviceID != nil {
			_, err = h.DB.Exec("UPDATE services SET status=$1, updated_at=$2 WHERE id=$3", status, time.Now(), *serviceID)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"monitor_id": monitorID,
		"service_id": serviceID,
		"status":     status,
	})
}

func (h *MonitorHandler) GetMonitors(w http.ResponseWriter, r *http.Request) {
	rows, err := h.DB.Query(`
		SELECT id, name, url, service_id, status, last_status_code, last_check, last_error, created_at, updated_at 
		FROM monitors 
		ORDER BY name
	`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var monitors []models.Monitor
	for rows.Next() {
		var m models.Monitor
		if err := rows.Scan(&m.ID, &m.Name, &m.URL, &m.ServiceID, &m.Status, &m.LastStatusCode, &m.LastCheck, &m.LastError, &m.CreatedAt, &m.UpdatedAt); err != nil {
			continue
		}
		monitors = append(monitors, m)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(monitors)
}

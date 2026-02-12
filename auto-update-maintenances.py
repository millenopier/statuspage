#!/usr/bin/env python3
import psycopg2
import requests
import os
from datetime import datetime, timezone
from dotenv import load_dotenv

# Carregar configurações
load_dotenv('/Users/milleno/Documents/statuspage/monitor-config.env')
load_dotenv('monitor-config.env')  # Fallback para path relativo

DB_CONFIG = {
    'host': os.getenv('DB_HOST', '127.0.0.1'),
    'port': int(os.getenv('DB_PORT', 5432)),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'postgres'),
    'database': os.getenv('DB_NAME', 'statuspage')
}

SLACK_WEBHOOK = os.getenv('SLACK_WEBHOOK', '')

def send_slack_alert(title, status, description, scheduled_start, scheduled_end):
    if not SLACK_WEBHOOK:
        return
    
    color = "#439FE0"
    if status == "completed":
        color = "good"
        title_prefix = "✅ Maintenance Completed: "
    elif status == "in_progress":
        color = "warning"
        title_prefix = "🚧 Maintenance Started: "
    else:
        return
    
    payload = {
        "attachments": [{
            "color": color,
            "title": title_prefix + title,
            "fields": [
                {"title": "Status", "value": status, "short": True},
                {"title": "Start (SP)", "value": scheduled_start, "short": True},
                {"title": "End (SP)", "value": scheduled_end, "short": True},
                {"title": "Description", "value": description, "short": False}
            ]
        }]
    }
    
    try:
        requests.post(SLACK_WEBHOOK, json=payload, timeout=5)
    except:
        pass

def update_maintenances():
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    
    now = datetime.now(timezone.utc)
    
    # Atualizar para in_progress
    cur.execute("""
        SELECT id, title, description, scheduled_start, scheduled_end 
        FROM maintenances 
        WHERE status = 'scheduled' AND scheduled_start <= %s
    """, (now,))
    
    for row in cur.fetchall():
        maintenance_id, title, description, scheduled_start, scheduled_end = row
        cur.execute("UPDATE maintenances SET status = 'in_progress', actual_start = %s WHERE id = %s", (now, maintenance_id))
        
        # Enviar alerta Slack
        start_sp = (scheduled_start.replace(tzinfo=timezone.utc)).strftime("%d/%m/%Y %H:%M")
        end_sp = (scheduled_end.replace(tzinfo=timezone.utc)).strftime("%d/%m/%Y %H:%M")
        send_slack_alert(title, "in_progress", description, start_sp, end_sp)
        print(f"✅ Maintenance {maintenance_id} started: {title}")
    
    # Atualizar para completed
    cur.execute("""
        SELECT id, title, description, scheduled_start, scheduled_end 
        FROM maintenances 
        WHERE status = 'in_progress' AND scheduled_end <= %s
    """, (now,))
    
    for row in cur.fetchall():
        maintenance_id, title, description, scheduled_start, scheduled_end = row
        cur.execute("UPDATE maintenances SET status = 'completed', actual_end = %s WHERE id = %s", (now, maintenance_id))
        
        # Enviar alerta Slack
        start_sp = (scheduled_start.replace(tzinfo=timezone.utc)).strftime("%d/%m/%Y %H:%M")
        end_sp = (scheduled_end.replace(tzinfo=timezone.utc)).strftime("%d/%m/%Y %H:%M")
        send_slack_alert(title, "completed", description, start_sp, end_sp)
        print(f"✅ Maintenance {maintenance_id} completed: {title}")
    
    conn.commit()
    cur.close()
    conn.close()

if __name__ == "__main__":
    update_maintenances()

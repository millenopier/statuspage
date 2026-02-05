#!/usr/bin/python3
import psycopg2
import requests
import os
from datetime import datetime

DB_CONFIG = {
    'host': '127.0.0.1',
    'port': 5432,
    'user': 'postgres',
    'password': 'postgres',
    'database': 'statuspage'
}

SLACK_WEBHOOK = os.getenv('SLACK_WEBHOOK', '')

def send_slack_alert(service_name, old_status, new_status):
    if not SLACK_WEBHOOK:
        return
    
    color = "danger" if new_status == "outage" else "warning"
    
    payload = {
        "attachments": [{
            "color": color,
            "title": f"🚨 Service Status Changed: {service_name}",
            "fields": [
                {"title": "Service", "value": service_name, "short": True},
                {"title": "Old Status", "value": old_status, "short": True},
                {"title": "New Status", "value": new_status, "short": True}
            ]
        }]
    }
    
    try:
        requests.post(SLACK_WEBHOOK, json=payload, timeout=5)
    except:
        pass

def check_service(service_id, name, url, timeout):
    try:
        response = requests.get(url, timeout=timeout, allow_redirects=True)
        if response.status_code >= 500:
            return 'outage'
        else:
            return 'operational'
    except requests.exceptions.Timeout:
        return 'degraded'
    except:
        return 'outage'

def monitor_services():
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    
    # Buscar services com URL
    cur.execute("""
        SELECT id, name, url, status, request_timeout 
        FROM services 
        WHERE url IS NOT NULL AND url != ''
    """)
    
    for row in cur.fetchall():
        service_id, name, url, current_status, timeout = row
        timeout = timeout if timeout else 10
        
        # Verificar status
        new_status = check_service(service_id, name, url, timeout)
        
        # Se mudou, atualizar
        if new_status != current_status:
            cur.execute(
                "UPDATE services SET status = %s WHERE id = %s",
                (new_status, service_id)
            )
            conn.commit()
            
            # Enviar alerta Slack
            send_slack_alert(name, current_status, new_status)
            print(f"✅ Service {name}: {current_status} → {new_status}")
    
    cur.close()
    conn.close()

if __name__ == "__main__":
    monitor_services()

#!/usr/bin/env python3
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

def send_slack_alert(service_name, old_status, new_status, error_msg=''):
    if not SLACK_WEBHOOK:
        return
    
    color = "danger" if new_status == "outage" else "warning"
    
    payload = {
        "attachments": [{
            "color": color,
            "title": f"🚨 Service Status Changed: {service_name}",
            "fields": [
                {"title": "Service", "value": service_name, "short": True},
                {"title": "Status", "value": f"{old_status} → {new_status}", "short": True},
                {"title": "Error", "value": error_msg or "N/A", "short": False}
            ]
        }]
    }
    
    try:
        requests.post(SLACK_WEBHOOK, json=payload, timeout=5)
    except:
        pass

def check_service(service_id, name, url, timeout, retries, current_status):
    if not url:
        return current_status, None
    
    for attempt in range(retries):
        try:
            response = requests.get(url, timeout=timeout, allow_redirects=True)
            
            if response.status_code >= 500:
                if attempt == retries - 1:
                    return 'outage', f"HTTP {response.status_code}"
            else:
                return 'operational', None
                
        except requests.exceptions.Timeout:
            if attempt == retries - 1:
                return 'outage', 'Timeout'
        except requests.exceptions.ConnectionError:
            if attempt == retries - 1:
                return 'outage', 'Connection Error'
        except Exception as e:
            if attempt == retries - 1:
                return 'outage', str(e)
    
    return current_status, None

def monitor_services():
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    
    cur.execute("""
        SELECT id, name, url, status, request_timeout, retries 
        FROM services 
        WHERE url IS NOT NULL AND url != ''
    """)
    
    for row in cur.fetchall():
        service_id, name, url, current_status, timeout, retries = row
        
        new_status, error_msg = check_service(service_id, name, url, timeout, retries, current_status)
        
        if new_status != current_status:
            cur.execute(
                "UPDATE services SET status = %s, updated_at = %s WHERE id = %s",
                (new_status, datetime.utcnow(), service_id)
            )
            conn.commit()
            
            send_slack_alert(name, current_status, new_status, error_msg)
            print(f"✅ Service {name}: {current_status} → {new_status}")
    
    cur.close()
    conn.close()

if __name__ == "__main__":
    monitor_services()

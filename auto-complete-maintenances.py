#!/usr/bin/env python3
import requests
from datetime import datetime, timezone

BACKEND_URL = "http://localhost:8080/api"

def get_token():
    """Obter token de autenticação"""
    login_response = requests.post(f"{BACKEND_URL}/auth/login", json={
        'email': 'admin@piercloud.io',
        'password': 'admin123'
    })
    return login_response.json()['token']

def check_and_update_maintenances():
    """Verifica e atualiza status das manutenções automaticamente"""
    
    # Buscar manutenções
    response = requests.get(f"{BACKEND_URL}/public/maintenances")
    maintenances = response.json() or []
    
    if not maintenances:
        print("ℹ️  No maintenances to check")
        return
    
    token = get_token()
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    now = datetime.now(timezone.utc)
    updated_count = 0
    
    for maintenance in maintenances:
        scheduled_start = datetime.fromisoformat(maintenance['scheduled_start'].replace('Z', '+00:00'))
        scheduled_end = datetime.fromisoformat(maintenance['scheduled_end'].replace('Z', '+00:00'))
        current_status = maintenance['status']
        new_status = None
        
        # Determinar novo status
        if now >= scheduled_end and current_status != 'completed':
            new_status = 'completed'
            emoji = '✅'
        elif now >= scheduled_start and now < scheduled_end and current_status == 'scheduled':
            new_status = 'in_progress'
            emoji = '🔧'
        
        # Atualizar se necessário
        if new_status:
            update_data = {
                **maintenance,
                'status': new_status
            }
            
            update_response = requests.put(
                f"{BACKEND_URL}/admin/maintenances/{maintenance['id']}", 
                headers=headers,
                json=update_data
            )
            
            if update_response.status_code == 200:
                print(f"{emoji} '{maintenance['title']}': {current_status} → {new_status}")
                updated_count += 1
            else:
                print(f"❌ Failed to update '{maintenance['title']}'")
    
    if updated_count == 0:
        print("ℹ️  No status changes needed")
    else:
        print(f"\n✅ Updated {updated_count} maintenance(s)")

if __name__ == "__main__":
    check_and_update_maintenances()

#!/usr/bin/env python3
import requests
import json

# 1. Login
print("1️⃣ Fazendo login...")
login_response = requests.post('http://localhost:8080/api/auth/login', json={
    'email': 'admin@piercloud.io',
    'password': 'admin123'
})
token = login_response.json()['token']
print(f"   Token obtido: {token[:20]}...\n")

# 2. Atualizar incidente
print("2️⃣ Atualizando incidente ID 4 para status 'resolved'...")
headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

update_response = requests.put('http://localhost:8080/api/admin/incidents/4', 
    headers=headers,
    json={
        'title': 'Novo Teste',
        'description': 'novo teste',
        'severity': 'critical',
        'status': 'resolved',
        'service_id': None
    }
)

print(f"   Status: {update_response.status_code}")
print(f"   Response: {update_response.text}\n")

print("✅ Teste concluído!")
print("   Verifique o Slack para a notificação de mudança de status")

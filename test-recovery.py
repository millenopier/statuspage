#!/usr/bin/env python3
import json
import time

STATE_FILE = "/Users/milleno/Documents/statuspage-new/monitor-state.json"

print("🧪 Teste de Notificação de Recuperação\n")

# 1. Simular que o serviço estava DOWN
print("1️⃣ Simulando estado DOWN para LIGHTHOUSE...")
state = {
    "LIGHTHOUSE": "down",
    "Auth API": "up"
}

with open(STATE_FILE, 'w') as f:
    json.dump(state, f)

print(f"   Estado salvo: {state}\n")

# 2. Executar monitor (vai detectar que LIGHTHOUSE voltou)
print("2️⃣ Executando monitor.py...")
print("   O serviço LIGHTHOUSE está UP, mas o estado anterior era DOWN")
print("   Deve enviar notificação de RECUPERAÇÃO no Slack\n")

import subprocess
result = subprocess.run(['python3', 'monitor.py'], 
                       capture_output=True, 
                       text=True,
                       cwd='/Users/milleno/Documents/statuspage-new')

print(result.stdout)

print("\n✅ Teste concluído!")
print("   Verifique o Slack para a notificação de recuperação verde")

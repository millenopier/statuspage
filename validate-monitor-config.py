#!/usr/bin/env python3
"""
Script de validação da configuração do monitor
Verifica se todas as configurações estão corretas
"""
import os
import sys
from dotenv import load_dotenv
import psycopg2
import requests

# Carregar configurações
load_dotenv('/Users/milleno/Documents/statuspage/monitor-config.env')
load_dotenv('monitor-config.env')  # Fallback para path relativo

def check_env_vars():
    """Verifica variáveis de ambiente"""
    print("🔍 Verificando variáveis de ambiente...")
    
    required_vars = {
        'SLACK_WEBHOOK': os.getenv('SLACK_WEBHOOK'),
        'DB_HOST': os.getenv('DB_HOST'),
        'DB_PORT': os.getenv('DB_PORT'),
        'DB_USER': os.getenv('DB_USER'),
        'DB_PASSWORD': os.getenv('DB_PASSWORD'),
        'DB_NAME': os.getenv('DB_NAME'),
        'BACKEND_URL': os.getenv('BACKEND_URL')
    }
    
    all_ok = True
    for var, value in required_vars.items():
        if not value or value == 'YOUR_WEBHOOK_HERE':
            print(f"   ❌ {var}: NÃO CONFIGURADO")
            all_ok = False
        else:
            # Ocultar senha
            if 'PASSWORD' in var or 'WEBHOOK' in var:
                display_value = value[:10] + '...' if len(value) > 10 else '***'
            else:
                display_value = value
            print(f"   ✅ {var}: {display_value}")
    
    return all_ok

def check_database():
    """Verifica conexão com banco de dados"""
    print("\n🔍 Verificando conexão com banco de dados...")
    
    try:
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST'),
            port=int(os.getenv('DB_PORT', 5432)),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            database=os.getenv('DB_NAME')
        )
        
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM services")
        count = cur.fetchone()[0]
        
        print(f"   ✅ Conexão OK - {count} serviços encontrados")
        
        cur.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"   ❌ Erro: {e}")
        return False

def check_slack():
    """Verifica webhook do Slack"""
    print("\n🔍 Verificando webhook do Slack...")
    
    webhook = os.getenv('SLACK_WEBHOOK')
    if not webhook or webhook == 'YOUR_WEBHOOK_HERE':
        print("   ❌ Webhook não configurado")
        return False
    
    try:
        payload = {
            "text": "🧪 Teste de configuração do Status Page Monitor"
        }
        
        response = requests.post(webhook, json=payload, timeout=5)
        
        if response.status_code == 200:
            print("   ✅ Webhook OK - Mensagem enviada para o Slack!")
            return True
        else:
            print(f"   ❌ Erro: Status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Erro: {e}")
        return False

def check_backend():
    """Verifica se backend está rodando"""
    print("\n🔍 Verificando backend...")
    
    backend_url = os.getenv('BACKEND_URL', 'http://localhost:8080')
    health_url = backend_url.replace('/api/monitors/report', '/api/status-page/heartbeat/app')
    
    try:
        response = requests.get(health_url, timeout=5)
        
        if response.status_code == 200:
            print(f"   ✅ Backend OK - {health_url}")
            return True
        else:
            print(f"   ⚠️  Backend respondeu com status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Backend não está acessível: {e}")
        return False

def main():
    print("="*60)
    print("🔧 VALIDAÇÃO DA CONFIGURAÇÃO DO MONITOR")
    print("="*60)
    
    results = {
        'env': check_env_vars(),
        'database': check_database(),
        'slack': check_slack(),
        'backend': check_backend()
    }
    
    print("\n" + "="*60)
    print("📊 RESUMO")
    print("="*60)
    
    for check, status in results.items():
        icon = "✅" if status else "❌"
        print(f"{icon} {check.upper()}: {'OK' if status else 'FALHOU'}")
    
    all_ok = all(results.values())
    
    print("\n" + "="*60)
    if all_ok:
        print("✅ TUDO OK! O monitor está pronto para usar.")
        print("\nPróximos passos:")
        print("1. Execute: python3 monitor.py")
        print("2. Ou configure o cron para execução automática")
    else:
        print("❌ CONFIGURAÇÃO INCOMPLETA")
        print("\nCorreções necessárias:")
        if not results['env']:
            print("- Edite monitor-config.env com suas credenciais")
        if not results['database']:
            print("- Verifique credenciais do banco de dados")
        if not results['slack']:
            print("- Configure o SLACK_WEBHOOK correto")
        if not results['backend']:
            print("- Inicie o backend: cd backend && go run main.go")
    print("="*60)
    
    sys.exit(0 if all_ok else 1)

if __name__ == "__main__":
    main()

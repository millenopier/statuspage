#!/bin/bash

# Limpar logs do sistema (últimos 7 dias)
sudo journalctl --vacuum-time=7d

# Limpar logs antigos do projeto
find /var/log -name "*.log.1" -mtime +7 -delete
find /var/log -name "*.gz" -mtime +7 -delete

# Limpar logs específicos do statuspage
find /opt/statuspage -name "*.log" -size +10M -exec truncate -s 0 {} \;

# Limpar cache do apt
sudo apt-get clean
sudo apt-get autoremove -y

# Limpar logs do nginx antigos
find /var/log/nginx -name "*.gz" -mtime +7 -delete

echo "✅ Logs limpos - mantidos últimos 7 dias"

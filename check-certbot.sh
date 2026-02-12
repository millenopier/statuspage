#!/bin/bash

echo "🔍 Checking Let's Encrypt Auto-Renewal Configuration..."
echo ""

# Check certbot timer status
echo "1️⃣ Certbot Timer Status:"
sudo systemctl status certbot.timer --no-pager

echo ""
echo "2️⃣ Certbot Renewal Configuration:"
sudo certbot renew --dry-run

echo ""
echo "3️⃣ Certificate Expiration:"
sudo certbot certificates

echo ""
echo "4️⃣ Cron Jobs (if any):"
sudo crontab -l | grep certbot || echo "No certbot cron jobs found"

echo ""
echo "✅ Check complete!"

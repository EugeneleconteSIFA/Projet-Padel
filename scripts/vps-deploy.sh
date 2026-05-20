#!/usr/bin/env bash
# Déploiement VPS — à lancer sur le serveur dans /var/www/the-court
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/the-court}"
PM2_NAME="${PM2_NAME:-the-court}"

cd "$APP_DIR"

echo "→ Arrêt PM2 ($PM2_NAME)…"
pm2 stop "$PM2_NAME" 2>/dev/null || true

echo "→ Synchronisation Git (origin/main)…"
git fetch origin
git reset --hard origin/main

echo "→ Nettoyage build…"
rm -rf .next

echo "→ Build production…"
npm run build

echo "→ Redémarrage PM2…"
pm2 start "$PM2_NAME" 2>/dev/null || pm2 restart "$PM2_NAME"

echo "→ Vérification assets…"
CSS=$(ls .next/static/css/*.css 2>/dev/null | head -1)
if [ -n "$CSS" ]; then
  HASH=$(basename "$CSS" .css)
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:3000/_next/static/css/${HASH}.css")
  echo "   CSS /_next/static/css/${HASH}.css → HTTP $CODE"
  [ "$CODE" = "200" ] || { echo "ERREUR: assets non servis correctement."; exit 1; }
fi

pm2 status "$PM2_NAME"
echo "✓ Déploiement terminé."

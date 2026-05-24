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

echo "→ Dépendances npm (prod + dev — requis pour next build)…"
rm -rf node_modules
# PM2 / .env peuvent forcer NODE_ENV=production et omettre les devDependencies
export NPM_CONFIG_PRODUCTION=false
export NODE_ENV=development
if ! npm ci; then
  echo "⚠ npm ci a échoué — fallback npm install"
  npm install
fi
PKG_COUNT=$(find node_modules -maxdepth 1 -type d | wc -l | tr -d ' ')
echo "   ${PKG_COUNT} packages dans node_modules"
if [ "$PKG_COUNT" -lt 200 ]; then
  echo "⚠ Peu de packages — tailwindcss/typescript peuvent manquer pour le build"
fi

if [ ! -f lib/actions/auth.ts ]; then
  echo "✗ ERREUR : lib/actions/auth.ts absent — vérifiez le dépôt Git"
  exit 1
fi

echo "→ Prisma (client + migrations BDD)…"
npx prisma generate
npx prisma migrate deploy

echo "→ Build production…"
npm run build

echo "→ Redémarrage PM2…"
pm2 start "$PM2_NAME" 2>/dev/null || pm2 restart "$PM2_NAME"

echo "→ Attente démarrage app (5 s)…"
sleep 5

echo "→ Vérification assets…"
CSS=$(ls .next/static/css/*.css 2>/dev/null | head -1)
if [ -n "$CSS" ]; then
  HASH=$(basename "$CSS" .css)
  CODE="000"
  for _ in 1 2 3 4 5; do
    CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:3000/_next/static/css/${HASH}.css" 2>/dev/null || echo "000")
    [ "$CODE" = "200" ] && break
    sleep 2
  done
  echo "   CSS /_next/static/css/${HASH}.css → HTTP ${CODE}"
  if [ "$CODE" != "200" ]; then
    echo "⚠ Vérification CSS non concluante (l'app peut quand même être OK — testez dans le navigateur)."
  fi
fi

pm2 status "$PM2_NAME"
echo "✓ Déploiement terminé."

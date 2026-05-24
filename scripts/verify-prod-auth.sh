#!/usr/bin/env bash
# Vérifications auth / connectivité sur le VPS (§7 du diagnostic).
# Usage : ./scripts/verify-prod-auth.sh [nom-processus-pm2]
set -euo pipefail

PM2_NAME="${1:-the-court}"
APP_URL="${AUTH_URL:-${NEXT_PUBLIC_APP_URL:-https://thecourt.fr}}"
APP_URL="${APP_URL%/}"

echo "=== Vérification auth production — $APP_URL ==="
echo ""

echo "→ Variables PM2 ($PM2_NAME)…"
if command -v pm2 >/dev/null 2>&1; then
  pm2 env "$PM2_NAME" 2>/dev/null | grep -E '^(AUTH_|NEXT_PUBLIC_APP_URL|DATABASE_URL)=' || echo "  (pm2 env indisponible — lancer sur le serveur)"
else
  echo "  pm2 non installé localement"
fi
echo ""

echo "→ AUTH_URL / trustHost…"
if curl -sf -o /dev/null -w "%{http_code}" "$APP_URL/login" | grep -q '200'; then
  echo "  ✓ /login accessible (HTTP 200)"
else
  echo "  ✗ /login inaccessible"
fi

echo "→ Routes publiques (sans cookie)…"
for path in /tournois /clubs /mot-de-passe-oublie /feed; do
  code=$(curl -s -o /dev/null -w "%{http_code}" -L "$APP_URL$path" 2>/dev/null || echo "000")
  if [ "$code" = "200" ]; then
    echo "  ✓ $path → $code"
  else
    echo "  ⚠ $path → $code (attendu 200, pas redirection /login)"
  fi
done

echo "→ Route privée /profil (sans cookie → redirect login)…"
code=$(curl -s -o /dev/null -w "%{http_code}" -L "$APP_URL/profil" 2>/dev/null || echo "000")
if [ "$code" = "200" ]; then
  echo "  ⚠ /profil → 200 sans session (devrait rediriger vers /login)"
else
  echo "  ✓ /profil protégée (code $code ou redirect)"
fi

echo ""
echo "→ nginx X-Forwarded-Proto (si curl -I disponible)…"
proto=$(curl -sI "$APP_URL/login" 2>/dev/null | tr -d '\r' | grep -i '^x-forwarded-proto:' || true)
if [ -n "$proto" ]; then
  echo "  $proto"
else
  echo "  (header non visible côté client — vérifier proxy_set_header X-Forwarded-Proto \$scheme;)"
fi

echo ""
echo "Checklist manuelle restante :"
echo "  [ ] AUTH_SECRET identique au build et au runtime PM2"
echo "  [ ] Rotation mot de passe Neon si credentials étaient dans .env.example commité"
echo "  [ ] Cycle club PENDING → approbation admin → rechargement /club sans reconnexion"
echo ""

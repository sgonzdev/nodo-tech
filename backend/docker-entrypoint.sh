#!/bin/sh
set -e

echo "Esperando a Postgres en ${DB_HOST}:${DB_PORT}..."
until node -e "require('net').connect(${DB_PORT},'${DB_HOST}').on('connect',()=>process.exit(0)).on('error',()=>process.exit(1))" 2>/dev/null; do
  sleep 1
done

echo "Corriendo migrations..."
node dist/config/run-migrations.js

if [ "${SEED_ON_START}" = "true" ]; then
  echo "Sembrando datos..."
  node dist/seed/seed.js
fi

echo "Iniciando API..."
exec node dist/main.js

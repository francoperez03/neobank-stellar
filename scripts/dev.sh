#!/usr/bin/env bash
set -e

# Run from the repo root regardless of where the script is invoked from.
cd "$(dirname "$0")/.."

# Bun is installed to ~/.bun/bin but that PATH entry only lands in new shells.
# Make it available here so `turbo run dev` can launch the (Bun-based) API.
export PATH="$HOME/.bun/bin:$PATH"

COMPOSE="docker compose -f apps/api/docker-compose.yml --env-file apps/api/.env"

cleanup() {
  echo ""
  echo "Stopping Postgres..."
  $COMPOSE stop postgres
}
trap cleanup INT TERM

echo "Starting Postgres (localhost:5432)..."
$COMPOSE up -d postgres

# Wait for Postgres to be healthy so the API's drizzle-kit push doesn't race it.
echo -n "Waiting for Postgres to be healthy"
for _ in $(seq 1 30); do
  status="$(docker inspect --format '{{.State.Health.Status}}' api-postgres-1 2>/dev/null || echo starting)"
  if [ "$status" = "healthy" ]; then
    echo " ok"
    break
  fi
  echo -n "."
  sleep 1
done

# web -> http://localhost:3000  |  api -> http://localhost:4000  |  db -> localhost:5432
turbo run dev

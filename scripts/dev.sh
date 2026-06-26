#!/usr/bin/env bash
set -e

COMPOSE="docker compose -f apps/api/docker-compose.yml --env-file apps/api/.env"

cleanup() {
  echo ""
  echo "Stopping Postgres..."
  $COMPOSE stop postgres
}
trap cleanup INT TERM

$COMPOSE up -d postgres
turbo run dev

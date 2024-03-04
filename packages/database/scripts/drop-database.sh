#!/bin/bash

source .env
docker compose up --wait -d
docker compose exec -e PGPASSWORD=$POSTGRES_PASSWORD postgres psql -U $POSTGRES_USERNAME -c 'DROP DATABASE jamjar'
npx prisma migrate dev
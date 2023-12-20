#!/bin/bash

source .env
ln -s .env packages/database
ln -s git-hooks/pre-commit ./.git/hooks
npx prisma migrate dev --schema packages/database/schema.prisma

docker compose up -d

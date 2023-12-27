#!/bin/bash

ln -s git-hooks/pre-commit ./.git/hooks
source packages/database/.env
docker compose --env-file=packages/database/.env up -d --wait

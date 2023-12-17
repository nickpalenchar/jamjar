#!/bin/bash

source .env

ln -s git-hooks/pre-commit ./git/hooks

docker compose up -d

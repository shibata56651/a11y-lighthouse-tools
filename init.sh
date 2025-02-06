#!/bin/sh

npm install --force

cp .env.example ./.env
cp .env.example ./app/.env

docker network create a11y-lighthouse-tools

docker compose build --no-cache

docker compose up -d
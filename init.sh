#!/bin/sh

npm install --force

cp .env.example ./.env
cp .env.example ./app/.env

docker network create si-next-line-template-nw

docker compose build --no-cache

docker compose up -d
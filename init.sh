#!/bin/sh

npm install --force

cp .env.example ./.env
cp .env.example ./app/.env

docker network create a11y-tools

docker compose build --no-cache

docker compose up -d

sleep 5

CONTAINER_ID=$(docker ps -qf "name=a11y-tools-app")
docker exec -it $CONTAINER_ID printenv | grep CHROME_PATH

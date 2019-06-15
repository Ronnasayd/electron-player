#!/bin/bash
function cleanup {
  docker stop autofront
  docker system prune --force
}

if [ ! -d "app/static" ]; then
  mkdir app/static
  mkdir app/static/src
  mkdir app/static/src/css
  mkdir app/static/src/scss
  mkdir app/static/src/js
fi
docker build --tag=autofront .
docker run  -ti  -v "$(pwd):/app" -p 3000:3000 -p 3001:3001 --name=autofront autofront
docker stop autofront
docker system prune --force
trap cleanup EXIT


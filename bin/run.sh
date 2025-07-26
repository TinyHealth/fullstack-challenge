#!/bin/bash

set -e
# Launch Playwright using Docker
docker run -d --rm \
   --name "e2e-fullstack-challenge" \
   -v "$PWD":/app \
   -w /app \
   -p 3000:3000 \
   -p 3001:3001 \
   mcr.microsoft.com/playwright:v1.52.0-noble

npm run dev &
echo "Starting services..."
npx wait-on --http-get http://localhost:3000 http://localhost:3001 && npm run test:ui

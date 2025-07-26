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
# Wait for services to start
echo "Starting services..."
sleep 5

npm run dev:backend &
npm run dev:frontend &
# Open browsers
npx open http://localhost:3000 &
npx open http://localhost:3001 &

# Run Playwright UI
npm run test:ui

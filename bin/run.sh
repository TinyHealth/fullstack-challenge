#!/bin/bash

# Launch Docker with Playwright
docker run -d --rm \
   --name "fullstack-challenge" \
   -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
   -v "$PWD":/app \
   -w /app \
   -p 3000:3000 \
   -p 3001:3001 \
   proveo/aider-node \
   bash -c "npm install && npm run dev" &

# Wait for services to start
echo "Starting services..."
sleep 5

# Open browsers
npx open http://localhost:3000 &
npx open http://localhost:3001 &

# Run Playwright UI
npm run test:ui

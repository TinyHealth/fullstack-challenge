
docker run -it --rm \                                                                                                                                                                                     Thu 24 Jul 2025 06:57:06 PM
   --name "fullstack-challenge" \
   -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
   -v "$PWD":/app \
   -w /app \
   proveo/aider-node

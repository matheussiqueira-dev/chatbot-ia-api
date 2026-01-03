#!/bin/bash

# Build and push Docker image
# Usage: ./docker-build.sh <image-name> [tag]

set -e

IMAGE_NAME=${1:-chatbot-ia-api}
TAG=${2:-latest}
FULL_IMAGE="$IMAGE_NAME:$TAG"

echo "Building Docker image: $FULL_IMAGE"
docker build -t $FULL_IMAGE .

echo "✅ Docker image built successfully!"
echo ""
echo "To run the container:"
echo "  docker run -p 8000:8000 -e OPENAI_API_KEY=sk-xxx $FULL_IMAGE"
echo ""
echo "To push to registry:"
echo "  docker tag $FULL_IMAGE your-registry/$FULL_IMAGE"
echo "  docker push your-registry/$FULL_IMAGE"

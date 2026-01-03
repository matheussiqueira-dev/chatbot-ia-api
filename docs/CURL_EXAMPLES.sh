"""Collection of cURL examples for testing the API."""

# Health Check
curl -X GET "http://localhost:8000/health" \
  -H "Content-Type: application/json"

# Root Endpoint
curl -X GET "http://localhost:8000/" \
  -H "Content-Type: application/json"

# Send Message (Create new conversation)
curl -X POST "http://localhost:8000/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello! What can you help me with?",
    "user_id": "user_001"
  }'

# Send Message (Continue conversation)
# Replace conv_123 with the actual conversation_id from the previous response
curl -X POST "http://localhost:8000/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Tell me more about your capabilities",
    "conversation_id": "conv_123",
    "user_id": "user_001"
  }'

# Get Conversation History
# Replace conv_123 with the actual conversation_id
curl -X GET "http://localhost:8000/conversation/conv_123" \
  -H "Content-Type: application/json"

# List Conversations (for a specific user)
curl -X GET "http://localhost:8000/conversations?user_id=user_001&skip=0&limit=10" \
  -H "Content-Type: application/json"

# List Conversations (all)
curl -X GET "http://localhost:8000/conversations" \
  -H "Content-Type: application/json"

# Reset Conversation
# Replace conv_123 with the actual conversation_id
curl -X POST "http://localhost:8000/conversation/conv_123/reset" \
  -H "Content-Type: application/json"

# Delete Conversation
# Replace conv_123 with the actual conversation_id
curl -X DELETE "http://localhost:8000/conversation/conv_123" \
  -H "Content-Type: application/json"

# Pretty print JSON (requires jq installed)
curl -X GET "http://localhost:8000/health" -H "Content-Type: application/json" | jq

# With Bearer Token (for future authentication)
curl -X GET "http://localhost:8000/conversations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token_here"

# POST with variables
CONVERSATION_ID="conv_123"
USER_ID="user_001"
MESSAGE="Hello!"

curl -X POST "http://localhost:8000/chat" \
  -H "Content-Type: application/json" \
  -d "{
    \"content\": \"$MESSAGE\",
    \"conversation_id\": \"$CONVERSATION_ID\",
    \"user_id\": \"$USER_ID\"
  }"

# POST from file
curl -X POST "http://localhost:8000/chat" \
  -H "Content-Type: application/json" \
  -d @message.json

# Verbose output (shows request and response headers)
curl -X GET "http://localhost:8000/health" \
  -H "Content-Type: application/json" \
  -v

# Follow redirects
curl -X GET "http://localhost:8000/health" \
  -H "Content-Type: application/json" \
  -L

# Set timeout
curl -X GET "http://localhost:8000/health" \
  -H "Content-Type: application/json" \
  --max-time 10

# Custom headers
curl -X POST "http://localhost:8000/chat" \
  -H "Content-Type: application/json" \
  -H "X-User-Agent: MyClient/1.0" \
  -H "X-Request-ID: 12345" \
  -d '{"content": "Hello!"}'

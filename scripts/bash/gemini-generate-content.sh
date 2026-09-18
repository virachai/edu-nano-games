#!/bin/bash
set -e -E

GEMINI_API_KEY="${1:-$GEMINI_API_KEY}"
MODEL_ID="gemma-4-26b-a4b-it"
GENERATE_CONTENT_API="streamGenerateContent"

cat << EOF > request.json
{
    "contents": [
      {
        "role": "user",
        "parts": [
          {
            "text": "Hi, please generate a short story about a brave little robot who saves the day in a futuristic city."
          }
        ]
      }
    ],
    "generationConfig": {
      "thinkingConfig": {
        "thinkingLevel": "HIGH"
      },
      "audioTranscriptionConfig": {
      }
    },
    "tools": [
      {
        "googleSearch": {
        }
      }
    ]
}
EOF

curl \
-X POST \
-H "Content-Type: application/json" \
"https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:${GENERATE_CONTENT_API}?key=${GEMINI_API_KEY}" -d '@request.json'

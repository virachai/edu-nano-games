# scripts/bash/

## gemini-generate-content.sh

Calls Gemini's `streamGenerateContent` endpoint with a hardcoded prompt
(`INSERT_INPUT_HERE` in the request body — edit before running) and writes
the request payload to `./request.json`.

### Prerequisites

- `bash`, `curl`
- A Gemini API key

### Run

Pass the key as an argument:

```bash
scripts/bash/gemini-generate-content.sh YOUR_GEMINI_API_KEY
```

Or via environment variable (no arg needed):

```bash
export GEMINI_API_KEY=YOUR_GEMINI_API_KEY
scripts/bash/gemini-generate-content.sh
```

An arg, if given, takes precedence over `$GEMINI_API_KEY`.

### Notes

- Edit `"INSERT_INPUT_HERE"` in the script (or `request.json` after first
  run) to set the actual prompt text.
- `MODEL_ID` and `GENERATE_CONTENT_API` are set at the top of the script —
  change there to target a different model/endpoint.
- Never commit a real API key or `request.json` if it contains sensitive
  prompt content.

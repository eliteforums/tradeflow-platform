

## Plan: Deploy & Verify AI Edge Functions

### Problem
Both `ai-moderate` and `ai-transcribe` edge functions show zero logs, indicating they likely haven't been deployed with recent code changes. The code is correct but needs deployment.

### Changes

#### 1. Deploy both AI edge functions
- Deploy `ai-moderate` and `ai-transcribe` via the deployment tool
- These are the only two AI-related edge functions in the project

#### 2. Test both functions after deployment
- Invoke `ai-moderate` with a test payload to verify Groq connectivity and auth
- Invoke `ai-transcribe` with a test payload to verify keyword detection + Groq classification
- Check logs for any runtime errors (missing env vars, API failures)

#### 3. Fix any runtime issues found during testing
- If `GROQ_API_KEY` isn't set or returns errors, surface the issue
- If CORS or auth issues appear, fix and redeploy

### No Code Changes Expected
The code is already correct. This is a deployment + verification task.


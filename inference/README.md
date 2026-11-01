# Hosted SLM on Google Cloud Run

One-time setup (needs a Google account with billing enabled; the free tier covers light traffic):

1. Install the gcloud CLI and run `gcloud auth login`.
2. `gcloud config set project <YOUR_PROJECT_ID>`
3. `gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com`
4. Deploy from the repo root:

```
gcloud run deploy portfolio-slm --source inference --region us-central1 \
  --allow-unauthenticated --port 8080 --cpu 2 --memory 2Gi --cpu-boost \
  --min-instances 0 --max-instances 2 --concurrency 4 --timeout 60
```

5. Copy the service URL it prints and set it in Vercel as `INFERENCE_URL` (production), then redeploy.

`--max-instances 2` caps spend. The Vercel function `api/chat.ts` checks the origin and rate-limits before forwarding here.

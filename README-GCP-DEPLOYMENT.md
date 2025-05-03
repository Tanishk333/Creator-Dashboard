# Google Cloud Platform (GCP) Free Tier Deployment Guide

This guide helps you deploy your Creator Dashboard project using GCP's free tier services.

## 1. Backend (Node.js/Express) on Google Cloud Run

### Prerequisites
- Google Cloud account (https://cloud.google.com/)
- Google Cloud SDK installed
- Billing enabled (Cloud Run free tier covers 2 million requests/month)

### Steps
1. **Navigate to the backend directory:**
   ```sh
   cd server
   ```
2. **Build and test Docker image locally (optional):**
   ```sh
   docker build -t creator-backend .
   docker run -p 8080:8080 creator-backend
   ```
3. **Deploy to Cloud Run:**
   ```sh
   gcloud builds submit --tag gcr.io/[YOUR_PROJECT_ID]/creator-backend
   gcloud run deploy creator-backend --image gcr.io/[YOUR_PROJECT_ID]/creator-backend --platform managed --region us-central1 --allow-unauthenticated --port 8080
   ```
4. **Set environment variables in Cloud Run:**
   - Add your MongoDB Atlas URI and any secrets via the Cloud Run console.

## 2. Frontend (React) on Google Cloud Storage (Static Website)

### Steps
1. **Build the React app:**
   ```sh
   npm run build
   ```
2. **Create a GCS bucket:**
   ```sh
   gsutil mb -l us-central1 -p [YOUR_PROJECT_ID] gs://[YOUR_BUCKET_NAME]
   ```
3. **Enable static website hosting:**
   ```sh
   gsutil web set -m index.html -e 404.html gs://[YOUR_BUCKET_NAME]
   ```
4. **Upload build files:**
   ```sh
   gsutil -m rsync -r dist gs://[YOUR_BUCKET_NAME]
   ```
5. **Make files public:**
   ```sh
   gsutil iam ch allUsers:objectViewer gs://[YOUR_BUCKET_NAME]
   ```
6. **Access your site:**
   - Visit `http://storage.googleapis.com/[YOUR_BUCKET_NAME]/index.html`

## 3. Database (MongoDB Atlas Free Tier)
- Sign up at https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Whitelist Cloud Run IP ranges or set to allow all (for testing)
- Get your connection string and set it as an environment variable in Cloud Run

## 4. Update API URLs and CORS
- In your frontend, update API URLs to point to your Cloud Run backend URL.
- In your backend, ensure CORS middleware allows requests from your frontend bucket URL.

## 5. Environment Variables
- Never commit secrets. Use Cloud Run and GCP Secret Manager for production secrets.

## References
- [Cloud Run Docs](https://cloud.google.com/run/docs/quickstarts/build-and-deploy)
- [GCS Static Website](https://cloud.google.com/storage/docs/hosting-static-website)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
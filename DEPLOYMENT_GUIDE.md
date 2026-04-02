# Firebase Hosting Deployment Guide

## Prerequisites

1. ✅ Firebase CLI installed (`firebase --version` should work)
2. ✅ Firebase project configured (`merchantmagix-5c6cd`)
3. ⚠️ **Production database needed** (PostgreSQL)

## Step 1: Set Up Production Database

You need a PostgreSQL database for production. Recommended options:

### Option A: Supabase (Free tier available)
1. Go to https://supabase.com
2. Create a new project
3. Copy the connection string from Settings → Database
4. Format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

### Option B: Neon (Serverless Postgres)
1. Go to https://neon.tech
2. Create a new project
3. Copy the connection string

### Option C: Other PostgreSQL providers
- Railway, Render, AWS RDS, etc.

**After getting your database URL:**
```bash
# Update your .env file with production DATABASE_URL
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

## Step 2: Update Production URLs

Update your `.env` file:

```env
# Change from localhost to production URL
NEXTAUTH_URL="https://merchantmagix-5c6cd.web.app"
# Or your custom domain if configured:
# NEXTAUTH_URL="https://merchantmagix.com"

# Update app URL
NEXT_PUBLIC_APP_URL="https://merchantmagix-5c6cd.web.app"
```

## Step 3: Set Environment Variables in Firebase

Firebase Functions need environment variables set separately. You have two options:

### Option A: Using Firebase Console (Easiest)

1. Go to [Firebase Console](https://console.firebase.google.com/project/merchantmagix-5c6cd)
2. Navigate to **Functions** → **Configuration** → **Environment Variables**
3. Click **Add Variable** and add each of these:

```
DATABASE_URL = your-production-postgresql-connection-string
NEXTAUTH_URL = https://merchantmagix-5c6cd.web.app
NEXTAUTH_SECRET = dev-secret-key-change-in-production-abc123xyz789
AUTH_SECRET = dev-secret-key-change-in-production-abc123xyz789
GOOGLE_CLIENT_ID = your-google-client-id
GOOGLE_CLIENT_SECRET = your-google-client-secret
NEXT_PUBLIC_APP_URL = https://merchantmagix-5c6cd.web.app
NEXT_PUBLIC_FIREBASE_API_KEY = your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = merchantmagix-5c6cd.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = merchantmagix-5c6cd
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = merchantmagix-5c6cd.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID = your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = your-measurement-id
FB_ADMIN_PROJECT_ID = merchantmagix-5c6cd
FB_ADMIN_CLIENT_EMAIL = firebase-adminsdk-fbsvc@merchantmagix-5c6cd.iam.gserviceaccount.com
FB_ADMIN_PRIVATE_KEY = -----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
```

**Note:** For `FB_ADMIN_PRIVATE_KEY`, paste the entire key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` with `\n` for newlines.

### Option B: Using Firebase CLI

```bash
firebase functions:config:set \
  database.url="your-postgresql-url" \
  auth.secret="dev-secret-key-change-in-production-abc123xyz789" \
  auth.url="https://merchantmagix-5c6cd.web.app"
```

## Step 4: Run Database Migrations

Before deploying, set up your production database schema:

```bash
# Set DATABASE_URL in your local .env to production database
DATABASE_URL="postgresql://..." npm run db:push
```

## Step 5: Deploy to Firebase

```bash
# Deploy hosting and functions
firebase deploy --only hosting

# Or deploy everything
firebase deploy
```

## Step 6: Verify Deployment

1. Visit your site: https://merchantmagix-5c6cd.web.app
2. Check Firebase Console → Functions → Logs for any errors
3. Test login/registration
4. Check that API routes work

## Troubleshooting

### Database Connection Errors
- Verify `DATABASE_URL` is set correctly in Firebase Functions config
- Check that your database allows connections from Google Cloud IPs
- For Supabase: Check connection pooling settings

### Authentication Errors
- Verify `NEXTAUTH_URL` matches your actual deployment URL
- Check that `NEXTAUTH_SECRET` is set
- Verify Google OAuth credentials are correct

### Function Timeout
- Cloud Functions have a default timeout
- Check Firebase Console → Functions → Configuration for timeout settings

## Next Steps

1. Set up a custom domain (optional)
2. Configure SSL certificate
3. Set up monitoring and alerts
4. Configure backup strategy for database

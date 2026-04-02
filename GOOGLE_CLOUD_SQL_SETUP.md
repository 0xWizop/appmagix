# Setting Up Google Cloud SQL (PostgreSQL) for Firebase

Since you're using Firebase, you can use **Google Cloud SQL** for PostgreSQL - it integrates perfectly with Firebase Hosting and Cloud Functions.

## Step 1: Create Cloud SQL PostgreSQL Instance

1. Go to [Google Cloud Console](https://console.cloud.google.com/sql/instances?project=merchantmagix-5c6cd)
2. Click **"Create Instance"**
3. Choose **PostgreSQL**
4. Select **"Sandbox"** (free tier) or **"Production"** based on your needs
5. Configure:
   - **Instance ID**: `merchantmagix-db` (or any name)
   - **Password**: Set a strong password (save this!)
   - **Region**: `us-central1` (same as your Firebase Functions)
   - **Database version**: PostgreSQL 15 or 14
6. Click **"Create"**

## Step 2: Create a Database

1. Once the instance is created, click on it
2. Go to **"Databases"** tab
3. Click **"Create Database"**
4. Name it: `merchantmagix` (or any name)
5. Click **"Create"**

## Step 3: Get Connection String

1. In your Cloud SQL instance, go to **"Overview"** tab
2. Find **"Connection name"** - it looks like: `merchantmagix-5c6cd:us-central1:merchantmagix-db`
3. Your connection string will be:
   ```
   postgresql://postgres:YOUR_PASSWORD@/merchantmagix?host=/cloudsql/merchantmagix-5c6cd:us-central1:merchantmagix-db
   ```

**For Cloud Functions (Firebase Hosting):**
Use Unix socket connection:
```
postgresql://postgres:YOUR_PASSWORD@/merchantmagix?host=/cloudsql/merchantmagix-5c6cd:us-central1:merchantmagix-db
```

**For local development:**
You'll need to use Cloud SQL Proxy or get the public IP:
```
postgresql://postgres:YOUR_PASSWORD@PUBLIC_IP:5432/merchantmagix
```

## Step 4: Enable Cloud SQL API

1. Go to [Cloud SQL Admin API](https://console.cloud.google.com/apis/library/sqladmin.googleapis.com?project=merchantmagix-5c6cd)
2. Click **"Enable"**

## Step 5: Connect Cloud SQL to Firebase Functions

Your Firebase Functions need permission to access Cloud SQL:

1. Go to [Cloud SQL Instance](https://console.cloud.google.com/sql/instances?project=merchantmagix-5c6cd)
2. Click on your instance
3. Go to **"Connections"** tab
4. Under **"Authorized networks"**, add:
   - `0.0.0.0/0` (for testing) or specific IPs
5. Under **"Authorized applications"**, make sure your Firebase project is authorized

## Step 6: Update Firebase Functions Configuration

In your `firebase.json`, you may need to add Cloud SQL connection:

```json
{
  "hosting": {
    "site": "merchantmagix-5c6cd",
    "source": ".",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "frameworksBackend": {
      "region": "us-central1",
      "cloudSqlConnections": ["merchantmagix-5c6cd:us-central1:merchantmagix-db"]
    }
  }
}
```

## Step 7: Set Environment Variables

Add to Firebase Functions environment variables:
- `DATABASE_URL` = Your Cloud SQL connection string

## Alternative: Use Public IP (Easier for Development)

1. In Cloud SQL instance → **"Connections"** → **"Public IP"**
2. Enable public IP
3. Add your IP to authorized networks
4. Use connection string:
   ```
   postgresql://postgres:YOUR_PASSWORD@PUBLIC_IP:5432/merchantmagix
   ```

## Cost Note

- **Cloud SQL Sandbox**: Free tier available (limited)
- **Cloud SQL Production**: ~$7-50/month depending on size
- Check [Cloud SQL Pricing](https://cloud.google.com/sql/pricing) for details

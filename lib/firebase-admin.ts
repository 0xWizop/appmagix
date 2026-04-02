import { getApps, getApp, initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import * as path from "path";

const SESSION_COOKIE_NAME = "firebase_session";

// Use FB_ADMIN_ prefix (Firebase rejects FIREBASE_* in deploy env loading)
function getServiceAccount(): Record<string, string> | null {
  if (
    process.env.FB_ADMIN_PROJECT_ID &&
    process.env.FB_ADMIN_CLIENT_EMAIL &&
    process.env.FB_ADMIN_PRIVATE_KEY
  ) {
    return {
      type: process.env.FB_ADMIN_SERVICE_ACCOUNT_TYPE || "service_account",
      project_id: process.env.FB_ADMIN_PROJECT_ID,
      private_key_id: process.env.FB_ADMIN_PRIVATE_KEY_ID || "",
      private_key: process.env.FB_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
      client_email: process.env.FB_ADMIN_CLIENT_EMAIL,
      client_id: process.env.FB_ADMIN_CLIENT_ID || "",
      auth_uri: process.env.FB_ADMIN_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
      token_uri: process.env.FB_ADMIN_TOKEN_URI || "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url:
        process.env.FB_ADMIN_AUTH_PROVIDER_X509_CERT_URL || "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FB_ADMIN_CLIENT_X509_CERT_URL || "",
      universe_domain: process.env.FB_ADMIN_UNIVERSE_DOMAIN || "googleapis.com",
    };
  }
  const serviceAccountPath = process.env.FB_ADMIN_SERVICE_ACCOUNT_PATH
    ? path.resolve(process.cwd(), process.env.FB_ADMIN_SERVICE_ACCOUNT_PATH)
    : path.join(process.cwd(), "firebase-service-account.json");
  try {
    return require(serviceAccountPath) as Record<string, string>;
  } catch {
    return null;
  }
}

function getAdminApp(): App | null {
  try {
    if (getApps().length) return getApp() as App;
    const serviceAccount = getServiceAccount();
    if (!serviceAccount) return null;
    return initializeApp({ 
      credential: cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${process.env.FB_ADMIN_PROJECT_ID}.appspot.com`
    });
  } catch {
    return null;
  }
}

const adminApp = getAdminApp();

export function getAdminFirestore() {
  if (!adminApp) throw new Error("Firebase Admin not initialized. Set FB_ADMIN_SERVICE_ACCOUNT_PATH or FB_ADMIN_* env vars.");
  return getFirestore(adminApp);
}

export function getAdminAuth() {
  if (!adminApp) throw new Error("Firebase Admin not initialized.");
  return getAuth(adminApp);
}

export { adminApp, SESSION_COOKIE_NAME };

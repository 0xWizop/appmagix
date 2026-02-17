import { getApps, getApp, initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import * as path from "path";

const SESSION_COOKIE_NAME = "firebase_session";

function getServiceAccount(): Record<string, string> | null {
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    return {
      type: process.env.FIREBASE_SERVICE_ACCOUNT_TYPE || "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || "",
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID || "",
      auth_uri: process.env.FIREBASE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
      token_uri: process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url:
        process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL || "",
      universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN || "googleapis.com",
    };
  }
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
    ? path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
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
    return initializeApp({ credential: cert(serviceAccount) });
  } catch {
    return null;
  }
}

const adminApp = getAdminApp();

export function getAdminFirestore() {
  if (!adminApp) throw new Error("Firebase Admin not initialized. Set FIREBASE_SERVICE_ACCOUNT_PATH and ensure firebase-service-account.json exists.");
  return getFirestore(adminApp);
}

export function getAdminAuth() {
  if (!adminApp) throw new Error("Firebase Admin not initialized.");
  return getAuth(adminApp);
}

export { adminApp, SESSION_COOKIE_NAME };

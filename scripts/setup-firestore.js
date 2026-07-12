/**
 * Webmint — Firestore setup script
 * Run once: node scripts/setup-firestore.js
 * Creates placeholder documents to initialize collections and sets up indexes.
 */

const admin = require("firebase-admin");
const serviceAccount = require("../firebase-service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function setup() {
  console.log("Setting up Firestore collections for webmint-de64d...\n");

  // ── user_settings ─────────────────────────────────────────────────────────
  // Stores per-user preferences (brand colors etc)
  await db.collection("user_settings").doc("_init").set({
    _placeholder: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log("✓ user_settings");

  // ── sites ──────────────────────────────────────────────────────────────────
  // Client-connected sites for analytics tracking
  await db.collection("sites").doc("_init").set({
    _placeholder: true,
    ownerId: "_init",
    domain: "_init",
    siteToken: "_init",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log("✓ sites");

  // ── analytics_events ───────────────────────────────────────────────────────
  // Page view events ingested from embed script
  await db.collection("analytics_events").doc("_init").set({
    _placeholder: true,
    siteId: "_init",
    ownerId: "_init",
    path: "/",
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log("✓ analytics_events");

  // ── projects (Firestore mirror) ────────────────────────────────────────────
  await db.collection("projects").doc("_init").set({
    _placeholder: true,
    ownerId: "_init",
    name: "_init",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log("✓ projects");

  // ── intakes ────────────────────────────────────────────────────────────────
  await db.collection("intakes").doc("_init").set({
    _placeholder: true,
    ownerId: null,
    contactName: "_init",
    contactEmail: "_init",
    status: "SUBMITTED",
    isRead: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log("✓ intakes");

  // ── notifications ──────────────────────────────────────────────────────────
  await db.collection("notifications").doc("_init").set({
    _placeholder: true,
    userId: "_init",
    message: "_init",
    read: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log("✓ notifications");

  // Clean up placeholder docs
  const collections = ["user_settings", "sites", "analytics_events", "projects", "intakes", "notifications"];
  for (const col of collections) {
    await db.collection(col).doc("_init").delete();
  }
  console.log("\n✓ Cleaned up placeholder docs");
  console.log("\n✅ Firestore setup complete for webmint-de64d");
  console.log("\nNext steps:");
  console.log("1. Make sure Firestore is enabled in your Firebase Console");
  console.log("2. Run: firebase login");
  console.log("3. Run: firebase deploy --only hosting");

  process.exit(0);
}

setup().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});

#!/usr/bin/env node

/**
 * Helper script to set Firebase Functions environment variables
 * 
 * Usage:
 *   node scripts/set-firebase-env.js
 * 
 * Make sure you have DATABASE_URL set in your .env file first!
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load .env file
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const requiredVars = {
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'https://merchantmagix-5c6cd.web.app',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  AUTH_SECRET: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://merchantmagix-5c6cd.web.app',
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  FB_ADMIN_PROJECT_ID: process.env.FB_ADMIN_PROJECT_ID,
  FB_ADMIN_CLIENT_EMAIL: process.env.FB_ADMIN_CLIENT_EMAIL,
  FB_ADMIN_PRIVATE_KEY: process.env.FB_ADMIN_PRIVATE_KEY,
};

console.log('🚀 Setting Firebase Functions environment variables...\n');

// Check for DATABASE_URL
if (!requiredVars.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL is not set in your .env file!');
  console.error('   Please set up a production database first.');
  console.error('   See DEPLOYMENT_GUIDE.md for instructions.\n');
  process.exit(1);
}

// Use Firebase CLI to set environment variables
// Note: Firebase Functions v2 uses different syntax
console.log('📝 Setting environment variables...\n');

const varsToSet = Object.entries(requiredVars)
  .filter(([key, value]) => value !== undefined && value !== '')
  .map(([key, value]) => {
    // Escape special characters for shell
    const escapedValue = value.replace(/"/g, '\\"');
    return `${key}="${escapedValue}"`;
  });

if (varsToSet.length === 0) {
  console.error('❌ No environment variables to set!');
  process.exit(1);
}

console.log('Variables to set:');
varsToSet.forEach(([key]) => console.log(`  - ${key}`));
console.log('\n');

// Firebase Functions v2 uses secrets:set command
// But for environment variables, we need to use the console or gcloud
console.log('⚠️  Note: Firebase Functions environment variables must be set via:');
console.log('   1. Firebase Console: Functions → Configuration → Environment Variables');
console.log('   2. Or manually using the values above\n');
console.log('📋 Copy these values to Firebase Console:\n');

Object.entries(requiredVars)
  .filter(([key, value]) => value !== undefined && value !== '')
  .forEach(([key, value]) => {
    // Truncate long values for display
    const displayValue = value.length > 50 ? value.substring(0, 50) + '...' : value;
    console.log(`${key} = ${displayValue}`);
  });

console.log('\n✅ Done! After setting these in Firebase Console, run:');
console.log('   firebase deploy --only hosting\n');

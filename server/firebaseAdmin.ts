import { initializeApp, getApps, getApp, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import firebaseConfig from '../firebase-applet-config.json';

let adminApp: App | null = null;

/**
 * Initializes and returns the Firebase Admin App instance using Application Default Credentials (ADC).
 * In Cloud Run and Google Cloud environments, ADC automatically resolves the environment's credentials.
 * No service account key files are stored or committed.
 */
export function getFirebaseAdmin(): App {
  if (!adminApp) {
    const existingApps = getApps();
    if (existingApps.length > 0 && existingApps[0]) {
      adminApp = existingApps[0];
    } else {
      const projectId =
        process.env.FIREBASE_PROJECT_ID ||
        process.env.GOOGLE_CLOUD_PROJECT ||
        process.env.GCLOUD_PROJECT ||
        firebaseConfig.projectId;

      adminApp = initializeApp({
        projectId: projectId || undefined,
      });
    }
  }
  return adminApp;
}

export function getAdminAuth(): Auth {
  return getAuth(getFirebaseAdmin());
}


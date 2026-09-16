// Values are generated from .env.local or the build environment.
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

export { firebaseConfig } from './firebase.config.generated';

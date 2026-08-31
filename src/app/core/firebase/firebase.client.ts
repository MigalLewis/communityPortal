import { firebaseConfig } from '../../../environments/firebase.config';

const identityBaseUrl = 'https://identitytoolkit.googleapis.com/v1';
const firestoreBaseUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;
const functionsBaseUrl = `https://us-central1-${firebaseConfig.projectId}.cloudfunctions.net`;

const hasFirebaseConfig = ![
  firebaseConfig.apiKey,
  firebaseConfig.projectId,
  firebaseConfig.authDomain
].some((value) => value.startsWith('YOUR_'));

export const firebaseClient = {
  identityBaseUrl,
  firestoreBaseUrl,
  functionsBaseUrl,
  apiKey: firebaseConfig.apiKey,
  useMockFirestore: !hasFirebaseConfig
};

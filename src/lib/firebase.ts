import { initializeApp, getApps, type FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";

/*
  Voting's only backend: a Firestore database, talked to directly from the
  browser (GitHub Pages serves this site — there is no server to run Cloud
  Functions on). The values below are the *public* web config Firebase
  generates for a project; unlike an API secret, they are safe to ship in the
  client bundle — access control lives entirely in firestore.rules (repo
  root), not in hiding these strings.

  One-time setup (see firestore.rules and PRODUCT.md/plan for the full
  walkthrough):
    1. console.firebase.google.com → create a project → Firestore Database
       → create (production mode).
    2. Firestore → Rules → paste the contents of /firestore.rules → Publish.
    3. Project settings → General → Your apps → Web app → copy the config
       object below.

  Import this only from React islands (.tsx), never from .astro frontmatter —
  frontmatter runs at `astro build` time in CI and has no business opening a
  Firestore connection.
*/
const FIREBASE_CONFIG: FirebaseOptions = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};

const app = getApps()[0] ?? initializeApp(FIREBASE_CONFIG);

export const db = getFirestore(app);

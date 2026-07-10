const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

let firebaseAuth = null;
let firebaseInitializationError = null;

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

const missingVariables = [];

if (!projectId) {
  missingVariables.push("FIREBASE_PROJECT_ID");
}

if (!clientEmail) {
  missingVariables.push("FIREBASE_CLIENT_EMAIL");
}

if (!privateKey) {
  missingVariables.push("FIREBASE_PRIVATE_KEY");
}

if (missingVariables.length > 0) {
  firebaseInitializationError =
    `Missing Firebase environment variables: ${missingVariables.join(", ")}`;

  console.error(firebaseInitializationError);
} else {
  try {
    const normalizedPrivateKey = privateKey
      .replace(/^"(.*)"$/s, "$1")
      .replace(/\\n/g, "\n")
      .trim();

    if (
      !normalizedPrivateKey.includes("-----BEGIN PRIVATE KEY-----") ||
      !normalizedPrivateKey.includes("-----END PRIVATE KEY-----")
    ) {
      throw new Error(
        "FIREBASE_PRIVATE_KEY does not contain a valid PEM private key"
      );
    }

    const firebaseApp =
      getApps().length > 0
        ? getApps()[0]
        : initializeApp({
            credential: cert({
              projectId: projectId.trim(),
              clientEmail: clientEmail.trim(),
              privateKey: normalizedPrivateKey,
            }),
          });

    firebaseAuth = getAuth(firebaseApp);

    console.log("Firebase Admin initialized successfully");
  } catch (error) {
    firebaseInitializationError = error.message;

    console.error(
      "Firebase Admin initialization failed:",
      error.message
    );
  }
}

module.exports = {
  firebaseAuth,
  firebaseInitializationError,
};

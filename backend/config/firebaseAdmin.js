const {
  initializeApp,
  cert,
  getApps,
} = require("firebase-admin/app");

const { getAuth } = require("firebase-admin/auth");

let firebaseAuth = null;
let firebaseInitializationError = null;

const normalizePrivateKey = (value = "") => {
  let key = String(value).trim();

  if (!key) {
    return "";
  }

  // Remove an accidental environment-variable prefix.
  key = key.replace(/^FIREBASE_PRIVATE_KEY=/, "").trim();

  // Remove an accidental JSON property prefix.
  key = key.replace(/^["']?private_key["']?\s*:\s*/, "").trim();

  // Remove one pair of surrounding quotes.
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }

  // Decode escaped newlines used in environment variables.
  key = key.replace(/\\n/g, "\n");

  // Remove CRLF issues.
  key = key.replace(/\r/g, "");

  key = key.trim();

  // Absolutely foolproof PEM reconstruction if spaces replaced newlines:
  const beginStr = "-----BEGIN PRIVATE KEY-----";
  const endStr = "-----END PRIVATE KEY-----";

  if (key.includes(beginStr) && key.includes(endStr)) {
    // Extract base64 payload and strip ALL whitespace (including rogue spaces)
    let base64Payload = key
      .substring(key.indexOf(beginStr) + beginStr.length, key.indexOf(endStr))
      .replace(/\s+/g, "");

    // Break into 64-character chunks
    const chunks = [];
    for (let i = 0; i < base64Payload.length; i += 64) {
      chunks.push(base64Payload.substring(i, i + 64));
    }

    key = `${beginStr}\n${chunks.join("\n")}\n${endStr}\n`;
  }

  return key;
};

try {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

  const missing = [];

  if (!projectId) {
    missing.push("FIREBASE_PROJECT_ID");
  }

  if (!clientEmail) {
    missing.push("FIREBASE_CLIENT_EMAIL");
  }

  if (!rawPrivateKey) {
    missing.push("FIREBASE_PRIVATE_KEY");
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing Firebase environment variables: ${missing.join(", ")}`
    );
  }

  const privateKey = normalizePrivateKey(rawPrivateKey);

  if (
    !privateKey.startsWith("-----BEGIN PRIVATE KEY-----") ||
    !privateKey.endsWith("-----END PRIVATE KEY-----")
  ) {
    throw new Error(
      "FIREBASE_PRIVATE_KEY is not a valid PEM private key"
    );
  }

  const firebaseApp =
    getApps().length > 0
      ? getApps()[0]
      : initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
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

module.exports = {
  firebaseAuth,
  firebaseInitializationError,
};

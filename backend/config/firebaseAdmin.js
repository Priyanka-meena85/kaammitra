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
    let rawKey = privateKey.trim();
    
    // If the user accidentally pasted the ENTIRE JSON file into the private key field:
    if (rawKey.startsWith("{") && rawKey.endsWith("}")) {
      try {
        const parsedJson = JSON.parse(rawKey);
        if (parsedJson.private_key) {
          rawKey = parsedJson.private_key;
        }
      } catch (e) {
        // Ignore JSON parse error and try normal processing
      }
    }

    let normalizedPrivateKey = rawKey
      .replace(/^"(.*)"$/s, "$1") // Remove surrounding quotes if they copied with quotes
      .replace(/\\n/g, "\n")       // Convert literal \n to actual newlines
      .trim();

    const beginStr = "-----BEGIN PRIVATE KEY-----";
    const endStr = "-----END PRIVATE KEY-----";

    if (
      !normalizedPrivateKey.includes(beginStr) ||
      !normalizedPrivateKey.includes(endStr)
    ) {
      throw new Error(
        "FIREBASE_PRIVATE_KEY does not contain a valid PEM private key"
      );
    }

    // Absolutely foolproof PEM reconstruction:
    // Extract everything between the headers, strip ALL whitespace, and rebuild it.
    let base64Payload = normalizedPrivateKey
      .substring(
        normalizedPrivateKey.indexOf(beginStr) + beginStr.length,
        normalizedPrivateKey.indexOf(endStr)
      )
      .replace(/\s+/g, ""); // Remove all spaces, tabs, and newlines

    // Break into 64-character chunks (standard PEM format)
    const chunks = [];
    for (let i = 0; i < base64Payload.length; i += 64) {
      chunks.push(base64Payload.substring(i, i + 64));
    }

    normalizedPrivateKey = `${beginStr}\n${chunks.join("\n")}\n${endStr}\n`;

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

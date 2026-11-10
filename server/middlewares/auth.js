// Verifies the Firebase ID token in "Authorization: Bearer <token>" against Google's
// public keys (no service-account key needed) and attaches { sub, email, name } to req.user.
const { createRemoteJWKSet, jwtVerify } = require("jose");

const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
);

async function verifyFirebaseToken(token) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });
  return { sub: payload.sub, email: payload.email, name: payload.name };
}

function requireAuth(verify = verifyFirebaseToken) {
  return async (req, res, next) => {
    const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
    if (!token) return res.status(401).json({ error: "Login required" });
    try {
      req.user = await verify(token);
      next();
    } catch {
      res.status(401).json({ error: "Invalid or expired token" });
    }
  };
}

module.exports = { requireAuth, verifyFirebaseToken };

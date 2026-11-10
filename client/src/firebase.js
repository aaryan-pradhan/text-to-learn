import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase web config is public by design; security comes from the backend verifying ID tokens.
const app = initializeApp({
  apiKey: "AIzaSyBfM0QZeEKa_W5opF_tWTwFon4-xiRLvaQ",
  authDomain: "ai-course-generator-257c5.firebaseapp.com",
  projectId: "ai-course-generator-257c5",
  appId: "1:451861493205:web:97b874912697a1817bf95c",
});

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

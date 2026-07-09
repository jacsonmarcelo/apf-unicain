import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { Resend } from "resend";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
const configPath = path.join(process.cwd(), "firebase-applet-config.json");
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));

// Use service account if provided, otherwise fallback to default behavior (might need credentials in env)
let adminApp;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  adminApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: firebaseConfig.projectId,
  }); // Ensure this is called
} else {
  // Try to initialize without explicit cert if running in a Google environment
  adminApp = admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const db = getFirestore(adminApp, firebaseConfig.firestoreDatabaseId);
const resend = new Resend(process.env.RESEND_API_KEY);

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // API Routes
  
  // 1. Send OTP
  app.post("/api/auth/send-otp", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    try {
      // Store OTP in Firestore
      await db.collection("auth_otps").doc(email.toLowerCase()).set({
        otp,
        expiresAt,
      });

      // Send Email
      if (process.env.RESEND_API_KEY) {
        const { data, error } = await resend.emails.send({
          from: "FinanzaPulse <onboarding@resend.dev>",
          to: email,
          subject: `${otp} é seu código de acesso FinanzaPulse`,
          html: `
            <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #10b981;">FinanzaPulse</h2>
              <p>Use o código abaixo para entrar na sua conta:</p>
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b; margin: 20px 0;">${otp}</div>
              <p style="color: #64748b; font-size: 12px;">Este código expira em 10 minutos. Se você não solicitou este acesso, ignore este e-mail.</p>
            </div>
          `,
        });

        if (error) {
          console.error("Resend error:", error);
          return res.status(500).json({ error: "Failed to send email via Resend", details: error });
        }
        
        console.log("Email sent successfully:", data);
        res.json({ success: true, message: "OTP sent successfully" });
      } else {
        console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
        return res.json({ 
          success: true, 
          message: "OTP generated in DEV MODE.",
          warning: "RESEND_API_KEY is not configured on the server."
        });
      }
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      res.status(500).json({ error: "Failed to send OTP", details: error.message });
    }
  });

  // 2. Verify OTP
  app.post("/api/auth/verify-otp", async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: "Email and OTP are required" });

    try {
      let isValid = false;

      // Allow 123456 as test bypass if RESEND_API_KEY is missing
      if (!process.env.RESEND_API_KEY && otp === "123456") {
        isValid = true;
      } else {
        const otpDoc = await db.collection("auth_otps").doc(email.toLowerCase()).get();
        if (otpDoc.exists) {
          const data = otpDoc.data()!;
          if (data.otp === otp && Date.now() <= data.expiresAt) {
            isValid = true;
            await db.collection("auth_otps").doc(email.toLowerCase()).delete();
          }
        }
      }

      if (!isValid) {
        return res.status(401).json({ error: "Invalid or expired OTP" });
      }

      // Find or create user
      let userRecord;
      try {
        userRecord = await getAuth().getUserByEmail(email);
        if (!userRecord.emailVerified) {
          userRecord = await getAuth().updateUser(userRecord.uid, {
            emailVerified: true
          });
        }
      } catch (authError: any) {
        if (authError.code === "auth/user-not-found") {
          userRecord = await getAuth().createUser({
            email: email,
            displayName: email.split("@")[0],
            emailVerified: true
          });
        } else {
          throw authError;
        }
      }

      // Generate Custom Token
      const customToken = await getAuth().createCustomToken(userRecord.uid);
      
      res.json({ success: true, customToken });
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      res.status(500).json({ error: "Verification failed", details: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();

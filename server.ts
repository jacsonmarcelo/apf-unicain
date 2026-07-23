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
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // API Routes
  
  // 1. Send OTP
  app.post("/api/auth/send-otp", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const emailLower = email.toLowerCase().trim();

    try {
      // Check if the user exists and has an active subscription/approval
      const usersSnap = await db.collection("users").where("email", "==", emailLower).get();
      
      let isApproved = false;
      const isAdmin = emailLower === "jacsonmarcelo@gmail.com";
      
      if (isAdmin) {
        isApproved = true;
      } else if (!usersSnap.empty) {
        for (const doc of usersSnap.docs) {
          const data = doc.data();
          if (data.isSubscribed === true || data.isAdmin === true) {
            isApproved = true;
            break;
          }
        }
      }

      if (!isApproved) {
        return res.status(403).json({ 
          error: "Acesso restrito. Este e-mail não possui uma assinatura ativa ou não foi liberado no painel administrativo." 
        });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      // Store OTP in Firestore
      await db.collection("auth_otps").doc(emailLower).set({
        otp,
        expiresAt,
      });

      // Send Email
      if (process.env.RESEND_API_KEY) {
        try {
          let fromEmail = (process.env.RESEND_FROM_EMAIL || "").trim();
          // Strip any surrounding quotes if they were added in the environment configuration
          fromEmail = fromEmail.replace(/^['"]|['"]$/g, "").trim();
          
          if (!fromEmail || fromEmail.includes("resend.dev")) {
            fromEmail = "finanza@unicain.com.br";
          }
          console.log("Resend configuration debug:", {
            hasApiKey: !!process.env.RESEND_API_KEY,
            envFromEmail: process.env.RESEND_FROM_EMAIL,
            usingFromEmail: fromEmail,
            sendingTo: emailLower
          });
          const { data, error } = await resend.emails.send({
            from: `FinanzaPulse <${fromEmail}>`,
            to: emailLower,
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
            // Since this is an APPROVED user, we give a fallback notice so they can test if domain isn't verified in Resend
            return res.json({
              success: true,
              message: "OTP generated with fallback",
              warning: `Aviso de Homologação: O e-mail não pôde ser entregue pelo Resend devido a restrições da sua conta gratuita do Resend (ex: domínio não verificado ou e-mail de destino não autorizado).\n\nPara fins de teste, use este código de acesso:\n👉 ${otp} 👈`
            });
          }
          
          console.log("Email sent successfully:", data);
          res.json({ success: true, message: "OTP sent successfully" });
        } catch (sendErr: any) {
          console.error("Resend send connection exception:", sendErr);
          return res.json({
            success: true,
            message: "OTP generated with fallback",
            warning: `Aviso de Homologação: Falha na conexão com o serviço Resend (${sendErr.message}).\n\nPara fins de teste, use este código de acesso:\n👉 ${otp} 👈`
          });
        }
      } else {
        console.log(`[DEV MODE] OTP for ${emailLower}: ${otp}`);
        return res.json({ 
          success: true, 
          message: "OTP generated in DEV MODE.",
          warning: `Aviso de Homologação: RESEND_API_KEY não configurada no servidor.\n\nPara fins de teste, use este código de acesso:\n👉 ${otp} 👈`
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

      // Allow 123456 as a universal master test bypass code, or verify the actual stored OTP
      if (otp === "123456") {
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

      // Generate Custom Token with verified email claims
      const customToken = await getAuth().createCustomToken(userRecord.uid, {
        email_verified: true,
        email: email.toLowerCase().trim()
      });
      
      res.json({ success: true, customToken });
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      res.status(500).json({ error: "Verification failed", details: error.message });
    }
  });

  // 3. Send Beta Approval Welcome Email
  app.post("/api/admin/send-approval-email", async (req, res) => {
    const { email, name, appUrl } = req.body;
    if (!email) return res.status(400).json({ error: "E-mail é obrigatório" });

    const targetEmail = email.toLowerCase().trim();
    const userName = name || "Membro Beta";
    const targetUrl = appUrl || "https://finanza.unicain.com.br";

    try {
      if (process.env.RESEND_API_KEY) {
        let fromEmail = (process.env.RESEND_FROM_EMAIL || "").trim();
        fromEmail = fromEmail.replace(/^['"]|['"]$/g, "").trim();
        
        if (!fromEmail || fromEmail.includes("resend.dev")) {
          fromEmail = "finanza@unicain.com.br";
        }

        const { data, error } = await resend.emails.send({
          from: `Finanza <${fromEmail}>`,
          to: targetEmail,
          subject: "🎉 Seu acesso ao Finanza Beta foi aprovado!",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #090d16; color: #f1f5f9; margin: 0; padding: 0; }
                .container { max-width: 580px; margin: 30px auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
                .header { background: linear-gradient(135deg, #090d16 0%, #0f172a 100%); padding: 32px 28px 24px; text-align: center; border-bottom: 1px solid #1e293b; }
                .logo { font-size: 22px; font-weight: 800; color: #10b981; letter-spacing: -0.5px; text-decoration: none; }
                .badge { display: inline-block; background-color: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); font-size: 11px; font-weight: bold; text-transform: uppercase; padding: 4px 12px; border-radius: 9999px; margin-top: 12px; letter-spacing: 1px; }
                .content { padding: 32px 28px; line-height: 1.6; }
                .h1 { font-size: 24px; font-weight: bold; color: #ffffff; margin-top: 0; margin-bottom: 16px; text-align: center; }
                .p { color: #cbd5e1; font-size: 15px; margin-bottom: 16px; }
                .highlight-box { background-color: #1e293b; border-left: 4px solid #10b981; padding: 20px; border-radius: 12px; margin: 24px 0; }
                .step { margin-bottom: 12px; font-size: 14px; color: #e2e8f0; }
                .step-num { font-weight: bold; color: #10b981; margin-right: 8px; }
                .cta-container { text-align: center; margin: 32px 0 20px; }
                .button { display: inline-block; background-color: #10b981; color: #090d16; font-weight: 800; font-size: 15px; padding: 16px 32px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35); }
                .footer { background-color: #090d16; padding: 24px 28px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; }
                .footer a { color: #10b981; text-decoration: none; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="logo">FINANZA</div>
                  <div class="badge">Sistema de Evolução Financeira</div>
                </div>
                <div class="content">
                  <div class="h1">Seu acesso foi liberado! 🎉</div>
                  <p class="p">Olá, <strong>${userName}</strong>!</p>
                  <p class="p">Temos o prazer de informar que sua solicitação para participar da fase <strong>Beta Exclusiva do Finanza</strong> foi aprovada com sucesso.</p>
                  <p class="p">Sua conta já está cadastrada e liberada no nosso sistema com o e-mail: <strong style="color: #10b981;">${targetEmail}</strong>.</p>
                  
                  <div class="highlight-box">
                    <div style="font-weight: bold; color: #ffffff; margin-bottom: 12px; font-size: 15px;">🚀 Como acessar sua conta:</div>
                    <div class="step"><span class="step-num">1.</span> Acesse a plataforma oficial: <a href="${targetUrl}" style="color:#10b981; text-decoration:underline;">${targetUrl}</a></div>
                    <div class="step"><span class="step-num">2.</span> Clique em <strong>"Já tenho acesso"</strong> no topo da página.</div>
                    <div class="step"><span class="step-num">3.</span> Digite seu e-mail <strong>${targetEmail}</strong> para receber seu código de verificação ou entre direto com sua conta Google.</div>
                    <div class="step"><span class="step-num">4.</span> Inicie seus lançamentos e acompanhe sua evolução patrimonial em tempo real.</div>
                  </div>

                  <div class="cta-container">
                    <a href="${targetUrl}" class="button">Acessar o Finanza Agora →</a>
                  </div>
                </div>
                <div class="footer">
                  <p style="margin:0 0 8px;">Dúvidas ou sugestões? Responda diretamente a este e-mail.</p>
                  <p style="margin:0;">Finanza • <a href="${targetUrl}">${targetUrl}</a></p>
                </div>
              </div>
            </body>
            </html>
          `,
        });

        if (error) {
          console.error("Erro ao enviar e-mail via Resend:", error);
          return res.json({
            success: true,
            warning: `Acesso liberado! Aviso de envio de e-mail: ${error.message || 'Restrição do provedor de e-mail.'}`
          });
        }

        return res.json({
          success: true,
          message: "E-mail de aprovação enviado com sucesso!",
          data
        });
      } else {
        console.log(`[DEV MODE] E-mail de aprovação enviado virtualmente para ${targetEmail} (${userName}).`);
        return res.json({
          success: true,
          message: "Acesso aprovado! (Dev mode: e-mail registrado nos logs do servidor)."
        });
      }
    } catch (err: any) {
      console.error("Exceção ao enviar e-mail de aprovação:", err);
      return res.status(500).json({ error: "Falha ao enviar e-mail", details: err.message });
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

import express from "express";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import cors from "cors";
import { ethers } from "ethers";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

// Validate required environment variables
const requiredEnvVars = ["WEB3AUTH_CLIENT_ID", "PORT"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Configure JWKS client to fetch Web3Auth's public key
const client = jwksClient({
  jwksUri: "https://api-auth.web3auth.io/jwks",
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 3600000, 
  rateLimit: true,
  jwksRequestsPerMinute: 5,
});

console.log("JWKS client initialized");

// Utility function to get signing key
const getKey = (header, callback) => {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      console.error("Error fetching signing key:", err);
      return callback(err);
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
};

// Utility function to verify JWT
const verifyToken = (idToken) => {
  return new Promise((resolve, reject) => {
    if (!idToken) {
      return reject(new Error("ID token is required"));
    }
    jwt.verify(
      idToken,
      getKey,
      {
        algorithms: ["ES256"],
        issuer: "https://api-auth.web3auth.io",
        audience: process.env.WEB3AUTH_CLIENT_ID,
      },
      (err, decoded) => {
        if (err) {
          console.error("Token verification failed:", err);
          return reject(new Error("Token verification failed"));
        }
        resolve(decoded);
      }
    );
  });
};

// Middleware to verify token
const authMiddleware = async (req, res, next) => {
  const { idToken } = req.body;
  try {
    const payload = await verifyToken(idToken);
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

// API endpoint to verify token and return user data
app.post("/verify", authMiddleware, async (req, res) => {
  try {
    const { email, name, verifierId } = req.user;
    console.log("Verified ID:", verifierId, "Email:", email, "Name:", name);
    res.json({
      success: true,
      user: { email, name, verifierId },
    });
  } catch (error) {
    console.error("Error in /verify endpoint:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API endpoint to process private key from frontend
app.post("/process-keys", authMiddleware, async (req, res) => {
  try {
    const { privateKey } = req.body;
    console.log("Received Private Key:", privateKey);
    if (!privateKey) {
      return res.status(400).json({ error: "Private key is required" });
    }
    if (!privateKey.startsWith("0x") || privateKey.length !== 66) {
      return res.status(400).json({ error: "Invalid private key format" });
    }

    const wallet = new ethers.Wallet(privateKey);
    const publicKey = wallet.publicKey;
    const address = wallet.address;
    console.log("Processed Wallet:", wallet);
    console.log("Processed Public Key:", publicKey);

    console.log("Processed Address:", address);
    // Do not log privateKey in production to avoid security risks

    res.json({
      success: true,
      publicKey,
      address,
    });
  } catch (error) {
    console.error("Error in /process-keys endpoint:", error);
    res.status(500).json({ error: "Failed to process keys" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
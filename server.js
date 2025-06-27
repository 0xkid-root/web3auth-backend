import express from "express";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import cors from "cors";
import { ethers } from "ethers";

const app = express();
app.use(cors({ origin: "http://localhost:5173" })); 
app.use(express.json());

// Configure JWKS client to fetch Web3Auth's public key
const client = jwksClient({
  jwksUri: "https://api-auth.web3auth.io/jwks",
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
});

console.log("JWKS client initialized", client);

const getKey = (header, callback) => {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
};

const verifyToken = (idToken) => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      idToken,
      getKey,
      {
        algorithms: ["ES256"],
        issuer: "https://api-auth.web3auth.io",
        audience: "BI0orjBmrDL-uiYLcrZ7uwH6jczl6Fatfh4N4GLY0voY5oJ_3U2BN7QAzejT1mmbne5VtR_0_16wM4jDKq7M_UE", // Your Client ID
      },
      (err, decoded) => {
        if (err) {
          return reject(new Error("Token verification failed: " + err.message));
        }
        resolve(decoded);
      }
    );
  });
};

// API endpoint to verify token and return user data
app.post("/verify", async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ error: "ID token is required" });
  }

  try {
    const payload = await verifyToken(idToken);
    console.log("Decoded payload:", payload);
    res.json({
      success: true,
      user: {
        email: payload.email,
        name: payload.name,
        verifierId: payload.verifierId,
      },
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

app.post("/get-keys", async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ error: "ID token is required" });
  }

  try {
    const payload = await verifyToken(idToken);
    // const privateKey = await provider.request({
    //             method: "private_key",
    //           });
              
    // console.log("Private Key:", privateKey);
    //           const publicaddress=new ethers.Wallet(privateKey);
    //           console.log("Public Address:", publicaddress);
    
    // Mocked private key (replace with actual Web3Auth server-side fetch in production)
    const privateKey = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    const wallet = new ethers.Wallet(privateKey);
    const publicKey = wallet.publicKey;
    const address = wallet.address;

    res.json({
      success: true,
      privateKey, // Avoid returning this in production
      publicKey,
      address,
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// API endpoint to sign a transaction (secure alternative)
app.post("/send-transaction", async (req, res) => {
  const { idToken, to, value } = req.body;
  if (!idToken || !to || !value) {
    return res.status(400).json({ error: "ID token, to address, and value are required" });
  }

  try {
    const payload = await verifyToken(idToken);
    // Mocked private key (replace with actual Web3Auth server-side fetch in production)
    const privateKey = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    const provider = new ethers.JsonRpcProvider("https://rpc.ankr.com/eth_goerli");
    const wallet = new ethers.Wallet(privateKey, provider);
    const tx = await wallet.sendTransaction({
      to,
      value: ethers.parseEther(value),
    });
    await tx.wait();

    res.json({
      success: true,
      txHash: tx.hash,
      user: payload.email,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
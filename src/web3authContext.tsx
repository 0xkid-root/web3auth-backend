// web3AuthContextConfig.js
import { WEB3AUTH_NETWORK } from "@web3auth/modal";
import { type Web3AuthContextConfig } from "@web3auth/modal/react";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";

const clientId = "BI0orjBmrDL-uiYLcrZ7uwH6jczl6Fatfh4N4GLY0voY5oJ_3U2BN7QAzejT1mmbne5VtR_0_16wM4jDKq7M_UE"; 

const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions: {
    clientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,

    uiConfig: {
      appName: "Your App Name",
      loginMethodsOrder: ["google", "email_passwordless"], 
      defaultLanguage: "en",
    },
  },
  adapters: [
    new OpenloginAdapter({
      adapterSettings: {
        network: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
        clientId,
        // Enable private key export
        privateKeyProvider: {
          exportPrivateKey: true,
        },
        // Configure Google login (matches your userInfo)
        loginConfig: {
          google: {
            verifier: "web3auth-google-sapphire-devnet", // From Web3Auth Dashboard
            typeOfLogin: "google",
            clientId, // Web3Auth client ID
          },
        },
      },
    }),
  ],
};

export default web3AuthContextConfig;
import "./App.css";
import { useWeb3AuthConnect, useWeb3AuthDisconnect, useWeb3AuthUser } from "@web3auth/modal/react";
import { useAccount } from "wagmi";
import { Balance } from "./components/getBalance";
import { SwitchChain } from "./components/switchNetwork";
import axios from "axios";
import { useEffect } from "react";

function App() {
  const { connect, isConnected, connectorName, loading: connectLoading, error: connectError } = useWeb3AuthConnect();
  const { disconnect, loading: disconnectLoading, error: disconnectError } = useWeb3AuthDisconnect();
  const { userInfo } = useWeb3AuthUser();
  const { address } = useAccount();

  console.log("address is here", address);
  console.log("connect", connect);
  console.log("connectorName is here", connectorName);
  console.log("userinfo is here@@@@@", userInfo);

  // Log userInfo updates
  useEffect(() => {
    console.log("Updated userInfo:", userInfo);
    console.log("Updated ID Token:", userInfo?.idToken);
  }, [userInfo]);

  interface UIConsoleArg {
    [key: string]: unknown;
  }

  function uiConsole(...args: UIConsoleArg[]): void {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
      console.log("UI Console:", ...args);
    }
  }

  const handleConnect = async () => {
    try {
      const provider = await connect();
      console.log("Connected to provider:", provider);
    } catch (error) {
      console.error("Connection failed:", error);
      uiConsole({ error: error || "Connection failed" });
    }
  };

  // Handle token verification and key processing
  useEffect(() => {
    const fetchUserData = async (provider: any) => {
      console.log("fetchData - Provider:", provider);
      console.log("fetchData - UserInfo:", userInfo);
      if (!provider || !userInfo?.idToken) {
        console.log("Provider or ID Token missing:", { provider, idToken: userInfo?.idToken });
        return;
      }

      try {
        // Verify token
        console.log("ID Token before verify:", userInfo.idToken);
        const verifyResponse = await axios.post("http://localhost:3000/verify", {
          idToken: userInfo.idToken,
        });
        console.log("Token verified response:", verifyResponse);
        console.log("User verified:", verifyResponse.data.user);
        uiConsole({ user: verifyResponse.data.user });

        // Fetch secp256k1 private key
        const privateKeyRaw = await provider.request({
          method: "private_key",
          params: { curve: "secp256k1" }, // Specify secp256k1 curve
        });
        // Ensure private key has 0x prefix
        const privateKey = privateKeyRaw.startsWith("0x") ? privateKeyRaw : `0x${privateKeyRaw}`;
        console.log("Private Key (sanitized, not logged in production):", privateKey.length);

        // Send private key to backend
        const keyResponse = await axios.post("http://localhost:3000/process-keys", {
          idToken: userInfo.idToken,
          privateKey,
        });
        console.log("Keys response from backend:", keyResponse.data);
        uiConsole({ keys: keyResponse.data });
      } catch (error: any) {
        console.error("Failed to verify token or process keys:", error);
        console.log("Error details:", { message: error.message, response: error.response, status: error.status });
        uiConsole({ error: error.message || "Operation failed" });
      }
    };

    if (isConnected && userInfo) {
      const getProvider = async () => {
        try {
          const provider = await connect();
          fetchUserData(provider);
        } catch (error : any) {
          console.error("Failed to get provider:", error);
          uiConsole({ error: error.message || "Failed to get provider" });
        }
      };
      getProvider();
    }
  }, [isConnected, userInfo, connect]);

  const loggedInView = (
    <div className="grid">
      <h2>Connected to {connectorName}</h2>
      <div>{address}</div>
      <div className="flex-container">
        <div>
          <button onClick={() => uiConsole({ userInfo })} className="card">
            Get User Info
          </button>
        </div>
        <div>
          <button onClick={() => disconnect()} className="card">
            Log Out
          </button>
          {disconnectLoading && <div className="loading">Disconnecting...</div>}
          {disconnectError && <div className="error">{disconnectError.message}</div>}
        </div>
      </div>
      <Balance />
      <SwitchChain />
    </div>
  );

  const unloggedInView = (
    <div className="grid">
      <button onClick={handleConnect} className="card">
        Login
      </button>
      {connectLoading && <div className="loading">Connecting...</div>}
      {connectError && <div className="error">{connectError.message}</div>}
    </div>
  );

  return (
    <div className="container">
      <h1 className="title">
        <a target="_blank" href="#" rel="noreferrer">
          Web3Auth{" "}
        </a>
        using my project
      </h1>
      {isConnected ? loggedInView : unloggedInView}
      <div id="console" style={{ whiteSpace: "pre-line" }}>
        <p style={{ whiteSpace: "pre-line" }}></p>
      </div>
    </div>
  );
}

export default App;
import "./App.css";
import { useWeb3AuthConnect, useWeb3AuthDisconnect, useWeb3AuthUser } from "@web3auth/modal/react";
import { useAccount } from "wagmi";
import { SendTransaction } from "./components/sendTransaction";
import { Balance } from "./components/getBalance";
import { SwitchChain } from "./components/switchNetwork";
import axios from "axios";
import { useState, useEffect } from "react";

function App() {
  const { connect, isConnected, connectorName, loading: connectLoading, error: connectError } = useWeb3AuthConnect();
  const { disconnect, loading: disconnectLoading, error: disconnectError } = useWeb3AuthDisconnect();
  const { userInfo } = useWeb3AuthUser();
  const { address } = useAccount();
  const [txForm, setTxForm] = useState({ to: "", value: "" });

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

  // Handle token verification and key fetching when userInfo is available
  useEffect(() => {
    const fetchData = async (provider: any) => {
      console.log("fetchData - Provider:", provider);
      console.log("fetchData - UserInfo:", userInfo);
      if (provider) {
        try {
          if (!userInfo || !userInfo.idToken) {
            console.log("UserInfo or ID Token missing:", userInfo);
            return;
          }
          console.log("ID Token before verify:", userInfo.idToken);
          const verifyResponse = await axios.post("http://localhost:3000/verify", {
            idToken: userInfo.idToken,
          });
          console.log("Token verified response:", verifyResponse);
          console.log("User verified:", verifyResponse.data.user);
          uiConsole({ user: verifyResponse.data.user });

          const keyResponse = await axios.post("http://localhost:3000/get-keys", {
            idToken: userInfo.idToken,
          });
          console.log("Keys response:", keyResponse.data);
          uiConsole({ keys: keyResponse.data });
        } catch (error) {
          console.error("Failed to verify token or fetch keys:", error);
          console.log("Error details:", {
            message: error,
            response: error,
            status: error,
          });
          uiConsole({ error: error || "Operation failed" });
        }
      } else {
        console.log("Provider or ID Token missing:", { provider, idToken: userInfo?.idToken });
      }
    };

    if (isConnected && userInfo) {
      const getProvider = async () => {
        try {
          const provider = await connect();
          fetchData(provider);
        } catch (error) {
          console.error("Failed to get provider:", error);
          uiConsole({ error: error || "Failed to get provider" });
        }
      };
      getProvider();
    }
  }, [isConnected, userInfo, connect]);

  const handleSendTransaction = async () => {
    try {
      if (!userInfo?.idToken || !txForm.to || !txForm.value) {
        uiConsole({ error: "Please fill in all transaction fields" });
        return;
      }
      const response = await axios.post("http://localhost:3000/send-transaction", {
        idToken: userInfo.idToken,
        to: txForm.to,
        value: txForm.value,
      });
      console.log("Transaction sent:", response.data);
      uiConsole({ transaction: response.data });
    } catch (error) {
      console.error("Transaction failed:", error);
      uiConsole({ error: error || "Transaction failed" });
    }
  };

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
      <div className="transaction-form">
        <h3>Send Transaction</h3>
        <input
          type="text"
          placeholder="To Address"
          value={txForm.to}
          onChange={(e) => setTxForm({ ...txForm, to: e.target.value })}
        />
        <input
          type="text"
          placeholder="Value (ETH)"
          value={txForm.value}
          onChange={(e) => setTxForm({ ...txForm, value: e.target.value })}
        />
        <button onClick={handleSendTransaction} className="card">
          Send Transaction
        </button>
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
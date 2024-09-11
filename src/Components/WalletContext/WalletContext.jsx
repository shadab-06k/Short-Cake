import React, { createContext, useEffect, useState } from "react";
import { Bounce, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  PublicKey,
  Transaction,
  Connection,
  Keypair,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  getAccount,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
  // sendAndConfirmTransaction
} from "@solana/spl-token";

// Create the context
const WalletContext = createContext();

// Define the mint addresses for the tokens
const mintPublicKeys = {
  BONK: new PublicKey("498bK2F1fCNPsHWdTFiXr8dw51p3SAC4tHPzgRpDUo3j"),
  WIF: new PublicKey("6tJrEXMyKN3AB6AMG89TnkegqiUDwKjqaeKkAxJt9amM"),
  FLOKI: new PublicKey("n1EhuBLt5vjZxV3JRojEFUzZbJEdERt5sBXaJBVnXCM"),
  SHIB: new PublicKey("2tKPAw5tJZV6T9q8NrUTLcNzXrnxKHD6NxyHitURpSXj"),
  CORGIAI: new PublicKey("5EJnnu56ESrkaVtUBZqy4GHChGMEgwvNuQNqAzUivP63"),
};

// Provider component
const WalletProvider = ({ children }) => {
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(null);
  const [provider, setProvider] = useState(null);
  const [tokenBalances, setTokenBalances] = useState({});
  const [transactionStatus, setTransactionStatus] = useState(null);

  const ipUrl = "http://192.168.1.19:9000";

  const checkIfPhantomInstalled = () => {
    return (
      typeof window !== "undefined" && window.solana && window.solana.isPhantom
    );
  };

  const connectWallet = async () => {
    if (checkIfPhantomInstalled()) {
      try {
        const response = await window.solana.connect();
        const userAddress = response.publicKey.toString();
        console.log("Connected Address:", userAddress);

        setAddress(userAddress);
        setProvider(window.solana);

        // Fetch and set the balance for all tokens after connecting the wallet
        await fetchAllTokenBalances(userAddress);
        await connectWalletApi(userAddress);
        setAddress(userAddress);

        toast.success(`Wallet connected: ${userAddress}`, {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Bounce,
        });
      } catch (err) {
        console.error("Failed to connect Phantom wallet:", err.message);
        toast.error("Failed to connect Phantom wallet");
      }
    } else {
      console.log("Please install Phantom Wallet");
      toast.warn("Please install Phantom Wallet");
    }
  };

  useEffect(() => {
    if (address) {
      fetchAllTokenBalances(address);
    }
  }, [address]);

  // Function to fetch balance for all tokens
  const fetchAllTokenBalances = async (userAddress) => {
    const balances = {};
    for (const [symbol, mintPublicKey] of Object.entries(mintPublicKeys)) {
      balances[symbol] = await getTokenBalance(userAddress, mintPublicKey);
    }
    setTokenBalances(balances);
  };

  // Function to fetch token balance for a specific token
  const getTokenBalance = async (userAddress, mintPublicKey) => {
    try {
      const connection = new Connection(
        "https://api.devnet.solana.com",
        "confirmed"
      );
      const walletPublicKey = new PublicKey(
        "F4uq3AB7uVBN28MehoV73KPQhXehMMi3A4BMij1tN2tD"
      );

      const associatedTokenAccount = await getAssociatedTokenAddress(
        // mintPublicKey,
        new PublicKey(mintPublicKey),
        walletPublicKey
      );
      console.log("associatedTokenAccount => ", associatedTokenAccount);

      const accountInfo = await getAccount(connection, associatedTokenAccount);
      console.log("accountInfom =>", accountInfo);

      const balance = Number(accountInfo.amount) / 10 ** 6;
      console.log("balance => ", balance);
      return balance;
    } catch (error) {
      console.error("Error fetching token balance:", error);
      return 0;
    }
  };

  const connectWalletApi = async (userAddress) => {
    try {
      const res = await fetch(`${ipUrl}/shortcake/v1/connect-wallet`, {
        method: `POST`,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: userAddress,
        }),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("data response => ", data);
    } catch (error) {
      console.log("Error fetching data: ", error);
    }
  };

  // Updated transferTokenApi to handle dynamic mintAddress
  const transferTokenApi = async (mintPublicKey, amount) => {
    try {
      // const mintAddress = mintPublicKeys[tokenSymbol].toString(); // Get the correct mintAddress based on the tokenSymbol
      const res = await fetch(`${ipUrl}/shortcake/v1/deposit-pool`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: address,
          amount: amount,
          mintAddress: mintPublicKey,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("data response => ", data);
    } catch (error) {
      console.log("Error fetching data: ", error);
    }
  };

  const transferToken = async (tokenSymbol, recipientAddress, amount) => {
    try {
      if (!provider || !provider.isConnected) {
        throw new Error("Phantom wallet not connected");
      }

      const senderPublicKey = provider.publicKey;
      const connection = new Connection(
        "https://api.devnet.solana.com",
        "confirmed"
      );

      // Fetch the mint public key dynamically based on the token symbol
      const mintPublicKey = mintPublicKeys[tokenSymbol];
      if (!mintPublicKey && !transferTokenApi) {
        throw new Error(
          `Mint public key not found for token symbol: ${tokenSymbol}`
        );
      }

      const recipientPublicKey = new PublicKey(recipientAddress);
      console.log("recipientAddress => ", recipientAddress);

      console.log("recipientPublicKey => ", recipientPublicKey);

      // Get sender's associated token account
      const senderTokenAccount = await getAssociatedTokenAddress(
        // mintPublicKey,
        new PublicKey(mintPublicKey),
        senderPublicKey
      );

      // Check if sender's associated token account exists
      try {
        await getAccount(connection, senderTokenAccount);
      } catch (error) {
        throw new Error(
          "Sender's associated token account does not exist or is invalid"
        );
      }

      // Get recipient's associated token account
      const recipientTokenAccount = await getAssociatedTokenAddress(
        // mintPublicKey,
        new PublicKey(mintPublicKey),
        recipientPublicKey
      );
      console.log("recipientTokenAccount => ", recipientTokenAccount);

      // Check if recipient's associated token account exists
      try {
        await getAccount(connection, recipientTokenAccount);
      } catch (error) {
        throw new Error(
          "Recipient's associated token account does not exist or is invalid"
        );
      }

      const { blockhash } = await connection.getLatestBlockhash();

      const smallestUnitAmount = amount * Math.pow(10, 6);

      console.log(
        "smallestUnitAmount WC page transferToken ===>>>",
        smallestUnitAmount
      );
      // Create the transfer transaction
      const transaction = new Transaction().add(
        createTransferInstruction(
          senderTokenAccount,
          recipientTokenAccount,
          senderPublicKey,
          // amount * Math.pow(10, 6), // Adjust decimals as needed
          smallestUnitAmount,
          [],
          TOKEN_PROGRAM_ID
        )
      );

      transaction.recentBlockhash = blockhash;
      transaction.feePayer = senderPublicKey;

      // Sign and send the transaction
      const signedTransaction = await window.solana.signTransaction(
        transaction
      );
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize()
      );
      await connection.confirmTransaction(signature, "processed");

      // Fetch the updated token balances
      await fetchAllTokenBalances(address);
      await transferTokenApi(new PublicKey(mintPublicKey), amount);

      setTransactionStatus(
        "Transaction successful with signature: " + signature
      );
      toast.success("Transaction successful!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
    } catch (error) {
      console.error("Transaction failed", error);
      setTransactionStatus("Transaction failed: " + error.message);
      toast.error("Transaction failed", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
    }
  };

  const withdrawTokenApi = async (mintPublicKey) => {
    try {
      // const mintAddress = mintPublicKeys[tokenSymbol].toString(); // Get the correct mintAddress based on the tokenSymbol
      // Ensure address and mintPublicKey are properly defined
      if (!address || !mintPublicKey) {
        throw new Error("Missing walletAddress or mintPublicKey");
      }

      // Log the values being sent to the API for debugging
      console.log("walletAddress:", address);
      console.log("mintPublicKey:", mintPublicKey);
      const res = await fetch(`${ipUrl}/shortcake/v1/withdraw-pool`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: address,
          // amount: amount,
          mintAddress: mintPublicKey,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("data response => ", data);
    } catch (error) {
      console.log("Error fetching data: ", error);
    }
  };

  const withdrawToken = async (tokenSymbol, amount) => {
    try {
      const connection = new Connection(
        "https://api.devnet.solana.com",
        "confirmed"
      );

      // Fetch the mint public key dynamically based on the token symbol
      const mintPublicKey = mintPublicKeys[tokenSymbol];
      if (!mintPublicKey && !withdrawTokenApi) {
        throw new Error(
          `Mint public key not found for token symbol: ${tokenSymbol}`
        );
      }

      const receiver = new PublicKey(address); // The address to which we are withdrawing
      const senderKeypair = Keypair.fromSecretKey(
        Uint8Array.from([
          99, 153, 185, 2, 176, 202, 136, 24, 48, 36, 90, 13, 91, 36, 51, 211,
          124, 5, 233, 93, 51, 220, 224, 11, 254, 245, 14, 227, 0, 11, 18, 241,
          209, 4, 23, 171, 179, 194, 18, 176, 121, 103, 10, 192, 157, 32, 23,
          61, 105, 211, 36, 61, 96, 8, 12, 131, 122, 122, 139, 206, 238, 217,
          25, 54,
        ])
      );

      const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        senderKeypair, 
        // mintPublicKey, // Mint
        new PublicKey(mintPublicKey),
        senderKeypair.publicKey // Owner of the token account
      );

      const receiverTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        senderKeypair, // Payer of the transaction
        // mintPublicKey, // Mint
        new PublicKey(mintPublicKey),
        receiver // Owner of the token account
      );

      console.log("amount WC page withdrawToken ===>>>", amount);

      // Create the transfer instruction
      const transferInstruction = createTransferInstruction(
        senderTokenAccount.address, // Source account (sender's token account)
        receiverTokenAccount.address, // Destination account (receiver's token account)
        senderKeypair.publicKey, // Owner of the source account (sender)
        amount, // Amount to transfer (in the smallest units, e.g., 1 token if 6 decimals)
        [], // Signers (if any additional ones are required)
        TOKEN_PROGRAM_ID // SPL Token Program ID
      );

      // Create a transaction and add the transfer instruction
      const transaction = new Transaction().add(transferInstruction);

      // Sign and send the transaction
      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [senderKeypair]
      );

      console.log("Transaction confirmed with signature1:", signature);

      // Update the token balances
      await fetchAllTokenBalances(provider.publicKey.toString());
      await withdrawTokenApi(new PublicKey(mintPublicKey));

      // Set transaction status and show success message
      setTransactionStatus("Withdraw successful with signature: " + signature);
      toast.success("Withdraw successful!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
    } catch (error) {
      console.error("Withdraw failed", error);
      setTransactionStatus("Withdraw failed: " + error.message);
      toast.error("Withdraw failed", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
    }
  };
  const transferTokenShort = async (
    tokenSymbol,
    recipientAddress,
    amount,
    multiplier,
    orderType
  ) => {
    try {
      if (!provider || !provider.isConnected) {
        throw new Error("Phantom wallet not connected");
      }

      const senderPublicKey = provider.publicKey;
      const connection = new Connection(
        "https://api.devnet.solana.com",
        "confirmed"
      );

      // Fetch the mint public key dynamically based on the token symbol
      const mintPublicKey = mintPublicKeys[tokenSymbol];
      if (!mintPublicKey) {
        throw new Error(
          `Mint public key not found for token symbol: ${tokenSymbol}`
        );
      }

      const recipientPublicKey = new PublicKey(recipientAddress);
      console.log("mintPublicKey   ============= >>>>>>>", mintPublicKey);

      // Get sender's associated token account
      const senderTokenAccount = await getAssociatedTokenAddress(
        // mintPublicKey,
        new PublicKey(mintPublicKey),
        senderPublicKey
      );

      // Check if sender's associated token account exists
      try {
        await getAccount(connection, senderTokenAccount);
      } catch (error) {
        throw new Error(
          "Sender's associated token account does not exist or is invalid"
        );
      }

      // Get recipient's associated token account
      console.log("mintPublicKey ====>>>>>", mintPublicKey);
      console.log("recipientPublicKey ====>>>>>", recipientPublicKey);

      const recipientTokenAccount = await getAssociatedTokenAddress(
        new PublicKey(mintPublicKey),
        recipientPublicKey
      );

      // Check if recipient's associated token account exists
      try {
        await getAccount(connection, recipientTokenAccount);
      } catch (error) {
        throw new Error(
          "Recipient's associated token account does not exist or is invalid"
        );
      }

      const { blockhash } = await connection.getLatestBlockhash();

      // Convert the amount to the smallest unit (e.g., for a token with 6 decimals)
      const smallestUnitAmount = Math.round(amount * Math.pow(10, 6));
      console.log(
        "smallestUnitAmount WC page transferTokenShort ===>>>",
        smallestUnitAmount
      );

      // Create the transfer transaction
      const transaction = new Transaction().add(
        createTransferInstruction(
          senderTokenAccount,
          recipientTokenAccount,
          senderPublicKey,
          // amount * Math.pow(10, 6), // Adjust decimals as needed
          smallestUnitAmount,
          [],
          TOKEN_PROGRAM_ID
        )
      );

      transaction.recentBlockhash = blockhash;
      transaction.feePayer = senderPublicKey;

      // Sign and send the transaction
      const signedTransaction = await window.solana.signTransaction(
        transaction
      );
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize()
      );
      await connection.confirmTransaction(signature, "processed");

      // Fetch the updated token balances
      await fetchAllTokenBalances(address);

      // After the transfer is successful, call handleOnShort
      await handleOnShort(
        new PublicKey(mintPublicKey),
        amount,
        multiplier,
        orderType
      );

      setTransactionStatus(
        "Transaction and Short operation successful with signature: " +
          signature
      );
      toast.success("Transaction and Short operation successful!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
    } catch (error) {
      console.error("Transaction or Short operation failed", error);
      setTransactionStatus(
        "Transaction or Short operation failed: " + error.message
      );
      toast.error("Transaction or Short operation failed", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
    }
  };

  const handleOnShort = async (
    mintPublicKey,
    amount,
    multiplier,
    orderType
  ) => {
    try {
      const res = await fetch(`${ipUrl}/shortcake/v1/open-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: address,
          amount: amount,
          mintAddress: mintPublicKey,
          leverage: multiplier,
          orderType: orderType,
          // "userAddress":"BgcjxR8ewRAmzmgbndaVJsKXRPxvjbvTrup1MXLV8DBS",
          // "mintAddress":"498bK2F1fCNPsHWdTFiXr8dw51p3SAC4tHPzgRpDUo3j",
          // amount:1000,
          // "leverage":2,
          // "orderType":"short"
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("data response => ", data);
    } catch (error) {
      console.log("Error fetching data: ", error);
    }
  };

  const onCloseOrders = async (mintPublicKey, orderId) => {
    try {
      const res = await fetch(`${ipUrl}/shortcake/v1/close-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: address,
          mintAddress: mintPublicKey,
          orderId: orderId,

          // "userAddress":"BgcjxR8ewRAmzmgbndaVJsKXRPxvjbvTrup1MXLV8DBS",
          // "mintAddress":"498bK2F1fCNPsHWdTFiXr8dw51p3SAC4tHPzgRpDUo3j",
          // amount:1000,
          // "leverage":2,
          // "orderType":"short"
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("data response => ", data);
    } catch (error) {
      console.log("Error fetching data: ", error);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        tokenBalances,
        connectWallet,
        fetchAllTokenBalances,
        transferToken,
        withdrawToken,
        handleOnShort,
        transferTokenShort,
        onCloseOrders,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export { WalletContext, WalletProvider, mintPublicKeys };

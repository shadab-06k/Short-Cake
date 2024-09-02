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
        mintPublicKey,
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
      if (!mintPublicKey) {
        throw new Error(
          `Mint public key not found for token symbol: ${tokenSymbol}`
        );
      }

      const recipientPublicKey = new PublicKey(recipientAddress);
      console.log("recipientAddress => ", recipientAddress);

      console.log("recipientPublicKey => ", recipientPublicKey);

      // Get sender's associated token account
      const senderTokenAccount = await getAssociatedTokenAddress(
        mintPublicKey,
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
        mintPublicKey,
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

      // Create the transfer transaction
      const transaction = new Transaction().add(
        createTransferInstruction(
          senderTokenAccount,
          recipientTokenAccount,
          senderPublicKey,
          amount * Math.pow(10, 6), // Adjust decimals as needed
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

  const withdrawToken = async (tokenSymbol, amount) => {
    try {
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
        senderKeypair, // Payer of the transaction
        mintPublicKey, // Mint
        senderKeypair.publicKey // Owner of the token account
      );
  
      const receiverTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        senderKeypair, // Payer of the transaction
        mintPublicKey, // Mint
        receiver // Owner of the token account
      );
  
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
      const signature = await sendAndConfirmTransaction(connection, transaction, [
        senderKeypair,
      ]);
  
      console.log("Transaction confirmed with signature1:", signature);
  
      // Update the token balances
      await fetchAllTokenBalances(provider.publicKey.toString());
  
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
  

  // const withdrawToken = async (tokenSymbol, amount) => {
  //   try {
  //     const connection = new Connection(
  //       "https://api.devnet.solana.com",
  //       "confirmed"
  //     );

  //     // Fetch the mint public key dynamically based on the token symbol
  //     const mintPublicKey = mintPublicKeys[tokenSymbol];
  //     if (!mintPublicKey) {
  //       throw new Error(
  //         `Mint public key not found for token symbol: ${tokenSymbol}`
  //       );
  //     }

  //     const receiver = new PublicKey(address); // The address from which we are withdrawing
  //     const senderKeypair = Keypair.fromSecretKey(
  //       Uint8Array.from([
  //         99, 153, 185, 2, 176, 202, 136, 24, 48, 36, 90, 13, 91, 36, 51, 211,
  //         124, 5, 233, 93, 51, 220, 224, 11, 254, 245, 14, 227, 0, 11, 18, 241,
  //         209, 4, 23, 171, 179, 194, 18, 176, 121, 103, 10, 192, 157, 32, 23,
  //         61, 105, 211, 36, 61, 96, 8, 12, 131, 122, 122, 139, 206, 238, 217,
  //         25, 54,
  //       ])
  //     );
  //     getOrCreateAssociatedTokenAccount(
  //       connection,
  //       senderKeypair, // Payer of the transaction
  //       mintPublicKey, // Mint
  //       senderKeypair.publicKey // Owner of the token account
  //     )
  //       .then(function (senderTokenAccount) {
  //         getOrCreateAssociatedTokenAccount(
  //           connection,
  //           senderKeypair, // Payer of the transaction
  //           mintPublicKey, // Mint
  //           receiver // Owner of the token account
  //         )
  //           .then(function (receiverTokenAccount) {
  //             // Create the transfer instruction
  //             const transferInstruction = createTransferInstruction(
  //               senderTokenAccount.address, // Source account (sender's token account)
  //               receiverTokenAccount.address, // Destination account (receiver's token account)
  //               senderKeypair.publicKey, // Owner of the source account (sender)
  //               amount, // Amount to transfer (in the smallest units, e.g., 1 token if 6 decimals)
  //               [], // Signers (if any additional ones are required)
  //               TOKEN_PROGRAM_ID // SPL Token Program ID
  //             );
  //             // Create a transaction and add the transfer instruction
  //             const transaction = new Transaction().add(transferInstruction);
  //             // Sign and send the transaction
  //             sendAndConfirmTransaction(connection, transaction, [
  //               senderKeypair,
  //             ])
  //               .then(function (signature) {
  //                 console.log(
  //                   "Transaction confirmed with signature1:",
  //                   signature
  //                 );
  //               })
  //               .catch(function (error) {
  //                 console.error("Error sending SPL tokens:", error);
  //               });
  //           })
  //           .catch(function (error) {
  //             console.error(
  //               "Error getting or creating receiver token account:",
  //               error
  //             );
  //           });
  //       })
  //       .catch(function (error) {
  //         console.error(
  //           "Error getting or creating sender token account:",
  //           error
  //         );
  //       });

  //     // Fetch the updated token balances
  //     await fetchAllTokenBalances(provider.publicKey.toString());

  //     setTransactionStatus("Withdraw successful with signature: " ,signature);
  //     toast.success("Withdraw successful!", {
  //       position: "top-center",
  //       autoClose: 3000,
  //       hideProgressBar: false,
  //       closeOnClick: true,
  //       pauseOnHover: false,
  //       draggable: true,
  //       progress: undefined,
  //       theme: "dark",
  //       transition: Bounce,
  //     });
  //   } catch (error) {
  //     console.error("Withdraw failed", error);
  //     setTransactionStatus("Withdraw failed: " + error.message);
  //     toast.error("Withdraw failed", {
  //       position: "top-center",
  //       autoClose: 3000,
  //       hideProgressBar: false,
  //       closeOnClick: true,
  //       pauseOnHover: false,
  //       draggable: true,
  //       progress: undefined,
  //       theme: "dark",
  //       transition: Bounce,
  //     });
  //   }
  // };

  return (
    <WalletContext.Provider
      value={{
        address,
        tokenBalances,
        connectWallet,
        fetchAllTokenBalances,
        transferToken,
        withdrawToken,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export { WalletContext, WalletProvider };

// import React, { createContext, useEffect, useState } from "react";
// import { Bounce, toast } from "react-toastify"; // Import toast to show notifications
// import "react-toastify/dist/ReactToastify.css"; // Import toast styles
// import { PublicKey, Transaction, Connection } from "@solana/web3.js";
// import {
//   getAccount,
//   TOKEN_PROGRAM_ID,
//   getAssociatedTokenAddress,
//   createTransferInstruction,
// } from "@solana/spl-token";

// // Create the context
// const WalletContext = createContext();

// // Provider component
// const WalletProvider = ({ children }) => {
//   // States for wallet connection, address, and balance
//   const [address, setAddress] = useState(null);
//   const [balance, setBalance] = useState(null);
//   const [provider, setProvider] = useState(null);
//   const [tokenBalance, setTokenBalance] = useState("");
//   const [transactionStatus, setTransactionStatus] = useState(null);

//   // Function to check if Phantom Wallet is installed
//   const checkIfPhantomInstalled = () => {
//     return (
//       typeof window !== "undefined" && window.solana && window.solana.isPhantom
//     );
//   };

//   // Function to connect Phantom Wallet
//   const connectWallet = async () => {
//     if (checkIfPhantomInstalled()) {
//       try {
//         const response = await window.solana.connect();
//         const userAddress = response.publicKey.toString();
//         console.log("Connected Address:", userAddress);

//         setAddress(userAddress);
//         setProvider(window.solana);

//         // Fetch and set the balance after connecting the wallet
//         const fetchedBalance = await getTokenBalance();
//         setTokenBalance(fetchedBalance);

//         toast.success(`Wallet connected: ${userAddress}`, {
//           position: "top-center",
//           autoClose: 3000,
//           hideProgressBar: false,
//           closeOnClick: true,
//           pauseOnHover: false,
//           draggable: true,
//           progress: undefined,
//           theme: "dark",
//           transition: Bounce,
//         });
//       } catch (err) {
//         console.error("Failed to connect Phantom wallet:", err.message);
//         toast.error("Failed to connect Phantom wallet");
//       }
//     } else {
//       console.log("Please install Phantom Wallet");
//       toast.warn("Please install Phantom Wallet");
//     }
//   };

//   useEffect(() => {
//     if (address) {
//       getTokenBalance(address).then((balance) => {
//         setTokenBalance(balance);
//       });
//     }
//   }, [address]);

//   // useEffect(() => {
//   //   getTokenBalance();
//   // }, []);

//   // Function to fetch SOL balance using Solana connection
//   const getBalance = async (userAddress) => {
//     try {
//       const connection = new Connection("https://api.devnet.solana.com");
//       const publicKey = new PublicKey(userAddress);
//       const balance = await connection.getBalance(publicKey);

//       const formattedBalance = (balance / 1e9).toFixed(4); // Convert balance from lamports to SOL
//       return formattedBalance;
//     } catch (error) {
//       console.error("Error fetching balance:", error);
//       return "0"; // Return 0 in case of an error
//     }
//   };

//   const getTokenBalance = async () => {
//     try {
//       // Establish a connection to the Solana mainnet
//       const connection = new Connection(
//         "https://api.devnet.solana.com",
//         "confirmed"
//       );

//       // The mint address for the specific token (replace with your token's mint address)
//       const tokenMintAddress = "498bK2F1fCNPsHWdTFiXr8dw51p3SAC4tHPzgRpDUo3j";
//       const walletAddress = "F4uq3AB7uVBN28MehoV73KPQhXehMMi3A4BMij1tN2tD";

//       // Create PublicKey instances for the wallet address and token mint address
//       const walletPublicKey = new PublicKey(walletAddress);
//       const mintPublicKey = new PublicKey(tokenMintAddress);

//       // Get the associated token account for the wallet and token mint
//       const associatedTokenAccount = await getAssociatedTokenAddress(
//         mintPublicKey,
//         walletPublicKey
//       );

//       // Fetch the account info
//       const accountInfo = await getAccount(connection, associatedTokenAccount);
//       console.log("accountInfo -> ", accountInfo);

//       // Convert balance from smallest units to token units using the account's decimals
//       const balance = Number(accountInfo.amount) / 10 ** 6;
//       console.log("Balance of Token inner => ", balance);
//       // setTokenBalance(balance);

//       return balance;
//     } catch (error) {
//       console.error("Error fetching token balance:", error);
//       return 0; // Return 0 in case of error
//     }
//   };

//   console.log("Token Balance => ", tokenBalance);

// const transferToken = async () => {
//   try {
//     if (!provider || !provider.isConnected) {
//       throw new Error("Phantom wallet not connected");
//     }

//     const senderPublicKey = provider.publicKey;
//     const connection = new Connection(
//       "https://api.devnet.solana.com",
//       "confirmed"
//     );
//     const mintAddress = "498bK2F1fCNPsHWdTFiXr8dw51p3SAC4tHPzgRpDUo3j";

//     const backEndAddress = new PublicKey('F4uq3AB7uVBN28MehoV73KPQhXehMMi3A4BMij1tN2tD');
//       const tokenAddress = await getAssociatedTokenAddress(
//         mintAddress,  // The mint address
//         backEndAddress   // The user's public key (wallet address)
//       );
//     const backTokenAcc = tokenAddress.toBase58();
//     // const backTokenAcc = "6Npj7SEtonjzpWuVi6GMUtfrAG9HsgTmCMgkUYMjBh3e";
//     const recipientTokenAccount = new PublicKey(backTokenAcc);

//     const tokenMintAddress = new PublicKey(mintAddress);

//     const amountToTransfer = 1 * Math.pow(10, 6);

//     const senderTokenAccount = await getAssociatedTokenAddress(
//       tokenMintAddress,
//       senderPublicKey
//     );

//     const { blockhash } = await connection.getLatestBlockhash();

//     const transaction = new Transaction().add(
//       createTransferInstruction(
//         senderTokenAccount,
//         recipientTokenAccount,
//         senderPublicKey,
//         amountToTransfer,
//         [],
//         TOKEN_PROGRAM_ID
//       )
//     );

//     transaction.recentBlockhash = blockhash;
//     transaction.feePayer = senderPublicKey;

//     console.log("Transaction:", transaction);
//     console.log("Sender PublicKey:", senderPublicKey.toString());

//     const signedTransaction = await window.solana.signTransaction(
//       transaction
//     );
//     const signature = await connection.sendRawTransaction(
//       signedTransaction.serialize()
//     );
//     await connection.confirmTransaction(signature, "processed");
//     // Update the token balance after transaction is confirmed
//     const updatedBalance = await getTokenBalance();
//     setTokenBalance(updatedBalance);

//     setTransactionStatus(
//       "Transaction successful with signature: " + signature
//     );
//   } catch (error) {
//     console.error("Transaction failed", error);
//     setTransactionStatus("Transaction failed: " + error.message);
//   }
// };

//   return (
//     <WalletContext.Provider
//       value={{
//         address,
//         tokenBalance,
//         connectWallet,
//         getTokenBalance,
//         transferToken,
//       }}
//     >
//       {children}
//     </WalletContext.Provider>
//   );
// };

// export { WalletContext, WalletProvider };

// import React, { createContext, useState } from 'react';
// import { toast } from 'react-toastify'; // Import toast to show notifications
// import 'react-toastify/dist/ReactToastify.css'; // Import toast styles
// import { ethers } from 'ethers';

// // Create the context
// const WalletContext = createContext();

// // Provider component
// const WalletProvider = ({ children }) => {
//   // States for wallet connection, address, and balance
// //   const [walletConnected, setWalletConnected] = useState(false);
//   const [address, setAddress] = useState(null);
// //   const [balance, setBalance] = useState('');
// //   const [provider, setProvider] = useState('');

//   // Function to connect wallet and fetch balance
//   const connectWallet = async () => {
//     if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
//       try {
//         const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
//         const userAddress = accounts[0];
//         console.log('Connected Address:', userAddress);
//         // setWalletConnected(true);
//         setAddress(userAddress);

//         // Fetch and set the balance after connecting the wallet
//         // const fetchedBalance = await getBalance(userAddress);
//         // setBalance(fetchedBalance);
//         toast.success('Wallet connected: ${userAddress}');
//       } catch (err) {
//         console.error(err.message);
//         toast.error('Failed to connect wallet');
//       }
//     } else {
//       console.log('Please install MetaMask');
//       toast.warn('Please install MetaMask');
//     }
//   };

//   // Function to fetch balance using ethers.js
// //   const getBalance = async (userAddress) => {
// //     const RPC_URL = "https://bsc-dataseed1.binance.org/"; // Replace with your Infura Project ID
// //     try {
// //       const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
// //       setProvider(provider)
// //       const balance = await provider.getBalance(userAddress);
// //       return ethers.utils.formatEther(balance); // Format balance to Ether
// //     } catch (error) {
// //       console.error('Error fetching balance:', error);
// //       return '0'; // Return 0 in case of an error
// //     }
// //   };

// //   console.log('Context address:', address);
// //   console.log('Context balance:', balance);

//   // Provide the address, balance, and connectWallet function to children components
//   return (
//     <WalletContext.Provider value={{address, connectWallet }}>
//       {children}
//     </WalletContext.Provider>
//   );
// };

// // Export the context and provider
// export { WalletContext, WalletProvider };

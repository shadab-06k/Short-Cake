import React, { useContext, useEffect, useState } from "react";
import "./OrderTable.css"; // Import the CSS file for styling
import { mintPublicKeys, WalletContext } from "../WalletContext/WalletContext";

const OrderTable = () => {
  const { address, onCloseOrders } = useContext(WalletContext);
  const [data, setData] = useState([]);
  const [tokenPrices, setTokenPrices] = useState({});
  const [tokenData, setTokenData] = useState([]);
  const [loadingPrices, setLoadingPrices] = useState(false);

  const ipUrl = "http://192.168.1.19:9000";

  // Mapping of token symbols to pool names
  const symbolToNameMapping = {
    BONK: "BONK",
    WIF: "WIF",
    FLOKI: "FLOKI",
    SHIB: "SHIB",
    CORGIAI: "CORGIAI",
  };

  // Fetch all orders for the connected wallet
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${ipUrl}/shortcake/v1/get-orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            walletAddress: address,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        console.log("Order data: ", json);

        if (json.data && Array.isArray(json.data)) {
          setData(json.data); // Set order data
          fetchTokenPrices(json.data); // Fetch prices for tokens
        } else {
          console.error(
            "Expected an array but got:",
            typeof json.data,
            json.data
          );
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    // Set interval for fetching orders every 5 seconds
    const intervalId = setInterval(() => {
      fetchOrders();
    }, 5000); // 5000ms = 5 seconds

    // Clear interval when the component unmounts or when `address` changes
    return () => clearInterval(intervalId);

    // fetchOrders();
  }, [address]);

  // Fetch pool data to get pairAddress for each pool
  useEffect(() => {
    const fetchPoolData = async () => {
      try {
        const response = await fetch(`${ipUrl}/shortcake/v1/get-pools`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Pool API Response: ", result);

        const { data } = result;

        if (data && Array.isArray(data)) {
          const mappedData = data.map((pool) => {
            const symbol = Object.keys(symbolToNameMapping).find(
              (key) => symbolToNameMapping[key] === pool.name
            );

            if (symbol) {
              // Store the pairAddress in mintPublicKeys for each token
              mintPublicKeys[symbol] = {
                ...mintPublicKeys[symbol],
                pairAddress: pool.pairAddress, // Store pairAddress
                mintPublicKeys: pool.mintAddress,
              };
            }

            return {
              label: pool.name,
              pairAddress: pool.pairAddress,
              mintPublicKeys: pool.mintAddress,
            };
          });

          setTokenData(mappedData);
          console.log("mapped FData for orderTable mint ===>>>", mappedData);
        } else {
          console.error("No pools data found in the API response");
        }
      } catch (error) {
        console.error("Error fetching pool data:", error);
      }
    };

    fetchPoolData();
  }, []);

  // Fetch token prices from DEX for each pool used in the orders
  const fetchTokenPrices = async (orders) => {
    try {
      setLoadingPrices(true);
      const prices = {};

      for (const order of orders) {
        const pool = order.pool;
        const pairAddress = mintPublicKeys[pool]?.pairAddress;

        if (pairAddress) {
          const price = await getTokenPriceInUSD(pairAddress);
          prices[pool] = price; // Store the price of each pool/token
        }
      }

      setTokenPrices(prices);
      setLoadingPrices(false);
    } catch (error) {
      console.error("Error fetching token prices:", error);
      setLoadingPrices(false);
    }
  };

  // Fetch token price from Dex API
  const getTokenPriceInUSD = async (pairAddress) => {
    try {
      const url = `https://api.dexscreener.io/latest/dex/pairs/solana/${pairAddress}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Data fetched for token price: ", data);

      if (data && data.pair && data.pair.priceUsd) {
        return parseFloat(data.pair.priceUsd);
      } else {
        console.error("Unexpected API response structure:", data);
        return 0;
      }
    } catch (error) {
      console.error("Error fetching token price:", error);
      return 0;
    }
  };

  // Function to calculate current value
  const calculateCurrentValue = (amount, leverage, tokenSymbol) => {
    const currentPrice = tokenPrices[tokenSymbol] || 0;
    return amount * leverage * currentPrice;
  };

  // Function to handle closing an order
  const handleCloseOrder = async (orderId, pool) => {
    const mintPublicKey = mintPublicKeys[pool]?.mintPublicKeys;
    console.log("mintPublicKey =>>", mintPublicKey);

    if (mintPublicKey) {
      await onCloseOrders(mintPublicKey, orderId);
      // Update the order status to "Closed" after successful closing
      setData((prevData) =>
        prevData.map((order) =>
          order.orderId === orderId
            ? { ...order, orderStatus: "Closed" }
            : order
        )
      );
    } else {
      console.error(`No pairAddress found for pool: ${pool}`);
    }
  };

  return (
    <>
      <h2 className="order-heading">Order History</h2>
      <div className="order-table">
        <div className="order-table-header">
          <div>Order NO.</div>
          <div>Pool</div>
          <div>Amount</div>
          <div>Type</div>
          <div>Leverage</div>
          <div>Status</div>
          <div>Open Price</div>
          <div>Order Action</div>
          <div>Current Price</div>
          <div>Current Value</div>
        </div>
        {data.length === 0 ? (
          <h2 className="text-center text-white my-3">No data to display</h2>
        ) : (
          data.map((item, index) => (
            <div key={index} className="order-table-row">
              <div>{item.orderId}</div>
              <div>{item.pool}</div>
              <div>{item.amount}</div>
              <div>{item.orderType}</div>
              <div>{item.leverage}</div>
              <div>{item.orderStatus}</div>
              <div>{item.openPrice}</div>
              <div>
                {item.orderStatus === "open" ? (
                  <button
                    className="close-button"
                    onClick={() => handleCloseOrder(item.orderId, item.pool)}
                  >
                    Close Order
                  </button>
                ) : (
                  <span>Order Closed</span>
                )}
              </div>
              <div>
                {tokenPrices[item.pool]
                  ? `$${tokenPrices[item.pool]}`
                  : "Fetching..."}
              </div>
              <div>
                {tokenPrices[item.pool]
                  ? `$${calculateCurrentValue(
                      item.amount,
                      item.leverage,
                      item.pool
                    )}`
                  : "Calculating..."}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default OrderTable;

// import React, { useContext, useEffect, useState } from "react";
// import "./OrderTable.css"; // Import the CSS file for styling
// import { mintPublicKeys, WalletContext } from "../WalletContext/WalletContext";

// const OrderTable = () => {
//   const { address, onCloseOrders } = useContext(WalletContext);
//   const [data, setData] = useState([]);
//   const [tokenPrices, setTokenPrices] = useState({});
//   const [tokenData, setTokenData] = useState([]);
//   const [leverage, setLeverage] = useState('');

//   console.log('leverage === ',leverage)
//   console.log('data array ',data)
//   console.log('data array ',data[0].leverage)

//   const ipUrl = "http://192.168.1.11:9000";

//   // Mapping of token symbols to pool names
//   const symbolToNameMapping = {
//     BONK: "BONK",
//     WIF: "WIF",
//     FLOKI: "FLOKI",
//     SHIB: "SHIB",
//     CORGIAI: "CORGIAI",
//   };

//   // Fetch all orders for the connected wallet
//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         const response = await fetch(`${ipUrl}/shortcake/v1/get-orders`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             walletAddress: address,
//           }),
//         });

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const json = await response.json();
//         console.log("Order data: ", json);

//         if (json.data && Array.isArray(json.data)) {
//           setData(json.data);
//           setLeverage(json.data.leverage)
//         } else {
//           console.error("Expected an array but got:", typeof json.data, json.data);
//         }
//       } catch (error) {
//         console.error("Error fetching orders:", error);
//       }
//     };

//     fetchOrders();
//   }, [address]);

//   // Fetch pool data to get pairAddress
//   useEffect(() => {
//     const fetchPoolData = async () => {
//       try {
//         const response = await fetch(`${ipUrl}/shortcake/v1/get-pools`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({}),
//         });

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const result = await response.json();
//         console.log("Pool API Response: ", result);

//         const { data } = result;

//         if (data && Array.isArray(data)) {
//           const mappedData = data.map((pool) => {
//             const symbol = Object.keys(symbolToNameMapping).find(
//               (key) => symbolToNameMapping[key] === pool.name
//             );

//             if (symbol) {
//               // Store the pairAddress in mintPublicKeys for each token
//               mintPublicKeys[symbol] = {
//                 ...mintPublicKeys[symbol],
//                 pairAddress: pool.pairAddress, // Store pairAddress
//               };
//             }

//             return {
//               label: pool.name,
//               pairAddress: pool.pairAddress,
//             };
//           });

//           setTokenData(mappedData);

//           // Fetch prices for the first token by default
//           if (mappedData.length > 0) {
//             getTokenPriceInUSD(mappedData[0].pairAddress, mappedData[0].label);
//           }
//         } else {
//           console.error("No pools data found in the API response");
//         }
//       } catch (error) {
//         console.error("Error fetching pool data:", error);
//       }
//     };

//     fetchPoolData();
//   }, []);

//   // Fetch token price from Dex API
//   const getTokenPriceInUSD = async (pairAddress, tokenLabel) => {
//     try {
//       const url = `https://api.dexscreener.io/latest/dex/pairs/solana/${pairAddress}`;
//       const response = await fetch(url);

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       console.log("Data fetched for token price: ", data);

//       if (data && data.pair && data.pair.priceUsd) {
//         const priceUsd = parseFloat(data.pair.priceUsd);

//         // Update the tokenPrices state with the fetched price
//         setTokenPrices((prevPrices) => ({
//           ...prevPrices,
//           [tokenLabel]: priceUsd,
//         }));
//       } else {
//         console.error("Unexpected API response structure:", data);
//       }
//     } catch (error) {
//       console.error("Error fetching token price:", error);
//     }
//   };

//   // Function to handle closing an order
//   const handleCloseOrder = async (orderId, pool) => {
//     const mintPublicKey = mintPublicKeys[pool]?.pairAddress;

//     if (mintPublicKey) {
//       await onCloseOrders(mintPublicKey, orderId);
//       // Update the order status to "Closed" after successful closing
//       setData((prevData) =>
//         prevData.map((order) =>
//           order.orderId === orderId ? { ...order, orderStatus: "Closed" } : order
//         )
//       );
//     } else {
//       console.error(`No pairAddress found for pool: ${pool}`);
//     }
//   };

//   return (
//     <>
//       <h2 className="order-heading">Order History</h2>
//       <div className="order-table">
//         <div className="order-table-header">
//           <div>Order NO.</div>
//           <div>Pool</div>
//           <div>Amount</div>
//           <div>Type</div>
//           <div>Leverage</div>
//           <div>Status</div>
//           <div>Open Price</div>
//           <div>Order Action</div>
//           <div>Current Price</div>
//           <div>Current Value</div>
//         </div>
//         {data.length === 0 ? (
//           <h2 className="text-center text-white my-3">No data to display</h2>
//         ) : (
//           data.map((item, index) => (
//             <div key={index} className="order-table-row">
//               <div>{item.orderId}</div>
//               <div>{item.pool}</div>
//               <div>{item.amount}</div>
//               <div>{item.orderType}</div>
//               <div>{item.leverage}</div>
//               <div>{item.orderStatus}</div>
//               <div>{item.openPrice}</div>
//               <div>
//                 {item.orderStatus === "open" ? (
//                   <button
//                     className="close-button"
//                     onClick={() => handleCloseOrder(item.orderId, item.pool)}
//                   >
//                     Close Order
//                   </button>
//                 ) : (
//                   <span>Order Closed</span>
//                 )}
//               </div>
//               <div>{tokenPrices[item.pool] ? `$${tokenPrices[item.pool]}` : "Fetching..."}</div>
//               <div>
//                 {tokenPrices[item.pool]
//                   ? `$${(tokenPrices[item.pool] * 2)}`
//                   : "Calculating..."}
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </>
//   );
// };

// export default OrderTable;

// import React, { useContext, useEffect, useState } from "react";
// import "./OrderTable.css"; // Import the CSS file for styling
// import { mintPublicKeys, WalletContext } from "../WalletContext/WalletContext";

// const OrderTable = () => {
//   const { address, onCloseOrders } = useContext(WalletContext);
//   const [data, setData] = useState([]);
//   const [currentPrice, setCurrentPrice] = useState(null);
//   const [currentValue, setCurrentValue] = useState(null);
//   const [tokenData, setTokenData] = useState([]);

//   const ipUrl = "http://192.168.1.5:9000";

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch(`${ipUrl}/shortcake/v1/get-orders`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             walletAddress: address,
//           }),
//         });

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const json = await response.json();
//         console.log("data ", json);

//         // Check if the data property exists and is an array
//         if (json.data && Array.isArray(json.data)) {
//           setData(json.data);
//         } else {
//           console.error(
//             "Expected an array but got:",
//             typeof json.data,
//             json.data
//           );
//         }
//       } catch (error) {
//         console.error("Error fetching token data:", error);
//       }
//     };

//     // Fetch data immediately and then every 5 seconds
//     fetchData();
//     // const intervalId = setInterval(fetchData, 2000); // 5000 ms = 5 seconds

//     // // Clear interval on component unmount
//     // return () => clearInterval(intervalId);
//   }, [address]);

//   // Function to handle closing an order
//   const handleCloseOrder = async (orderId, pool) => {
//     // Get the mintPublicKey based on the pool name
//     const mintPublicKey = mintPublicKeys[pool];

//     if (mintPublicKey) {
//       await onCloseOrders(mintPublicKey, orderId);
//       // Optionally, you could refresh the order data after closing an order
//       setData((prevData) =>
//         prevData.map((order) =>
//           order.orderId === orderId
//             ? { ...order, orderStatus: "Closed" }
//             : order
//         )
//       );
//     } else {
//       console.error(`Mint public key not found for pool: ${pool}`);
//     }
//   };

//   const symbolToNameMapping = {
//     BONK: "BONK",
//     WIF: "WIF",
//     FLOKI: "FLOKI",
//     SHIB: "SHIB",
//     CORGIAI: "CORGIAI",
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch(`${ipUrl}/shortcake/v1/get-pools`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({}),
//         });

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const result = await response.json();
//         console.log("Pool Api Response => ", result);

//         const { data } = result;

//         if (data && Array.isArray(data)) {
//           const mappedData = data.map((pool) => {
//             const symbol = Object.keys(symbolToNameMapping).find(
//               (key) => symbolToNameMapping[key] === pool.name
//             );

//             return {
//               label: pool.name,
//               mintAddress: pool.mintAddress,
//               balance: tokenBalances[symbol] || "0.00",
//               price: pool.price,
//               pairAddress: pool.pairAddress,
//             };
//           });

//           setTokenData(mappedData);

//           if (mappedData.length > 0) {
//             const firstToken = mappedData[0];

//             getTokenPriceInUSD(firstToken.pairAddress);
//           }
//         } else {
//           console.error("No pools data found in the API response");
//         }
//       } catch (error) {
//         console.error("Error fetching token data:", error);
//       }
//     };

//     fetchData();
//   }, [tokenBalances]);

//   useEffect(() => {
//     const fetchPrice = async (pairAddress) => {
//         try {
//           const url = `https://api.dexscreener.io/latest/dex/pairs/solana/${pairAddress}`;
//           const response = await fetch(url);

//           if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//           }

//           const data = await response.json();
//           console.log("Data fetched for token price: ", data);

//           if (data && data.pair && data.pair.priceUsd) {
//             const priceUsd = parseFloat(data.pair.priceUsd);
//             setCurrentPrice(priceUsd);
//             setCurrentValue(priceUsd *2);
//           } else {
//             console.error("Unexpected API response structure:", data);
//             setPricesUsd("0.00");
//           }
//         } catch (error) {
//           console.error("Error fetching token price:", error);
//           setPricesUsd("0.00");
//         }
//       };

//     fetchPrice();
//   }, []); // Empty dependency array means this useEffect runs once after the initial render

//   return (
//     <>
//       <h2 className="order-heading">Order History</h2>
//       <div className="order-table">
//         <div className="order-table-header">
//           <div>Order NO.</div>
//           <div>Pool</div>
//           <div>Amount</div>
//           <div>Type</div>
//           <div>Leverage</div>
//           <div>Status</div>
//           <div>Open Price</div>
//           <div>Order Action</div>
//           <div>Cuurent Price</div>
//           <div>Current Value</div>

//           {/* <div>Withdraw Amount</div> */}
//         </div>
//         {data.length === 0 ? (
//           <h2 className="text-center text-white my-3">No data to display</h2>
//         ) : (
//           data.map((item, index) => (
//             <div key={index} className="order-table-row">
//               <div>{item.orderId}</div>
//               <div>{item.pool}</div>
//               <div>{item.amount}</div>
//               <div>{item.orderType}</div>
//               <div>{item.leverage}</div>
//               <div>{item.orderStatus}</div>
//               <div>{item.openPrice}</div>
//               <div>
//                 {item.orderStatus === "open" ? (
//                   <button
//                     className="close-button"
//                     onClick={() => handleCloseOrder(item.orderId, item.pool)}
//                   >
//                     Close Order
//                   </button>
//                 ) : (
//                   <span>Order Closed</span>
//                 )}
//               </div>
//               {/* <div>{item.amount}</div> */}
//             </div>
//           ))
//         )}
//       </div>
//       {dataPrice.length === 0 ? (
//         <h2 className="text-center text-white my-3">No data to display</h2>
//       ) : (
//         dataPrice.map((item, index) => (
//           <div key={index} className="order-table-row">
//             <div>{item.orderId}</div>
//             <div>{item.pool}</div>
//           </div>
//         ))
//       )}
//     </>
//   );
// };

// export default OrderTable;

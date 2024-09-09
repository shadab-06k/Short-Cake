// import React, { useContext, useState, useEffect } from "react";
// import "./LendingTable.css";
// import { WalletContext } from "../WalletContext/WalletContext";
// import { ToastContainer } from "react-toastify";

// const LendingTable = () => {
//   const { address, withdrawToken, tokenBalances, transferToken } =
//     useContext(WalletContext);
//   const [tokenData, setTokenData] = useState([]);

//   const ipUrl = "http://192.168.1.11:9000";

//   const symbolToNameMapping = {
//     BONK: "BONK",
//     WIF: "WIF",
//     FLOKI: "FLOKI",
//     SHIB: "SHIB",
//     CORGIAI: "CORGIAI",
//   };

//   const fetchData = async () => {
//     try {
//       const response = await fetch(`${ipUrl}/shortcake/v1/get-pools`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({}),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const result = await response.json();
//       console.log("Pool Api Response => ", result);

//       const { data } = result;

//       if (data && Array.isArray(data)) {
//         const mappedData = data.map((pool) => {
//           const symbol = Object.keys(symbolToNameMapping).find(
//             (key) => symbolToNameMapping[key] === pool.name
//           );

//           return {
//             name: pool.name,
//             imageUrl: pool.img,
//             mintAddress: pool.mintAddress,
//             supply: tokenBalances[symbol] || "0.00", // Use symbol to fetch balance
//             price: pool.price,
//           };
//         });

//         setTokenData(mappedData);
//         console.log("mapped data of lending table ========", mappedData);
//       } else {
//         console.error("No pools data found in the API response");
//       }
//     } catch (error) {
//       console.error("Error fetching token data:", error);
//     }
//   };

//   // Fetch data when tokenBalances change or when the wallet is connected
//   useEffect(() => {
//     if (address) {
//       fetchData(); // Fetch token balances when wallet is connected or token balances change
//     }
//   }, [address, tokenBalances]); // Trigger when the wallet address or token balances update
//   useEffect(() => {
//       fetchData(); // Fetch token balances when wallet is connected or token balances change
//   }, [tokenBalances]); // Trigger when the wallet address or token balances update

//   return (
//     <div className="table-container">
//       <ToastContainer />
//       <table className="lending-table">
//         <thead>
//           <tr>
//             <th>Token Image</th>
//             <th>Asset Name</th>
//             <th>Supply</th>
//             <th>Deposit</th>
//             <th>Withdraw</th>
//           </tr>
//         </thead>
//         <tbody>
//           {tokenData.length === 0 ? (
//             <tr>
//               <td colSpan="5" className="text-center">
//                 No data to display
//               </td>
//             </tr>
//           ) : (
//             tokenData.map((item, index) => (
//               <tr key={index}>
//                 <td className="asset-name">
//                   <img
//                     src={item.imageUrl}
//                     alt={item.name}
//                     className="token-image"
//                   />
//                 </td>
//                 <td>
//                   <div className="table-name">{item.name}</div>
//                 </td>
//                 <td>{item.supply}</td>
//                 <td>
//                   <button
//                     className="button-deposit"
//                     type="button"
//                     disabled={!address}
//                     onClick={() =>
//                       transferToken(
//                         item.name,
//                         "F4uq3AB7uVBN28MehoV73KPQhXehMMi3A4BMij1tN2tD",
//                         1
//                       )
//                     }
//                   >
//                     Deposit
//                   </button>
//                 </td>
//                 <td>
//                   <button
//                     className="button-deposit"
//                     type="button"
//                     disabled={!address}
//                     onClick={() => withdrawToken(item.name, 1000000)}
//                   >
//                     Withdraw
//                   </button>
//                 </td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default LendingTable;



import React, { useContext, useState, useEffect } from "react";
import "./LendingTable.css";
import { WalletContext } from "../WalletContext/WalletContext";
import { ToastContainer } from "react-toastify";

const LendingTable = () => {
  const { address, withdrawToken, tokenBalances, transferToken } =
    useContext(WalletContext);
  const [tokenData, setTokenData] = useState([]);

  const ipUrl = "http://192.168.1.19:9000";

  const symbolToNameMapping = {
    BONK: "BONK",
    WIF: "WIF",
    FLOKI: "FLOKI",
    SHIB: "SHIB",
    CORGIAI: "CORGIAI",
  };

  useEffect(() => {
    const fetchData = async () => {
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
        console.log("Pool Api Response => ", result);

        const { data } = result;

        if (data && Array.isArray(data)) {
          const mappedData = data.map((pool) => {
            const symbol = Object.keys(symbolToNameMapping).find(
              (key) => symbolToNameMapping[key] === pool.name
            );

            return {
              name: pool.name,
              imageUrl: pool.img,
              mintAddress: pool.mintAddress,
              supply: tokenBalances[symbol] || "0.00", // Use symbol to fetch balance
              price: pool.price,
            };
          });

          setTokenData(mappedData);
          console.log('mapped data of lending table ========',mappedData)
          console.log("token data of lending table === ", tokenData);
        } else {
          console.error("No pools data found in the API response");
        }
      } catch (error) {
        console.error("Error fetching token data:", error);
      }
    };

    fetchData();
  }, [tokenBalances]);

  console.log('token data of lending page === ',tokenData)

  return (
    <div className="table-container">
      <ToastContainer />
      <table className="lending-table">
        <thead>
          <tr>
            <th>Token Image</th>
            <th>Asset Name</th>
            <th>Supply</th>
            <th>Deposit</th>
            <th>Withdraw</th>
          </tr>
        </thead>
        <tbody>
          {tokenData.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">
                No data to display
              </td>
            </tr>
          ) : (
            tokenData.map((item, index) => (
              <tr key={index}>
                <td className="asset-name">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="token-image"
                  />
                </td>
                <td>
                  <div className="table-name">{item.name}</div>
                </td>
                <td>{item.supply}</td>
                <td>
                  <button
                    className="button-deposit"
                    type="button"
                    disabled={!address}
                    onClick={() =>
                      transferToken(
                        item.name,
                        "F4uq3AB7uVBN28MehoV73KPQhXehMMi3A4BMij1tN2tD",
                        1
                      )
                    }
                  >
                    Deposit
                  </button>
                </td>
                <td>
                  <button
                    className="button-deposit"
                    type="button"
                    disabled={!address}
                    onClick={() => withdrawToken(item.name, 1000000)}
                  >
                    Withdraw
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LendingTable;

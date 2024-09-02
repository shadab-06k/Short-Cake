import React, { useContext, useState, useEffect } from "react";
import "./LendingTable.css";
import { WalletContext } from "../WalletContext/WalletContext";
import { ToastContainer } from "react-toastify";

const LendingTable = () => {
  const { address, withdrawToken, tokenBalances, transferToken } =
    useContext(WalletContext);
  const [tokenData, setTokenData] = useState([]);

  // Map symbols to their corresponding mint addresses
  const mintAddresses = {
    BONK: "498bK2F1fCNPsHWdTFiXr8dw51p3SAC4tHPzgRpDUo3j",
    WIF: "6tJrEXMyKN3AB6AMG89TnkegqiUDwKjqaeKkAxJt9amM",
    FLOKI: "n1EhuBLt5vjZxV3JRojEFUzZbJEdERt5sBXaJBVnXCM",
    SHIB: "2tKPAw5tJZV6T9q8NrUTLcNzXrnxKHD6NxyHitURpSXj",
    CORGIAI: "5EJnnu56ESrkaVtUBZqy4GHChGMEgwvNuQNqAzUivP63",
  };

  const symbols = ["BONK", "WIF", "FLOKI", "SHIB", "CORGIAI"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false"
        );

        const data = await response.json();

        // Filter tokens by symbol and map with mint addresses
        const filteredData = symbols
          .map((symbol) => {
            const token = data.find(
              (item) => item.symbol.toUpperCase() === symbol
            );
            return token
              ? {
                  name: token.name,
                  symbol: token.symbol.toUpperCase(),
                  imageUrl: token.image,
                  price: `$${token.current_price}`,
                  ltv: "0/1.04",
                  mintAddress: mintAddresses[symbol], // Use the mapped mint address
                  supply: tokenBalances[symbol]
                    ? tokenBalances[symbol]
                    : "0.00",
                  supplyAPR: "0.02%",
                  borrow: "603.4567",
                  borrowPrice: "$76.98",
                  borrowAPR: "34.98%",
                }
              : null;
          })
          .filter((item) => item !== null); // Filter out null values in case the symbol wasn't found

        setTokenData(filteredData);
      } catch (error) {
        console.error("Error fetching token data:", error);
      }
    };

    fetchData();
  }, [tokenBalances]); // Re-fetch if tokenBalances changes

  return (
    <div className="table-container">
      <ToastContainer />
      <table className="lending-table">
        <thead>
          <tr>
            <th>Asset Name</th>
            <th>LTV/BW</th>
            <th>Supply</th>
            <th>Supply APR</th>
            <th>Borrow</th>
            <th>Borrow APR</th>
          </tr>
        </thead>
        <tbody>
          {tokenData.length === 0 ? (
            <p className="my-3 text-center">No data to display</p>
          ) : (
            tokenData.map((item, index) => (
              <tr key={index}>
                <td className="asset-name">
                  <div className="asset-info">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="token-image"
                    />
                    <div className="token-details">
                      <div className="table-name">{item.name}</div>
                      <div className="price">{item.price}</div>
                      <button
                        className="button-deposit cursor-pointer"
                        type="button"
                        disabled={!address}
                        onClick={() =>
                          transferToken(
                            item.symbol,
                            "F4uq3AB7uVBN28MehoV73KPQhXehMMi3A4BMij1tN2tD",
                            1
                          )
                        }
                      >
                        Deposit
                      </button>
                      <button
                        className="button-deposit"
                        type="button"
                        disabled={!address}
                        onClick={() => withdrawToken(item.symbol, 1000000)}
                      >
                        Withdraw
                      </button>
                    </div>
                  </div>
                </td>
                <td>{item.ltv}</td>
                <td>
                  <div>
                    {item.supply}
                    <div className="small-text">$765,768</div>
                  </div>
                </td>
                <td>{item.supplyAPR}</td>
                <td>
                  <div>
                    {item.borrow}
                    <div className="small-text">{item.borrowPrice}</div>
                  </div>
                </td>
                <td>{item.borrowAPR}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LendingTable;

// import React, { useContext } from "react";
// import "./LendingTable.css";
// import tableImage from "../../assets/Images/wif.png";
// import { WalletContext } from "../WalletContext/WalletContext";
// import { ToastContainer } from "react-toastify";

// const LendingTable = () => {
//   const { tokenBalance, getTokenBalance, transferToken } =
//     useContext(WalletContext);
//   console.log("balace pool =>", tokenBalance);

//   const data = [
//     {
//       name: "WIF",
//       price: "$1.15",
//       ltv: "0/1.04",
//       mintAddress: "498bK2F1fCNPsHWdTFiXr8dw51p3SAC4tHPzgRpDUo3j",
//       supply: tokenBalance ? tokenBalance : "No Balance",
//       supplyAPR: "0.02%",
//       borrow: "603.4567",
//       borrowPrice: "$76.98",
//       borrowAPR: "34.98%",
//     },
//     {
//       name: "BONK",
//       price: "$1.15",
//       ltv: "0/1.04",
//       supply: '"0.02%',
//       supplyAPR: "0.02%",
//       borrow: "603.4567",
//       borrowPrice: "$76.98",
//       borrowAPR: "34.98%",
//     },
//     {
//       name: "FLOKI",
//       price: "$1.15",
//       ltv: "0/1.04",
//       supply: '"0.02%',
//       supplyAPR: "0.02%",
//       borrow: "603.4567",
//       borrowPrice: "$76.98",
//       borrowAPR: "34.98%",
//     },
//     {
//       name: "SAMO",
//       price: "$1.15",
//       ltv: "0/1.04",
//       supply: '"0.02%',
//       supplyAPR: "0.02%",
//       borrow: "603.4567",
//       borrowPrice: "$76.98",
//       borrowAPR: "34.98%",
//     },
//     {
//       name: "MYRO",
//       price: "$1.15",
//       ltv: "0/1.04",
//       supply: '"0.02%',
//       supplyAPR: "0.02%",
//       borrow: "603.4567",
//       borrowPrice: "$76.98",
//       borrowAPR: "34.98%",
//     },
//     {
//       name: "SHIB",
//       price: "$0.00002",
//       ltv: "0/1.04",
//       supply: '"0.02%',
//       supplyAPR: "0.01%",
//       borrow: "1003.789",
//       borrowPrice: "$10.52",
//       borrowAPR: "12.23%",
//     },
//     {
//       name: "WIF",
//       price: "$1.15",
//       ltv: "0/1.04",
//       supply: '"0.02%',
//       supplyAPR: "0.02%",
//       borrow: "603.4567",
//       borrowPrice: "$76.98",
//       borrowAPR: "34.98%",
//     },
//     {
//       name: "BONK",
//       price: "$1.15",
//       ltv: "0/1.04",
//       supply: '"0.02%',
//       supplyAPR: "0.02%",
//       borrow: "603.4567",
//       borrowPrice: "$76.98",
//       borrowAPR: "34.98%",
//     },
//     {
//       name: "FLOKI",
//       price: "$1.15",
//       ltv: "0/1.04",
//       supply: '"0.02%',
//       supplyAPR: "0.02%",
//       borrow: "603.4567",
//       borrowPrice: "$76.98",
//       borrowAPR: "34.98%",
//     },
//     {
//       name: "SAMO",
//       price: "$1.15",
//       ltv: "0/1.04",
//       supply: '"0.02%',
//       supplyAPR: "0.02%",
//       borrow: "603.4567",
//       borrowPrice: "$76.98",
//       borrowAPR: "34.98%",
//     },
//     {
//       name: "MYRO",
//       price: "$1.15",
//       ltv: "0/1.04",
//       supply: '"0.02%',
//       supplyAPR: "0.02%",
//       borrow: "603.4567",
//       borrowPrice: "$76.98",
//       borrowAPR: "34.98%",
//     },
//     {
//       name: "SHIB",
//       price: "$0.00002",
//       ltv: "0/1.04",
//       supply: '"0.02%',
//       supplyAPR: "0.01%",
//       borrow: "1003.789",
//       borrowPrice: "$10.52",
//       borrowAPR: "12.23%",
//     },
//     // More rows...
//   ];

//   return (
//     <div className="table-container">
//       <ToastContainer />
//       <table className="lending-table">
//         <thead>
//           <tr>
//             <th>Asset Name</th>
//             <th>LTV/BW</th>
//             <th>Supply</th>
//             <th>Supply APR</th>
//             <th>Borrow</th>
//             <th>Borrow APR</th>
//           </tr>
//         </thead>
//         <tbody>
//           {data.map((item, index) => (
//             <tr key={index}>
//               <td className="asset-name">
//                 <div className="asset-info">
//                   <img src={tableImage} alt={item.name} />
//                   <div className="token-details">
//                     <div className="table-name">{item.name}</div>
//                     <div className="price">{item.price}</div>
//                     <button className="button-deposit" type="button" onClick={transferToken}>
//                       Deposit
//                     </button>
//                     <button className="button-deposit" type="button" onClick={transferToken}>
//                       Withdraw
//                     </button>
//                   </div>
//                 </div>
//               </td>
//               <td>{item.ltv}</td>
//               <td>
//                 <div>
//                   {item.supply}
//                   <div className="small-text">$765,768</div>
//                 </div>
//               </td>
//               <td>{item.supplyAPR}</td>
//               <td>
//                 <div>
//                   {item.borrow}
//                   <div className="small-text">{item.borrowPrice}</div>
//                 </div>
//               </td>
//               <td>{item.borrowAPR}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default LendingTable;

import React, { useContext, useEffect, useState } from "react";
import "./ShortingForm.css";
import { WalletContext } from "../WalletContext/WalletContext";

const ShortingForm = ({ setPairAddress }) => {
  const { tokenBalances, address, transferTokenShort } =
    useContext(WalletContext);
  const [baseAmount, setBaseAmount] = useState(0);
  const [shortingAsset, setShortingAsset] = useState("");
  const [shortingPrice, setShortingPrice] = useState("");
  const [multiplier, setMultiplier] = useState(2);
  const [tokenData, setTokenData] = useState([]);
  const [pricesUsd, setPricesUsd] = useState("");
  const [convertedBalance, setConvertedBalance] = useState("0.00");
  const [convertedBalanceNew, setConvertedBalanceNew] = useState("0.00");
  const [multipliedAmount, setMultipliedAmount] = useState("0.00");
  const [dollarAmt, setDollarAmt] = useState("0.00");

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
              label: pool.name,
              mintAddress: pool.mintAddress,
              balance: tokenBalances[symbol] || "0.00",
              price: pool.price,
              pairAddress: pool.pairAddress,
            };
          });

          setTokenData(mappedData);
          console.log("token fdata shroting === ", mappedData);

          if (mappedData.length > 0) {
            const firstToken = mappedData[0];
            setShortingAsset(firstToken.label);
            setShortingPrice(firstToken.price);
            setPairAddress(firstToken.pairAddress); // Set the initial pair address
            getTokenPriceInUSD(firstToken.pairAddress);
          }
        } else {
          console.error("No pools data found in the API response");
        }
      } catch (error) {
        console.error("Error fetching token data:", error);
      }
    };

    fetchData();
  }, [tokenBalances]);

  const handleAssetChange = async (e) => {
    const selectedAsset = e.target.value;
    setShortingAsset(selectedAsset);

    const selectedToken = tokenData.find(
      (token) => token.label === selectedAsset
    );
    if (selectedToken) {
      console.log("Selected Token:", selectedToken);
      console.log(
        "Pair Address for selected token:",
        selectedToken.pairAddress
      );
      setShortingPrice(selectedToken.price);
      setPairAddress(selectedToken.pairAddress); // Update pair address when token changes
      await getTokenPriceInUSD(selectedToken.pairAddress);
    }
  };

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
        const priceUsd = parseFloat(data.pair.priceUsd);
        console.log("Price in USD:", priceUsd);

        setShortingPrice(priceUsd);
        setPricesUsd(priceUsd);
      } else {
        console.error("Unexpected API response structure:", data);
        setPricesUsd("0.0000000000");
      }
    } catch (error) {
      console.error("Error fetching token price:", error);
      setPricesUsd("0.00000");
    }
  };

  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value);
    setBaseAmount(value);

    let multiplierValue = 2;
    // if (value <= 25) {
    //   multiplierValue = 1;
    // }
    if (value > 25 && value <= 50) {
      multiplierValue = 2;
    } else if (value > 50 && value <= 75) {
      multiplierValue = 5;
    } else if (value > 75) {
      multiplierValue = 10;
    }
    setMultiplier(multiplierValue);
    setMultipliedAmount(parseFloat(convertedBalance) * multiplierValue);
  };
  const sliderValue = () => {
    switch (multiplier) {
      // case 1:
      //   return 0;
      case 2:
        return 33;
      case 5:
        return 67;
      case 10:
        return 100;
      default:
        return 0;
    }
  };

  const calculateTokenAmount = (dollars, priceUsd) => {
    if (!dollars || !priceUsd) {
      return "0.00";
    } else {
      return parseFloat(dollars / priceUsd);
      // return parseFloat(dollars) / priceUsd;
    }
  };

  const handleDollarAmountChange = (e) => {
    const dollarAmount = e.target.value;
    const calculatedAmount = calculateTokenAmount(dollarAmount, shortingPrice);
    setDollarAmt(dollarAmount);
    setConvertedBalance(calculatedAmount);
    setConvertedBalanceNew(calculatedAmount * Math.pow(10, 6));
    setMultipliedAmount(parseFloat(calculatedAmount) * multiplier);
    console.log("dollarAmount balance == ", dollarAmount);
  };

  console.log("dollarAmt New  === ", dollarAmt);
  console.log("converted balance == ", convertedBalance);
  console.log("shortingPrice balance == ", shortingPrice);
  console.log("converted NEW balance == ", convertedBalanceNew);

  return (
    <div className="shorting-form-container">
      <div className="form-field">
        <label>Shorting</label>
        <div className="shorting-input">
          <select
            className="asset-info2"
            value={shortingAsset}
            onChange={handleAssetChange}
          >
            {tokenData.map((asset, index) => (
              <option key={index} value={asset.label}>
                {asset.label}
                {/* {asset.balance} */}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-field">
        <label>Price</label>
        <div className="amount-input">
          <input value={`$${pricesUsd}`} readOnly />
        </div>
      </div>

      <div className="form-field">
        <label>Enter Amount in USD</label>
        <div className="amount-input">
          <input
            // type="text"
            onChange={handleDollarAmountChange}
            disabled={!pricesUsd || !address}
            placeholder="Enter dollar amount"
          />
        </div>
      </div>

      <div className="form-field">
        <label>Show Total Amount</label>
        <div className="amount-input">
          <input
            // type="text"
            value={convertedBalance}
            readOnly
          />
        </div>
      </div>

      <div className="form-field">
        <label>Leverage: {multiplier}x</label>
        <div className="slider-container">
          <input
            type="range"
            min="36"
            max="100"
            value={sliderValue()}
            disabled={!pricesUsd && !address}
            onChange={handleSliderChange}
            className="slider"
          />
          <div className="slider-labels">
            {/* <span>1x</span> */}
            <span>2x</span>
            <span>5x</span>
            <span>10x</span>
          </div>
        </div>
      </div>

      <div className="form-field">
        <label>Amount After Leverage</label>
        <div className="amount-input">
          <input value={multipliedAmount} readOnly />
        </div>
      </div>

      <button
        className="submit-button"
        disabled={!pricesUsd || !address || !multiplier}
        onClick={() => {
          // const mintAddress = mintPublicKeys[shortingAsset]?.toString();
          transferTokenShort(
            shortingAsset,
            "F4uq3AB7uVBN28MehoV73KPQhXehMMi3A4BMij1tN2tD",
            convertedBalance,
            multiplier,
            "short"
          );
        }}
      >
        Short
      </button>
    </div>
  );
};

export default ShortingForm;

// import React, { useContext, useEffect, useState } from "react";
// import "./ShortingForm.css";
// import { WalletContext, mintPublicKeys } from "../WalletContext/WalletContext";

// const ShortingForm = () => {
//   const { handleOnShort, tokenBalances } = useContext(WalletContext);
//   const [baseAmount, setBaseAmount] = useState(0);
//   const [shortingAsset, setShortingAsset] = useState("");
//   const [shortingPrice, setShortingPrice] = useState("");
//   const [multiplier, setMultiplier] = useState(1);
//   const [tokenData, setTokenData] = useState([]);
//   const [pricesUsd, setPricesUsd] = useState("");
//   const [convertedBalance, setConvertedBalance] = useState("0.00");
//   const ipUrl = "http://192.168.1.5:9000";

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
//             setShortingAsset(firstToken.label);
//             setShortingPrice(firstToken.price);
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

//   const handleAssetChange = async (e) => {
//     const selectedAsset = e.target.value;
//     setShortingAsset(selectedAsset);

//     const selectedToken = tokenData.find((token) => token.label === selectedAsset);
//     if (selectedToken) {
//       setShortingPrice(selectedToken.price);
//       await getTokenPriceInUSD(selectedToken.pairAddress);
//     }
//   };

//   const getTokenPriceInUSD = async (pairAddress) => {
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
//         setShortingPrice(priceUsd);
//         setPricesUsd(priceUsd);
//       } else {
//         console.error("Unexpected API response structure:", data);
//         setPricesUsd("0.00");
//       }
//     } catch (error) {
//       console.error("Error fetching token price:", error);
//       setPricesUsd("0.00");
//     }
//   };

//   const handleSliderChange = (e) => {
//     const value = parseInt(e.target.value);
//     setBaseAmount(value);

//     if (value <= 25) {
//       setMultiplier(1);
//     } else if (value > 25 && value <= 50) {
//       setMultiplier(2);
//     } else if (value > 50 && value <= 75) {
//       setMultiplier(5);
//     } else if (value > 75) {
//       setMultiplier(10);
//     }
//   };

//   const sliderValue = () => {
//     switch (multiplier) {
//       case 1:
//         return 0;
//       case 2:
//         return 33;
//       case 5:
//         return 67;
//       case 10:
//         return 100;
//       default:
//         return 0;
//     }
//   };

//   const calculateTokenAmount = (dollars, priceUsd) => {
//     if (!dollars || !priceUsd) {
//       return "0.00";
//     } else {
//       return (parseFloat(dollars) / priceUsd);
//     }
//   };

//   console.log('converted balance == ',convertedBalance)
//   console.log('shortingPrice balance == ',shortingPrice)

//   return (
//     <div className="shorting-form-container">
//       <div className="form-field">
//         <label>Shorting</label>
//         <div className="shorting-input">
//           <select
//             className="asset-info2"
//             value={shortingAsset}
//             onChange={handleAssetChange}
//           >
//             {tokenData.map((asset, index) => (
//               <option key={index} value={asset.label}>
//                 {asset.label} {asset.balance}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       <div className="form-field">
//         <label>Converted Balance (in USD)</label>
//         <div className="amount-input">
//           <input value={`$${pricesUsd}`} readOnly />
//         </div>
//       </div>

//       <div className="form-field">
//         <label>Enter Amount in USD</label>
//         <div className="amount-input">
//           <input
//             // type="text"
//             onChange={(e) =>
//               setConvertedBalance(
//                 calculateTokenAmount(e.target.value, shortingPrice)
//               )
//             }
//             placeholder="Enter dollar amount"
//           />
//         </div>
//       </div>

//       <div className="form-field">
//         <label>Show Total Amount</label>
//         <div className="amount-input">
//           <input
//             type="text"
//             value={convertedBalance}
//             readOnly
//           />
//         </div>
//       </div>

//       <div className="form-field">
//         <label>Multiplier: {multiplier}x</label>
//         <div className="slider-container">
//           <input
//             type="range"
//             min="0"
//             max="100"
//             value={sliderValue()}
//             onChange={handleSliderChange}
//             className="slider"
//           />
//           <div className="slider-labels">
//             <span>1x</span>
//             <span>2x</span>
//             <span>5x</span>
//             <span>10x</span>
//           </div>
//         </div>
//       </div>

//       <button
//         className="submit-button"
//         onClick={() => {
//           const mintAddress = mintPublicKeys[shortingAsset]?.toString();
//           handleOnShort(convertedBalance, mintAddress, multiplier, "short");
//         }}
//       >
//         Short
//       </button>
//     </div>
//   );
// };

// export default ShortingForm;

// import React, { useContext, useEffect, useState } from "react";
// import "./ShortingForm.css";
// import { WalletContext, mintPublicKeys } from "../WalletContext/WalletContext";

// const ShortingForm = () => {
//   const { handleOnShort, tokenBalances } = useContext(WalletContext);
//   const [baseAmount, setBaseAmount] = useState(0);
//   const [shortingAsset, setShortingAsset] = useState("");
//   const [shortingPrice, setShortingPrice] = useState("");
//   const [multiplier, setMultiplier] = useState(1);
//   const [tokenData, setTokenData] = useState([]);
//   const [pricesUsd, setPricesUsd] = useState("");
//   const [selectedCurrency, setSelectedCurrency] = useState("USDT");

//   const [convertedBalance, setConvertedBalance] = useState("0.00"); // For storing balance in USD
//   const ipUrl = "http://192.168.1.5:9000";
//   // console.log('prices => ',prices)

//   const symbolToNameMapping = {
//     BONK: "BONK",
//     WIF: "WIF",
//     FLOKI: "FLOKI",
//     SHIB: "SHIB",
//     CORGIAI: "CORGIAI",
//   };

//   useEffect(() => {
//     // Assume default token is BONK
//     if (pricesUsd.BONK) {
//       setShortingPrice(pricesUsd.BONK);
//       setShortingAsset("BONK");
//     }
//   }, [pricesUsd]);

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
//           console.log("mapped data shorting === ", tokenData);

//           if (mappedData.length > 0) {
//             // setShortingAsset(mappedData[0].label);
//             // setShortingPrice(mappedData[0].price);
//             getTokenPriceInUSD(
//               mappedData[0].pairAddress,
//               // mappedData[0].balance
//             ); // Fetch price for the first token
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

//   console.log("shorting value => ", shortingAsset);
//   console.log("shorting price => ", shortingPrice);

//   const handleAssetChange = (e) => {
//     const selectedAsset = e.target.value;
//     setShortingAsset(selectedAsset);
//   };

//   const getTokenPriceInUSD = async (pairAddress, balance) => {
//     try {
//       const url = `https://api.dexscreener.io/latest/dex/pairs/solana/${pairAddress}`;
//       const response = await fetch(url);

//       // Ensure the response is OK
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       console.log("data balnce fdor token === ", data);

//       // Check if the data has the correct structure
//       if (data && data.pair && data.pair.priceUsd) {
//         const priceUsdd = parseFloat(data.pair.priceUsd);
//         console.log("priceUsd === ", priceUsdd);
//         console.log("balaces for price usd === ", balance);
//         setPricesUsd(priceUsdd);
//         // setShortingPrice(priceUsdd)

//         // setConvertedBalance(converted);
//       } else {
//         console.error("Unexpected API response structure:", data);
//         setConvertedBalance("0.000000"); // Default to 0.00 if there's an issue
//       }
//     } catch (error) {
//       console.error("Error fetching token price:", error);
//       setConvertedBalance("0.000000"); // Default to 0.00 on error
//     }
//   };

//   console.log('priceUsd === ',pricesUsd)
//   const handleSliderChange = (e) => {
//     const value = parseInt(e.target.value);

//     // Set the base amount to the slider value
//     setBaseAmount(value);

//     // Determine the multiplier based on the slider value and set it
//     if (value <= 25) {
//       setMultiplier(1);
//     } else if (value > 25 && value <= 50) {
//       setMultiplier(2);
//     } else if (value > 50 && value <= 75) {
//       setMultiplier(5);
//     } else if (value > 75) {
//       setMultiplier(10);
//     }
//   };

//   // Automatically move the slider when the multiplier changes
//   const sliderValue = () => {
//     switch (multiplier) {
//       case 1:
//         return 0;
//       case 2:
//         return 33;
//       case 5:
//         return 67;
//       case 10:
//         return 100;
//       default:
//         return 0;
//     }
//   };
//   // const calculateAmount = () => {
//   //   return (baseAmount * multiplier).toFixed(2);
//   // };
//   const calculateTokenAmount = (dollars, priceUsd) => {
//     if (!dollars || !priceUsd) {
//       return "0.00";
//     } else {
//       return (parseFloat(dollars) / priceUsd).toFixed(6);
//     }
//   };

//   const getMintAddress = (assetLabel) => {
//     const symbol = assetLabel.split("(")[0];
//     return mintPublicKeys[symbol]?.toString();
//   };

//   return (
//     <div className="shorting-form-container">
//       <div className="form-field">
//         <label>Shorting</label>
//         <div className="shorting-input">
//           <select
//             className="asset-info2"
//             value={shortingAsset}
//             onChange={handleAssetChange}
//           >
//             {tokenData.map((asset, index) => (
//               <option key={index} value={asset.label}>
//                 {asset.label} {asset.balance}
//               </option>
//             ))}
//           </select>
//           {/* <div className="price-info">${shortingPrice}</div> */}
//         </div>
//       </div>

//       <div className="form-field">
//         <label>Converted Balance (in USD)</label>
//         <div className="amount-input">
//           <input value={`$${pricesUsd}`} readOnly />
//         </div>
//       </div>

//       {/* <div className="form-field">
//         <label>Amount</label>
//         <div className="amount-input">
//           <div className="asset-info2">{selectedCurrency}</div>
//           <input
//             type="text"
//             // value={`${calculateAmount()}`}
//             value='1000000'
//             // value={amount}
//             onChange={handleAmountChange}
//           />
//         </div>
//       </div> */}
//       <div className="form-field">
//         <label>Enter Amount in USD</label>
//         <div className="amount-input">
//           <input
//             type="text"
//             onChange={(e) =>
//               setConvertedBalance(
//                 calculateTokenAmount(e.target.value, shortingPrice)
//               )
//             }
//             placeholder="Enter dollar amount"
//           />
//         </div>
//       </div>

//       <div className="form-field">
//         <label>Multiplier: {multiplier}x</label>
//         <div className="slider-container">
//           <input
//             type="range"
//             min="0"
//             max="100"
//             // value={baseAmount}
//             value={sliderValue()}
//             onChange={handleSliderChange}
//             className="slider"
//           />
//           <div className="slider-labels">
//             <span>1x</span>
//             <span>2x</span>
//             <span>5x</span>
//             <span>10x</span>
//           </div>
//         </div>
//       </div>

//       <button
//         className="submit-button"
//         // onClick={() => {
//         //   const mintAddress = getMintAddress(shortingAsset);
//         //   handleOnShort(mintAddress,1000000, multiplier, "short");
//         // }}
//         onClick={() => {
//           const mintAddress = mintPublicKeys[shortingAsset]?.toString();
//           handleOnShort(convertedBalance, mintAddress, multiplier, "short");
//         }}
//       >
//         Short
//       </button>
//       {/* <button className="submit-button">Long</button> */}
//     </div>
//   );
// };

// export default ShortingForm;

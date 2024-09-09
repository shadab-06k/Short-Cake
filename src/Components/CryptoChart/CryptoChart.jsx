// import React, { useState, useEffect } from "react";
// import "./CryptoChart.css";
// import ClipLoader from 'react-spinners/ClipLoader'

// const CryptoChart = ({ pairAddress }) => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [hasError, setHasError] = useState(false);

//   const chartUrl = `https://dexscreener.com/solana/${pairAddress}?embed=1&theme=dark&trades=0&info=0`;

//   useEffect(() => {
//     if (!pairAddress) {
//       setHasError(true);
//       return;
//     }

//     const timer = setTimeout(() => {
//       setHasError(true); // Set error state if loading takes too long
//       setIsLoading(false); // Remove loading state after timeout
//     }, 8000); // Set a timeout for 8 seconds in case it fails to load

//     setIsLoading(true);
//     setHasError(false);

//     // Cleanup the timer when component unmounts or when pairAddress changes
//     return () => clearTimeout(timer);
//   }, [pairAddress]);

//   const handleLoad = () => {
//     setIsLoading(false);
//     setHasError(false);
//   };

//   const handleError = () => {
//     setHasError(true);
//     setIsLoading(false);
//   };

//   return (
//     <div className="crypto-chart-container">
//       {isLoading && (
//         <p
//           style={{ fontSize: "30px" }}
//           className="my-5 d-flex justify-content-center align-items-center"
//         >
//           {/* Loading... */}
//           <ClipLoader />{" "}
//         </p>
//       )}
//       {hasError && (
//         <p
//           style={{ fontSize: "30px" }}
//           className="text-danger my-5 d-flex justify-content-center align-items-center"
//         >
//           Failed to load data. <br />
//           Server Timed Out
//         </p>
//       )}
//       {!isLoading && !hasError && (
//         <div id="dexscreener-embed">
//           <iframe
//             src={pairAddress ? chartUrl : "about:blank"}
//             title="DexScreener Chart"
//             style={{ width: "100%", height: "500px" }}
//             onLoad={handleLoad}
//             onError={handleError}
//           ></iframe>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CryptoChart;

import React from "react";
import "./CryptoChart.css";

const CryptoChart = ({ pairAddress }) => {
  const chartUrl = `https://dexscreener.com/solana/${pairAddress}?embed=1&theme=dark&trades=0&info=0`;

  return (
    <div className="crypto-chart-container">
      <div id="dexscreener-embed">
        <iframe
          src={pairAddress ? chartUrl : "about:blank"} // Use pairAddress to dynamically update the chart
          title="DexScreener Chart"
          style={{ width: "100%", height: "500px" }}
        ></iframe>
      </div>
    </div>
  );
};

export default CryptoChart;

// import React, { useEffect, useState } from "react";
// import "./CryptoChart.css";

// const CryptoChart = () => {
//   return (
//     <div className="crypto-chart-container">
//       <div id="dexscreener-embed">
//         <iframe
//           src="https://dexscreener.com/solana/3ne4mwqdyuniyryzc9tra3fcfufderghh97vnpbjicr1?embed=1&theme=dark&trades=0&info=0"
//           title="DexScreener Chart"
//         ></iframe>
//       </div>

//     </div>
//   );
// };

// export default CryptoChart;

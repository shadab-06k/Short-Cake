import React, { useState } from "react";
import ShortingForm from "../ShortingForm/ShortingForm";
import CryptoChart from "../CryptoChart/CryptoChart";
import strawImage from "../../assets/Images/strawberyImage.png";
import "./Shorting.css";
import { ToastContainer } from "react-toastify";
import OrderTable from "../OrderTables/OrderTable";

function Shorting() {
  const [pairAddress, setPairAddress] = useState(""); // State to hold the pair address

  return (
    <div className="shorting-main-container">
      <div className="shorting-container">
        <ToastContainer />
        <img src={strawImage} className="image1" alt="Decoration" />
        <img src={strawImage} className="image2" alt="Decoration" />

        <div className="chart-comp">
          {/* Pass the pair address to CryptoChart */}
          <CryptoChart pairAddress={pairAddress} />
        </div>

        <div className="short-comp">
          {/* Pass setPairAddress to ShortingForm so it can update the pair address */}
          <ShortingForm setPairAddress={setPairAddress} />
        </div>
      </div>

      <div>
        <OrderTable />
      </div>
    </div>
  );
}

export default Shorting;



// import React from "react";
// import ShortingForm from "../ShortingForm/ShortingForm";
// import CryptoChart from "../CryptoChart/CryptoChart";
// import strawImage from "../../assets/Images/strawberyImage.png";
// import "./Shorting.css";
// import { ToastContainer } from "react-toastify";
// import OrderTable from "../OrderTable/OrderTable";
// function Shorting() {
  
//   return (
//     <div className="shorting-main-container">
//       <div className="shorting-container">
//         <ToastContainer />
//         <img src={strawImage} className="image1" />
//         <img src={strawImage} className="image2" />
//         <div className="chart-comp">
//           <CryptoChart />
//         </div>
//         <div className="short-comp">
//           <ShortingForm />
//         </div>
//       </div>
//       <div>
//         <OrderTable />
//       </div>
//     </div>
//   );
// }
// export default Shorting;



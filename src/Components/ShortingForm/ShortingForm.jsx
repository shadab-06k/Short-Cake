
import React, { useState } from "react";
import "./ShortingForm.css";

const ShortingForm = () => {
  const [amount, setAmount] = useState(100);
  const [shortingAsset, setShortingAsset] = useState("BONK(60866.4)");
  const [shortingPrice, setShortingPrice] = useState("0.000017");
  const [selectedCurrency, setSelectedCurrency] = useState("USDT");

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  return (
    <div className="shorting-form-container">
      <div className="form-field">
        <label>Shorting</label>
        <div className="shorting-input">
          <div className="asset-info2">{shortingAsset}</div>
          <div className="price-info">${shortingPrice}</div>
        </div>
      </div>

      <div className="form-field">
        <label>Amount</label>
        <div className="amount-input">
          <div className="asset-info2">{selectedCurrency}</div>
          <input
            type="text"
            value={`$${amount}`}
            onChange={handleAmountChange}
          />
        </div>
      </div>

      <div className="form-field">
        <input
          type="range"
          min="0"
          max="100"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="slider"
        />
      </div>

      <div className="form-info">
        <div>Max:</div>
        <div>Cost:</div>
      </div>

      <button className="submit-button">Sell/Short</button>
    </div>
  );
};

export default ShortingForm;

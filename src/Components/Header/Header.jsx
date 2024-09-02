import React, { useContext } from "react";
import "./Header.css";
import dollImage from "../../assets/Images/header-Image.png";
import strawImage from "../../assets/Images/strawberyImage.png";
import doll2Image from "../../assets/Images/doll2.png";
import chatImage from "../../assets/Images/chatbotText.png";
import { WalletContext } from "../WalletContext/WalletContext";
import { ToastContainer } from "react-toastify";
function Header() {
  const { address, connectWallet } = useContext(WalletContext);
  return (
    <div className="header-container">
      <ToastContainer/>
      <img src={strawImage} className="image1" />
      <img src={strawImage} className="image2" />
      <img src={doll2Image} className="image3" />
      <img src={chatImage} className="image4" />
      <div className="left-header">
        <h2>
          The world's first <span>shorting</span> platform—multiply your coins
          here!
        </h2>
        <p>
          Donec porta id mi ut cursus. In interdum diam dignissim tortor tempus
          porta. Integer at auctor purus.
        </p>

        <button
          className="connect-button2"
          onClick={connectWallet}
          disabled={address}
        >
          {address ? "Wallet Connected " : "Connect Wallet"}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M23.0625 12V15.6487C23.062 15.7411 23.0252 15.8295 22.9598 15.8948C22.8945 15.9601 22.8061 15.997 22.7137 15.9975H19.0651C16.1974 15.9061 16.1948 11.7433 19.065 11.6512H22.7138C22.8061 11.6517 22.8945 11.6886 22.9599 11.7539C23.0252 11.8192 23.062 11.9076 23.0625 12ZM15.7687 13.8225C15.7693 12.9485 16.1168 12.1104 16.7348 11.4923C17.3529 10.8743 18.191 10.5268 19.065 10.5262H21.6937V6.98625C21.6938 6.76069 21.6494 6.53734 21.5631 6.32895C21.4768 6.12055 21.3503 5.9312 21.1908 5.77171C21.0313 5.61222 20.8419 5.48571 20.6336 5.39941C20.4252 5.31311 20.2018 5.26871 19.9762 5.26874H4.02375C3.87457 5.26874 3.73149 5.20948 3.626 5.10399C3.52051 4.9985 3.46125 4.85543 3.46125 4.70624C3.46125 4.55706 3.52051 4.41399 3.626 4.3085C3.73149 4.20301 3.87457 4.14375 4.02375 4.14375H18.0487V3.33749C18.0475 2.88236 17.8662 2.4462 17.5444 2.12437C17.2225 1.80253 16.7864 1.6212 16.3312 1.62H2.655C2.19966 1.62056 1.76314 1.80169 1.44117 2.12366C1.1192 2.44564 0.938067 2.88216 0.9375 3.33749V20.6625C0.938068 21.1178 1.1192 21.5544 1.44117 21.8763C1.76314 22.1983 2.19966 22.3794 2.655 22.38H19.9762C20.4316 22.3794 20.8681 22.1983 21.1901 21.8763C21.5121 21.5544 21.6932 21.1178 21.6937 20.6625V17.1225H19.065C18.1906 17.1211 17.3524 16.7728 16.7345 16.1541C16.1165 15.5355 15.7692 14.6969 15.7687 13.8225Z"
              fill="white"
            />
          </svg>
        </button>
      </div>
      <div className="right-header">
        <img src={dollImage} />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="551"
          height="514"
          viewBox="0 0 551 514"
          fill="none"
        >
          <path
            d="M172.282 13.2255C175.138 5.29042 182.666 0 191.099 0H531C542.046 0 551 8.9543 551 20V494C551 505.046 542.046 514 531 514H20.4567C6.60455 514 -3.05307 500.259 1.63897 487.226L172.282 13.2255Z"
            fill="#F31762"
          />
        </svg>
      </div>
    </div>
  );
}

export default Header;

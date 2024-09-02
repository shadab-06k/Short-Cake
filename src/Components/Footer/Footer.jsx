import React from "react";
import { Link } from "react-router-dom";
import footerImage from "../../assets/Images/footerImage.png";
import cakeImage from "../../assets/Images/cake-slice.png";
import "./Footer.css";
import FooterBelow from "../FooterBelow/FooterBelow";
function Footer() {
  return (
    <>
      <div className="footer-container">
        <div className="footer-card1">
          <div className="nav-logo">
            <div className="logo-image">
              <img src={cakeImage} />
            </div>

            <h2>Short Cake</h2>
          </div>
          <h5>We growing up your business with multiple coins</h5>
          <span>Maxwell, 2023.</span>
        </div>
        <div className="footer-card2">
          <div className="footer-card21">
            <span>Platform</span>
            <Link to="/pools">
              <p>Pooling</p>
            </Link>
            <Link to="/shorting">
              <p>Liquidity</p>
            </Link>
            <Link to="/shorting">
              <p>Shorting</p>
            </Link>
          </div>
          {/* <div className='footer-card21'>
            <span>Company</span>
                <p>Blog</p>
                <p>Careers</p>
                <p>News</p>
            </div>
            <div className='footer-card21'>
            <span>Resources</span>
                <p>Case Studies</p>
                <p>Papers</p>
                <p>Insights</p>
            </div> */}
        </div>
        <div className="footer-image">
          <img src={footerImage} />
        </div>
      </div>
      <FooterBelow />
    </>
  );
}

export default Footer;

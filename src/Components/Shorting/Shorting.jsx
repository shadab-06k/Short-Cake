import React from 'react'
import ShortingForm from '../ShortingForm/ShortingForm'
import CryptoChart from '../CryptoChart/CryptoChart'
import strawImage from "../../assets/Images/strawberyImage.png";
import './Shorting.css'
import { ToastContainer } from 'react-toastify';

function Shorting() {
  return (
    <div className='shorting-container'>
            <ToastContainer/>

                   <img src={strawImage} className="image1" />
                   <img src={strawImage} className="image2" />
        <div className='chart-comp'>
        <CryptoChart/>
        </div>
        <div className='short-comp'>
        <ShortingForm/>
        </div>
        
    </div>
  )
}

export default Shorting;
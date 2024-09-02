import React from 'react'
import LendingTable from '../LendingTable/LendingTable'
import strawImage from "../../assets/Images/strawberyImage.png";
import './Pools.css'
function Pools() {
  return (
    <div className='pool-container'>
           <img src={strawImage} className="image1" />
           <img src={strawImage} className="image2" />
        <LendingTable/>
    </div>
  )
}

export default Pools
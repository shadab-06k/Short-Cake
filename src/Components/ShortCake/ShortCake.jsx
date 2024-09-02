import React from 'react'
import './ShortCake.css'
import homeImage1 from '../../assets/Images/homeImage1.png'
import homeImage2 from '../../assets/Images/homeImage2.png'
function ShortCake() {
  return (
    <div className='shortCake-container'>
        <div className='shortcake'>
            <img src={homeImage1}/>
       
        <div className='short-cake-right'>
        <span>Short Cake Pools</span>
            <h2>Add Liquidity and Earn More</h2>
            <p>At Shortcake Finance, we believe in maximizing your earning potential. By adding liquidity to our carefully curated pools, you can earn interest and additional rewards on your crypto assets. Our platform supports a wide variety of tokens, offering you the flexibility to choose the assets that best fit your strategy.</p>
            <button className='know-button'> Know More <svg xmlns="http://www.w3.org/2000/svg" width="16" height="14" viewBox="0 0 20 20" fill="none">
<path d="M0.93934 16.9393C0.353553 17.5251 0.353553 18.4749 0.93934 19.0607C1.52513 19.6464 2.47487 19.6464 3.06066 19.0607L0.93934 16.9393ZM19.5 2C19.5 1.17157 18.8284 0.500001 18 0.500001L4.5 0.5C3.67157 0.5 3 1.17157 3 2C3 2.82843 3.67157 3.5 4.5 3.5H16.5V15.5C16.5 16.3284 17.1716 17 18 17C18.8284 17 19.5 16.3284 19.5 15.5L19.5 2ZM3.06066 19.0607L19.0607 3.06066L16.9393 0.93934L0.93934 16.9393L3.06066 19.0607Z" fill="white"/>
</svg></button>
        </div>
        </div>
        <div className='shortcake shortcake2'>
        <div className='short-cake-right'>
            <span>Smart Shorting</span>
            <h2>Profits in Every Market Condition</h2>
            <p>Markets go up, but they also go down. With Shortcake Finance, you can benefit from both directions. Our platform offers a user-friendly interface for shorting select coins, allowing you to earn more coins when prices move in your favor. Whether you're a seasoned trader or just starting, our tools make it easy to execute successful short positions.</p>
            <button className='know-button'> Know More <svg xmlns="http://www.w3.org/2000/svg" width="16" height="14" viewBox="0 0 20 20" fill="none">
<path d="M0.93934 16.9393C0.353553 17.5251 0.353553 18.4749 0.93934 19.0607C1.52513 19.6464 2.47487 19.6464 3.06066 19.0607L0.93934 16.9393ZM19.5 2C19.5 1.17157 18.8284 0.500001 18 0.500001L4.5 0.5C3.67157 0.5 3 1.17157 3 2C3 2.82843 3.67157 3.5 4.5 3.5H16.5V15.5C16.5 16.3284 17.1716 17 18 17C18.8284 17 19.5 16.3284 19.5 15.5L19.5 2ZM3.06066 19.0607L19.0607 3.06066L16.9393 0.93934L0.93934 16.9393L3.06066 19.0607Z" fill="white"/>
</svg></button>
        </div>
        
            <img src={homeImage2}/>
        </div>
    </div>
  )
}

export default ShortCake
import React, { useState } from 'react';
import './CryptoChart.css'
import CanvasJSReact from '@canvasjs/react-charts';

const CanvasJSChart = CanvasJSReact.CanvasJSChart;

const CryptoChart = () => {
    const [timeInterval, setTimeInterval] = useState('1D');

    const handleTimeIntervalChange = (interval) => {
        setTimeInterval(interval);
        // In a real scenario, fetch new data based on the interval
    };

    const options = {
        theme: "light2", 
        backgroundColor: "#ffe6e6", // Light pink background similar to the image
        animationEnabled: true,
        exportEnabled: true,
        title: {
            text: "BTC/USDT"
        },
        axisX: {
            valueFormatString: "MMM DD",
            labelFontColor: "#ff3366",
            lineColor: "#ff3366",
        },
        axisY: {
            prefix: "$",
            title: "Price (in USD)",
            titleFontColor: "#ff3366",
            labelFontColor: "#ff3366",
            lineColor: "#ff3366",
            gridThickness: 1,
            gridColor: "#ffd9e6"
        },
        data: [{
            type: "candlestick",
            showInLegend: true,
            name: "BTC/USDT",
            yValueFormatString: "$###0.00",
            xValueFormatString: "MMM DD",
            risingColor: "#ff6699",  // Color for rising candles
            fallingColor: "#cc0033",  // Color for falling candles
            dataPoints: [
                { x: new Date("2023-07-18"), y: [21800, 22000, 21700, 21900] },
                { x: new Date("2023-07-19"), y: [22000, 22100, 21800, 22050] },
                { x: new Date("2023-07-20"), y: [22050, 22200, 21900, 22150] },
                { x: new Date("2023-07-21"), y: [22150, 22400, 22000, 22200] },
                { x: new Date("2023-07-22"), y: [22200, 22800, 22100, 22600] },
                 { x: new Date("2023-07-23"), y: [22200, 22800, 22100, 22600] },
                 { x: new Date("2023-07-24"), y: [22200, 22800, 22100, 22600] },
                 { x: new Date("2023-07-25"), y: [22200, 22800, 22100, 22600] },
                 { x: new Date("2023-07-26"), y: [22200, 22800, 22100, 22600] },
                // Add more data points as per your requirement
            ]
        }]
    };

    return (
        <div >
            <div   className='chart-button'>
                <button onClick={() => handleTimeIntervalChange('1H')}>1H</button>
                <button onClick={() => handleTimeIntervalChange('3H')}>3H</button>
                <button onClick={() => handleTimeIntervalChange('5H')}>5H</button>
                <button onClick={() => handleTimeIntervalChange('1D')}>1D</button>
                <button onClick={() => handleTimeIntervalChange('1W')}>1W</button>
                <button onClick={() => handleTimeIntervalChange('1M')}>1M</button>
            </div>
            
            <CanvasJSChart options={options} />
        </div>
    );
}

export default CryptoChart;


// import React from 'react';
// import CanvasJSReact from '@canvasjs/react-charts';
// const CanvasJSChart = CanvasJSReact.CanvasJSChart;
// const CryptoChart = () => {
// 	const options = {
// 		theme: "pink", // "light1", "light2", "dark1", "dark2"
// 		animationEnabled: true,
// 		exportEnabled: true,
// 		title:{
// 			text: "Intel Corporation Stock Price -  2017"
// 		},
// 		axisX: {
// 			valueFormatString: "MMM"
// 		},
// 		axisY: {
// 			prefix: "$",
// 			title: "Price (in USD)"
// 		},
// 		data: [{
// 			type: "candlestick",
// 			showInLegend: true,
// 			name: "Intel Corporation",
// 			yValueFormatString: "$###0.00",
// 			xValueFormatString: "MMMM YY",
// 			dataPoints: [
// 				{ x: new Date("2017-01-01"), y: [36.61, 38.45, 36.19, 36.82] },
// 				{ x: new Date("2017-02-01"), y: [36.82, 36.95, 34.84, 36.20] },
// 				{ x: new Date("2017-03-01"), y: [35.85, 36.30, 34.66, 36.07] },
// 				{ x: new Date("2017-04-01"), y: [36.19, 37.50, 35.21, 36.15] },
// 				{ x: new Date("2017-05-01"), y: [36.11, 37.17, 35.02, 36.11] },
// 				{ x: new Date("2017-06-01"), y: [36.12, 36.57, 33.34, 33.74] },
// 				{ x: new Date("2017-07-01"), y: [33.51, 35.86, 33.23, 35.47] },
// 				{ x: new Date("2017-08-01"), y: [35.66, 36.70, 34.38, 35.07] },
// 				{ x: new Date("2017-09-01"), y: [35.24, 38.15, 34.93, 38.08] },
// 				{ x: new Date("2017-10-01"), y: [38.12, 45.80, 38.08, 45.49] },
//                 { x: new Date("2017-10-01"), y: [38.12, 45.80, 38.08, 45.49] },
//                 { x: new Date("2017-10-01"), y: [38.12, 45.80, 38.08, 45.49] },
//                 { x: new Date("2017-10-01"), y: [38.12, 45.80, 38.08, 45.49] },
//                 { x: new Date("2017-10-01"), y: [38.12, 45.80, 38.08, 45.49] },
//                 { x: new Date("2017-10-01"), y: [38.12, 45.80, 38.08, 45.49] },
// 				{ x: new Date("2017-11-01"), y: [45.97, 47.30, 43.77, 44.84] },
// 				{ x: new Date("2017-12-01"), y: [44.73, 47.64, 42.67, 46.16] }
// 			]
// 		}]
// 	};
// 	return (
// 		<div>
// 			<CanvasJSChart options={options} />
// 		</div>
// 	);
// }
// export default CryptoChart;
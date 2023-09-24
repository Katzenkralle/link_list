import React, { useEffect, useState, Component} from 'react';
import '../../../static/indexTailwind.css'
import { calculateBackcastDate, calculateForecastDate, findNearestDataPoints } from './FindDatapoints';
import { minMaxLineChart } from './Graph';
import { Chart } from 'chart.js/auto';
function HomeWeather(){
    const [currentWeather, setCurrentWeather] = useState({});
    const [forecastWeather, setForecastWeather] = useState({});
    const [backcastWeather, setBackcastWeather] = useState({});
    const [curerntLocation, setCurrentLocation] = useState("");
    const [basicGraphData, setBasicGraphData] = useState([]);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");

    useEffect(() => {
        getWeather();
    }
    ,[])



    const findBasicGraphData = () => {
        let currentWeatherTime = currentWeather.time;
        let currentWeatherDate = currentWeather.date;

        let workingData = []
        for (let i = 1; i < 5; i++) {
            let IDate = calculateForecastDate(currentWeatherDate, i);
            workingData.push(findNearestDataPoints(IDate, currentWeatherTime, forecastWeather))
            
            IDate = calculateBackcastDate(currentWeatherDate, i);
            workingData.unshift(findNearestDataPoints(IDate, currentWeatherTime, backcastWeather));
        }
        workingData.splice(4, 0, currentWeather);

        setBasicGraphData(workingData);
        console.log(workingData);
    }

    const getWeather = async () => {
        let location = curerntLocation != "" ? curerntLocation : "default";
        let dateTmp = date != "" ? date : "now"; 
        let timeTmp = time != "" ? time : "now"; 
        fetch(`weatherApi/data?loc=${location}&date=${dateTmp}&time=${timeTmp}`)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                setCurrentWeather(data.current);
                setForecastWeather(data.forecast);
                setBackcastWeather(data.backcast);
            })
            .then()
            .catch(error => console.error('Error:', error));
        
    }



    const drawGraph = () => {
        if (basicGraphData.length === 0) {
            return <div></div>;
        }
        
        let temperatures = []; // fix the variable name
        basicGraphData.forEach(day => {
            let weatherData; // Declare weatherData here

            if (day.hasOwnProperty('forecast_weather')) {
                
                weatherData = JSON.parse(day.forecast_weather);
                console.log(weatherData);
            } else {
                
                weatherData = JSON.parse(day.current_weather);
                console.log(weatherData);
            }
            temperatures.push(weatherData.main.temp); // fix the variable name
        });

        console.log(temperatures); // fix the variable name
        const datasets = [{
            label: 'Temperature',
            data: temperatures, // fix the variable name
            borderColor: 'red',
            backgroundColor: 'red',
        }];

        return minMaxLineChart(datasets);
    }

    return(
        <div className='content flex h-screen dark:bg-zinc-700 dark:text-white'>
            <div className='graph'>
                <button onClick={() => findBasicGraphData()}>Test</button>
                <button onClick={() => drawGraph()}>Draw</button>
                {drawGraph()}
            </div>
        </div>
    )
}

export default HomeWeather;
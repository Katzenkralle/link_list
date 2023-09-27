import React, { useEffect, useState, Component} from 'react';
import '../../../static/indexTailwind.css'
import { calculateBackcastDate, calculateForecastDate, findNearestDataPoints } from './FindDatapoints';
import { minMaxLineChart } from './Graph';
import { Chart } from 'chart.js/auto';
import { DisplaySelectedDay, DisplayForecast, Bubbles, formatDay, formatTime } from './UiComponents';

function HomeWeather(){
    const [currentWeather, setCurrentWeather] = useState({});
    const [forecastWeather, setForecastWeather] = useState({});
    const [backcastWeather, setBackcastWeather] = useState({});
    const [curerntLocation, setCurrentLocation] = useState("");
    const [basicGraphData, setBasicGraphData] = useState({"x": [], "y": []});
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [selectedDay, setSelectedDay] = useState(undefined);
    const [daysInRange, setDaysInRange] = useState([]);


    useEffect(() => {
        getWeather()
    }, []);

    useEffect(() => {
        findBasicGraphData('overwiew');
    }, [currentWeather, forecastWeather, backcastWeather]);
    
    const findBasicGraphData = (centerDate) => {
        let workingData = [];
        let scope = [];
        if (centerDate == 'overwiew' || centerDate == undefined) {
            let currentWeatherTime = currentWeather.time;
            let currentWeatherDate = currentWeather.date;
            
            if (currentWeatherDate) {
                let workingdaysInRange = [];
                 // Check if currentWeatherDate is defined
                for (let i = 1; i < 5; i++) {
                    let IDate = calculateForecastDate(currentWeatherDate, i);
                    //console.log(IDate)  
                    workingdaysInRange.push(IDate)
                    workingData.push(findNearestDataPoints(IDate, currentWeatherTime, forecastWeather));
                    
                    IDate = calculateBackcastDate(currentWeatherDate, i);
                    workingdaysInRange.unshift(IDate);
                    workingData.unshift(findNearestDataPoints(IDate, currentWeatherTime, backcastWeather));
                }
                workingData.splice(4, 0, currentWeather);
                workingdaysInRange.splice(4, 0, currentWeatherDate);
                //console.log(workingData)
                setDaysInRange(workingdaysInRange);
                scope = ["-4", "-3", "-2", "-1", "Today", "+1", "+2", "+3", "+4"]
        }} else {
            if (currentWeather.date < centerDate) {
                 workingData = forecastWeather.filter((data) => data.date == centerDate).sort((a, b) => a.time - b.time);
                 scope = forecastWeather.filter((data) => data.date == centerDate).sort((a, b) => a.time - b.time).map((data) => formatTime(data.time));
            } else {
                    workingData = backcastWeather.filter((data) => data.date == centerDate).sort((a, b) => a.time - b.time);
                    scope = backcastWeather.filter((data) => data.date == centerDate).sort((a, b) => a.time - b.time).map((data) => formatTime(data.time));
        }
        }
        setBasicGraphData({"y": workingData, "x": scope});
        
    }

    const getWeather = () => {
        
        let location = curerntLocation != "" ? curerntLocation : "default";
        let dateTmp = date != "" ? date : "now"; 
        let timeTmp = time != "" ? time : "now"; 
        fetch(`weatherApi/data?loc=${location}&date=${dateTmp}&time=${timeTmp}`)
            .then(response => response.json())
            .then(data => {
                setCurrentWeather(data.current);
                setForecastWeather(data.forecast);
                setBackcastWeather(data.backcast);
                let deepCpCurrent = JSON.parse(JSON.stringify(data.current));
                deepCpCurrent.current_weather = JSON.parse(deepCpCurrent.current_weather);
                setSelectedDay(deepCpCurrent);
            })     
            .catch(error => console.error('Error:', error));
    }


    const drawGraph = () => {
        if (basicGraphData.y.length == 0) {
            return <div></div>;
        }
        
        let absolut_temperatur = []; 
        let min_temperatur = []; 
        let max_temperatur = [];
        let feels_like = []; 
        console.log("Basic Graph:", basicGraphData)
        basicGraphData.y.forEach(day => {
            let weatherData; // Declare weatherData here

            if (day.hasOwnProperty('forecast_weather')) {
                
                weatherData = JSON.parse(day.forecast_weather);
               
            } else {
                
                weatherData = JSON.parse(day.current_weather);
                
            }
            absolut_temperatur.push(weatherData.main.temp); 
            min_temperatur.push(weatherData.main.temp_min);
            max_temperatur.push(weatherData.main.temp_max);
            feels_like.push(weatherData.main.feels_like);
        });
        console.log("Absolut temperatur:", absolut_temperatur)

        const datasets = [{
            label: 'Absolut temperatur',
            data: absolut_temperatur, 
            borderColor: 'purple',
            backgroundColor: 'purple',
            tension: 0.3
        },
        {
            label: 'Min temperatur',
            data: min_temperatur, 
            borderColor: 'blue',
            backgroundColor: 'blue',
            tension: 0.3,
            hidden: true
        },
        {
            label: 'Max temperatur',
            data: max_temperatur, 
            borderColor: 'red',
            backgroundColor: 'red',
            tension: 0.3,
            hidden: true
        },
        {
            "label": "Feels like",
            "data": feels_like, 
            "borderColor": "green",
            "backgroundColor": "green",
            tension: 0.3
        }

    ];
        
        return minMaxLineChart(datasets, basicGraphData.x);
    }

    const changeSelectedDay = (day) => {
        //Alternative, just use day for index to directly get from graph data
        let selectedDay
        //console.log(findNearestDataPoints(daysInRange[day], currentWeather.date, backcastWeather))
        if (day > 4){
            selectedDay = JSON.parse(JSON.stringify(findNearestDataPoints(daysInRange[day], currentWeather.time, forecastWeather)));
        }
        if (day < 4){
            selectedDay = JSON.parse(JSON.stringify(findNearestDataPoints(daysInRange[day], currentWeather.time, backcastWeather)));
        } 
        if (day == 4) {
            selectedDay = JSON.parse(JSON.stringify(currentWeather));
        }
        if (selectedDay.hasOwnProperty('forecast_weather')) {
            selectedDay.forecast_weather = JSON.parse(selectedDay.forecast_weather);
        } else {
            selectedDay.current_weather = JSON.parse(selectedDay.current_weather);
        }
        setSelectedDay(selectedDay)
        return
    };

    return(
        <div className='content h-screen dark:bg-zinc-700 dark:text-white'>
            <h1>Some Weather App yet without a name</h1>

            <div className='flex flex-row w-full'>
                <div className='graph basis-1/2'>
                    <select onChange={(e) => findBasicGraphData(e.target.value)}>
                        <option value="overwiew">Overview</option>
                        {daysInRange.map((day, index) => (
                            <option key={index} value={day} >{formatDay(day)}</option>
                        ))
                        }
                    </select>
                    {drawGraph()}
                    <div className='flex flex-row w-full'>
                        {Array.from({ length: 9 }, (_, i) => (
                            <button key={i} className='basis-1/9 ml-auto mr-auto' value={i} onClick={(e) => changeSelectedDay(e.target.value)}>{i-4 == 0 ? "Today" : i-4}</button>
                        ))}
                    </div>
                </div>
                <div className='basis-1/2'>
                    <DisplaySelectedDay selectedDay={selectedDay}></DisplaySelectedDay>
                </div>
            </div>
            <div>
                <Bubbles selectedDay={selectedDay} forecastWeather={forecastWeather} setSelectedDay={setSelectedDay}></Bubbles>
            </div>
            <div>
                <DisplayForecast forecastWeather={forecastWeather} currentWeather={currentWeather}></DisplayForecast>
            </div>
        </div>
    )
}

export default HomeWeather;
//
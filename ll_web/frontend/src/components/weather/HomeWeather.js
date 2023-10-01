import React, { useEffect, useState, Component} from 'react';
import '../../../static/indexTailwind.css'
import { calculateBackcastDate, calculateForecastDate, findNearestDataPoints } from './FindDatapoints';
import { minMaxLineChart } from './Graph';
import { Chart } from 'chart.js/auto';
import { DisplaySelectedDay, DisplayForecast, Bubbles, formatDay, formatTime, DateBubbles } from './UiComponents';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Import the CSS for styling
import TopBar, { topBar } from '../Other/TopBar';

function HomeWeather(){
    const [currentWeather, setCurrentWeather] = useState({});
    const [forecastWeather, setForecastWeather] = useState({});
    const [backcastWeather, setBackcastWeather] = useState({});
    const [curerntLocation, setCurrentLocation] = useState("");
    const [basicGraphData, setBasicGraphData] = useState({"x": [], "y": []});
    const [date, setDate] = useState("");
    const [selectedCenterDate, setSelectedCenterDate] = useState("overview"); // [date, setDate
    const [time, setTime] = useState("");
    const [selectedDay, setSelectedDay] = useState(undefined);
    const [daysInRange, setDaysInRange] = useState([]);

    const [profile, setProfile] = useState({});


    useEffect(() => {
        getWeather()
    }, []);

    useEffect(() => {
      
        if (date != "") {
        
        if (dateToString(date) != currentWeather.date || curerntLocation != currentWeather.loc_name) {
            getWeather()
            setSelectedCenterDate("overview")
        }
        }
        
    }, [date, curerntLocation]);

    useEffect(() => {
        findBasicGraphData('overwiew');
    }, [currentWeather, forecastWeather, backcastWeather]);
    
    const strToDate = (new_date) => {
        new_date = new_date.toString();
        const year = new_date.slice(0, 4);
        const month = new_date.slice(4, 6) - 1; // Months are zero-based (0 = January)
        const day = new_date.slice(6, 8);
        return new Date(year, month, day);
    }

    const dateToString = (new_date) => {
        const year = new_date.getFullYear();
        const month = (new_date.getMonth() + 1).toString().padStart(2, '0'); // Add 1 and pad with leading zero if needed
        const day = new_date.getDate().toString().padStart(2, '0'); // Pad with leading zero if needed
        return `${year}${month}${day}`;
    }

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
                workingdaysInRange.splice(4, 0, currentWeatherDate.toString());
                //console.log(workingData)
                setDaysInRange(workingdaysInRange);
                scope = ["-4", "-3", "-2", "-1", "Today", "+1", "+2", "+3", "+4"]
        }} else {
            if (currentWeather.date <= centerDate) {
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
        let dateTmp = date != "" ? dateToString(date) : "now"; 
        let timeTmp = time != "" ? time : "now"; 
        if (dateTmp == currentWeather.date && curerntLocation == currentWeather.loc_name) {
            return
        }
        fetch(`weatherApi/data?loc=${location}&date=${dateTmp}&time=${timeTmp}`)
            .then(response => response.json())
            .then(data => {
                if (data.hasOwnProperty('error')) {
                    setCurrentLocation("");
                    setDate("");
                    document.getElementById('errorMSG').innerHTML = data.error;
                    return
                }

                setCurrentWeather(data.current);
                setForecastWeather(data.forecast);
                setBackcastWeather(data.backcast);
                setProfile(data.profile);
            
                let deepCpCurrent = JSON.parse(JSON.stringify(data.current));
                deepCpCurrent.current_weather = JSON.parse(deepCpCurrent.current_weather);
                setSelectedDay(deepCpCurrent);

                setDate(strToDate(data.current.date));
                setCurrentLocation(data.current.loc_name)

                console.log("Current:", data.current)
                console.log("Forecast:", data.forecast)
                console.log("Backcast:", data.backcast)
                console.log(data.current.loc_name)

                document.getElementById('errorMSG').innerHTML = "";
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
        let rain_prop = [];

        basicGraphData.y.forEach(day => {
            let weatherData; // Declare weatherData here

            if (day.hasOwnProperty('forecast_weather')) {
                
                weatherData = JSON.parse(day.forecast_weather);
               
            } else {
                
                weatherData = JSON.parse(day.current_weather);
                
            }
            absolut_temperatur.push(weatherData.main.temp ? 
                weatherData.main.temp : 
                (weatherData.main.temp_min+weatherData.main.temp_max)/2); 
            min_temperatur.push(weatherData.main.temp_min);
            max_temperatur.push(weatherData.main.temp_max);
            feels_like.push(weatherData.main.feels_like ?
                weatherData.main.feels_like :
                (weatherData.main.temp_min+weatherData.main.temp_max)/2);
            rain_prop.push(weatherData.pop != null ? weatherData.pop*100 : null)
        });
        let datasets = [
            {
                label: "Absolut temperatur",
                data: absolut_temperatur,
                borderColor: "purple",
                backgroundColor: "purple",
                tension: 0.3,
            },
            {
                label: "Min temperatur",
                data: min_temperatur,
                borderColor: "blue",
                backgroundColor: "blue",
                tension: 0.3,
                hidden: true,
            },
            {
                label: "Max temperatur",
                data: max_temperatur,
                borderColor: "red",
                backgroundColor: "red",
                tension: 0.3,
                hidden: true,
            },
            {
                label: "Feels like",
                data: feels_like,
                borderColor: "green",
                backgroundColor: "green",
                tension: 0.3,
            }
        ];
            if (basicGraphData.x[4] !== "Today" && !rain_prop.every(element => element == null)) {
                 datasets.push({
                        label: "Rain Probability",
                        data: rain_prop,
                        borderColor: "white",
                        backgroundColor: "white",
                        tension: 0.3,
                })
            }
        
        
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

    const customStyleDatePicker = {
        container: provided => ({
          ...provided,
          fontFamily: 'Arial, sans-serif',
          background: 'red'
        }),
        // Add more styles as needed
      };
    return(
        <div className='content dark:text-white'>
            {TopBar()}
            <div className='flex flex-row justify-between'>
                <div className='my-auto'>
                    <select className='inputElement'
                    value={curerntLocation}
                    onChange={(e) => {console.log(e.target.value); setCurrentLocation(e.target.value);}}>
                        {profile.hasOwnProperty("locations") ? Object.entries(profile.locations).map(([key, value], index) => (
                                <option 
                                key={index} value={key}>{key}</option>
                            )) : <option value="default">Default</option>}
                    </select>
                </div>
                <div className='mx-auto'>
                    <h1 className='text-3xl'>WeeWee</h1>
                </div>
                <div className='my-auto'>
                    <DatePicker
                        className='inputElement mr-3'
                        selected={date}
                        onChange={(new_date) => setDate(new_date)}
                        style={customStyleDatePicker}/>
                </div>
            </div>



            <div className='flex lg:flex-row sm:flex-col flex-wrap w-full my-3'>
                <div className='graph w-full lg:basis-1/2 sm:'>
                    <select 
                        onChange={(e) => {findBasicGraphData(e.target.value); setSelectedCenterDate(e.target.value)}}
                        value={selectedCenterDate}
                        className='inputElement'>
                        <option value="overwiew">Overview</option>
                        {daysInRange.map((day, index) => (
                            <option key={index} value={day} >{currentWeather.date == day ? "Today" : formatDay(day) }</option>
                        ))
                        }
                    </select>

                    {drawGraph()}
                    
                    {window.window.screen.width > 768 ?
                        <DateBubbles changeSelectedDay={changeSelectedDay}/>
                        : null
                    }
                    
                </div>
                <div className='lg:basis-1/2 mt-5 pl-2 pr-2 pt-2 '>
                    <DisplaySelectedDay selectedDay={selectedDay}></DisplaySelectedDay>
                </div>
            </div>

            {window.window.screen.width < 768 ?
                        <DateBubbles changeSelectedDay={changeSelectedDay}/>
                        : null
                    }


            <div id="flex w-full justify-evenly my-3">
                <Bubbles
                    backcastWeather={backcastWeather}
                    selectedDay={selectedDay}
                    forecastWeather={forecastWeather}
                    setSelectedDay={setSelectedDay}
                ></Bubbles>
            </div>

            <div>
                <DisplayForecast forecastWeather={forecastWeather} currentWeather={currentWeather}></DisplayForecast>
            </div>
            <div id='errorMSG' style={{'color': "red"}}></div>
        </div>
    )
}

export default HomeWeather;
//
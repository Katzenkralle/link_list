import React, { useEffect, useState, Component} from 'react';
import '../../../static/indexTailwind.css'
import { calculateBackcastDate, calculateForecastDate, findNearestDataPoints, strToDate, dateToString } from './FindDatapoints';
import { minMaxLineChart } from './Graph';
import { Chart, elements } from 'chart.js/auto';
import { DisplaySelectedDay, DisplayForecast, Bubbles, formatDay, formatTime, DateBubbles } from './UiComponents';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Import the CSS for styling
import ReactDOM from 'react-dom/client';
import TopBar, { topBar } from '../Other/TopBar';
import ConfirmDialog from '../Other/ConfirmDialog';

function HomeWeather(){
    const [currentWeather, setCurrentWeather] = useState({});
    const [forecastWeather, setForecastWeather] = useState({});
    const [backcastWeather, setBackcastWeather] = useState({});
    const [curerntLocation, setCurrentLocation] = useState("");
    const [basicGraphData, setBasicGraphData] = useState({"x": [], "y": []});
    const [date, setDate] = useState(""); //selected day in obj as center date for and from datepicker
    const [selectedCenterDate, setSelectedCenterDate] = useState("overview"); // unsed for the graph
    const [selectedDay, setSelectedDay] = useState(undefined);  // Selected day and Time from Bubbles for DisplaySelectedDay in obj.forecast_weather.obj
    const [daysInRange, setDaysInRange] = useState([]); //  -4 str Dates from str date, to +4 str Dates

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
                scope = ["-4", "-3", "-2", "-1", currentWeather.date == dateToString(new Date()) ? "Today" : "Center Date", "+1", "+2", "+3", "+4"]
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

    const getWeather = (forceNow) => {
        
        let location = curerntLocation != "" ? curerntLocation : "default";
        let dateTmp = date != "" ? dateToString(date) : "now"; 
        forceNow ? dateTmp = dateToString(new Date()) : null;
        if (dateTmp == currentWeather.date && curerntLocation == currentWeather.loc_name) {
            return;
        }
        fetch(`weatherApi/data?loc=${location}&date=${dateTmp}&time=now`)
            .then(response => {
                if (response.status == 500) {
                    return {error: "internal server error"};
                }
                return response.json();
            })
            .then(data => {
                if (data == undefined || data.hasOwnProperty('error')) {
                    setCurrentLocation("");
                    setDate("");
                    ReactDOM.createRoot(document.getElementById("errorMSG")).render(<ConfirmDialog falseBtnText={"Ok."}
                    trueBtnText={"Reload Page!"} question={"An Fatal error occurred (probaply corupted wether data for te selected Date)."}
                    onConfirmation={(userResponce) => userResponce ? window.location.reload() : setDate(strToDate("19700101"))} ></ConfirmDialog>)
                    return;
                }

                setCurrentWeather(data.current);
                setForecastWeather(data.forecast);
                setBackcastWeather(data.backcast);
                setProfile(data.profile);
            
                let deepCpCurrent = JSON.parse(JSON.stringify(data.current));
                deepCpCurrent.current_weather = JSON.parse(deepCpCurrent.current_weather);
                setSelectedDay(deepCpCurrent);

                setDate(strToDate(data.current.date));
                setCurrentLocation(data.current.loc_name);

                console.log("Current:", data.current);
                console.log("Forecast:", data.forecast);
                console.log("Backcast:", data.backcast);
                console.log(data.current.loc_name);

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
        let rain = [];

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
                         
            let tempRainSum = 0;
            for (let [key, value] of Object.entries(weatherData).filter(([key, value]) => key === "rain" || key === "snow")) {
                if (value === null) {
                    tempRainSum = null;
                    break;
                } else {
                    for (let val of Object.values(value)) {
                        if (val === null) {
                            tempRainSum = null;
                            break;
                        } else {
                            tempRainSum += val;
                        }
                    }
                    if (tempRainSum === null) {
                        break;
                    }
                }
            }
            rain.push(tempRainSum);
        });
            
        let datasets = [
            {
                label: "Absolut temperatur in °C",
                data: absolut_temperatur,
                borderColor: "#ae00be",
                backgroundColor: "#ae00be",
                tension: 0.3,
            },
            {
                label: "Min temperatur in °C",
                data: min_temperatur,
                borderColor: "#2a87d9",
                backgroundColor: "#2a87d9",
                tension: 0.3,
                hidden: true,
            },
            {
                label: "Max temperatur in °C",
                data: max_temperatur,
                borderColor: "#e2329b",
                backgroundColor: "#e2329b",
                tension: 0.3,
                hidden: true,
            },
            {
                label: "Feels like in °C",
                data: feels_like,
                borderColor: "#4abe7a",
                backgroundColor: "#4abe7a",
                tension: 0.3,
            }
        ];
            //If not in overview and rain data is available --> basicGraphData.x[4] !== "Today" && 
            if (!rain_prop.every(element => element == null)) {
                 datasets.push({
                        label: "Rain Probability in %",
                        data: rain_prop,
                        borderColor: "#8673c8",
                        backgroundColor: "#8673c8",
                        tension: 0.3,
                        hidden: basicGraphData.x[4] == "Today" || basicGraphData.x[4] == "Center Date" ? true : false,
                })
            }
            if (!rain.every(element => element == null)) {
                datasets.push({
                    label: "Rain in l/m²",
                    data: rain,
                    borderColor: "#79d1f0",
                    backgroundColor: "#79d1f0",
                    tension: 0.3,
                    hidden: true,
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

                    <button className='inputElement'
                        onClick={() =>{getWeather(true)}}
                    >{formatDay(dateToString(new Date()))}</button>

                    <DatePicker
                        className='inputElement mr-3 ml-1'
                        selected={date}
                        onChange={(newDate) => setDate(newDate)}
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
                            <option key={index} value={day} >{currentWeather.date == day ? currentWeather.date == dateToString(new Date()) ? "Today" : "Center Date" : formatDay(day) }</option>
                        ))
                        }
                    </select>

                    {drawGraph()}
                    
                    {window.window.screen.width > 768 ?
                        <DateBubbles currentWeatherDate={currentWeather.date} daysInRange={daysInRange} selectedDay={selectedDay} changeSelectedDay={changeSelectedDay}/>
                        : null
                    }
                    
                </div>
                <div className='lg:basis-1/2 mt-5 pl-2 pr-2 pt-2 '>
                    <DisplaySelectedDay selectedDay={selectedDay}></DisplaySelectedDay>
                </div>
            </div>

            {window.window.screen.width < 768 ?
                        <DateBubbles currentWeatherDate={currentWeather.date} daysInRange={daysInRange} selectedDay={selectedDay} changeSelectedDay={changeSelectedDay}/>
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
            <div id='errorMSG'></div>
        </div>
    )
}

export default HomeWeather;
//
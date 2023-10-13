import React, { useEffect, useState, Component } from 'react';
import '../../../static/indexTailwind.css'
import { getWeekdayFromDate, calculateBackcastDate, calculateForecastDate, findNearestDataPoints, strToDate, dateToString } from './FindDatapoints';
import LineChart, { minMaxLineChart } from './Graph';
import { Chart, elements } from 'chart.js/auto';
import { DisplaySelectedDay, DisplayForecast, Bubbles, formatDay, formatTime, DateBubbles } from './UiComponents';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Import the CSS for styling
import ReactDOM from 'react-dom/client';
import TopBar, { topBar } from '../Other/TopBar';
import BottomBar from '../Other/BottomBar';
import ConfirmDialog from '../Other/ConfirmDialog';
import LoadingAnimation from '../Other/LoadingAnimation';

function HomeWeather() {
    const [currentWeather, setCurrentWeather] = useState({});
    const [forecastWeather, setForecastWeather] = useState([]);
    const [backcastWeather, setBackcastWeather] = useState([]);
    const [curerntLocation, setCurrentLocation] = useState("");
    const [date, setDate] = useState(""); //selected day in obj as center date for and from datepicker
    const [selectedCenterDate, setSelectedCenterDate] = useState("overview"); // unsed for the graph
    const [selectedDay, setSelectedDay] = useState(undefined);  // Selected day and Time from Bubbles for DisplaySelectedDay in obj.forecast_weather.obj
    const [daysInRange, setDaysInRange] = useState([]); //  -4 str Dates from str date, to +4 str Dates
    const [profile, setProfile] = useState({});
    const [weatherCodes, setWeatherCodes] = useState({});


    useEffect(() => {
        getWeather()
    }, []);

    useEffect(() => {
        if (currentWeather.hasOwnProperty('date')) {
            let workingdaysInRange = [];
            for (let i = 1; i < 5; i++) {
                let IDate = calculateForecastDate(currentWeather.date, i);
                workingdaysInRange.push(IDate)
                IDate = calculateBackcastDate(currentWeather.date, i);
                workingdaysInRange.unshift(IDate);
            }
            workingdaysInRange.splice(4, 0, currentWeather.date.toString());
            setDaysInRange(workingdaysInRange);
        }
    }, [currentWeather]);

    useEffect(() => {

        if (date != "") {
            if (dateToString(date) != currentWeather.date || curerntLocation != currentWeather.loc_name) {
                getWeather()
                setSelectedCenterDate("overview")
            }
        }

    }, [date, curerntLocation]);

    const getWeather = (forceNow) => {
        document.getElementById("loadingAnimation").style.display = "";
        let location = curerntLocation != "" ? curerntLocation : "default";
        let dateTmp = date != "" ? dateToString(date) : "now";
        forceNow ? dateTmp = dateToString(new Date()) : null;
        if (dateTmp == currentWeather.date && curerntLocation == currentWeather.loc_name) {
            return;
        }
        fetch(`weatherApi/data?loc=${location}&date=${dateTmp}&time=now`)
            .then(response => {
                document.getElementById("loadingAnimation").style.display = "none";
                if (response.status == 500) {
                    return { error: "internal server error" };
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
                setSelectedCenterDate("overview")
                setCurrentWeather(data.current);
                setForecastWeather(data.forecast);
                setBackcastWeather(data.backcast);
                setProfile(data.profile);

                let deepCpCurrent = JSON.parse(JSON.stringify(data.current));
                deepCpCurrent.current_weather = JSON.parse(deepCpCurrent.current_weather);
                setSelectedDay(deepCpCurrent);

                setDate(strToDate(data.current.date));
                setCurrentLocation(data.current.loc_name);

                //this stays for transparancy
                console.log("Current:", data.current);
                console.log("Forecast:", data.forecast);
                console.log("Backcast:", data.backcast);

                document.getElementById('errorMSG').innerHTML = "";
            })
            .catch(error => console.error('Error:', error));
    }


    const changeSelectedDay = (day) => {
        //Alternative, just use day for index to directly get from graph data
        let selectedDay
        //console.log(findNearestDataPoints(daysInRange[day], currentWeather.date, backcastWeather))
        if (day > 4) {
            selectedDay = JSON.parse(JSON.stringify(findNearestDataPoints(daysInRange[day], currentWeather.time, forecastWeather)));
        }
        if (day < 4) {
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


    return (
        <div className='content flex flex-col text-cat-main'>
            {TopBar()}
            <main className='max-w-[1624px] mx-auto shrink-0 grow-0 overflow-x-hidden'>
                <div className='flex flex-wrap justify-between'>

                    <div className='my-auto sm:order-2'>
                        <select className='inputElement'
                            value={curerntLocation}
                            onChange={(e) => {setCurrentLocation(e.target.value); }}>
                            {profile.hasOwnProperty("locations") ? Object.entries(profile.locations).map(([key, value], index) => (
                                <option
                                    key={index} value={key}>{key}</option>
                            )) : <option value="default">Default</option>}
                        </select>
                    </div>

                    <div className='mx-auto text-center sm:w-full sm:order-1'>
                        <h1 className='text-3xl'>WeeWee</h1>
                    </div>

                    <div className='sm:order-3 flex flex-row items-center'>
                        <DatePicker
                            className='inputElement !max-w-[8em] z-100 my-auto '
                            selected={date}
                            onChange={(newDate) => newDate !== null ? setDate(newDate) : null}
                            dateFormat="dd.MM.yy"
                        />
                        <div className='imgAsOverlyContainer ml-2'>
                            <button className='inputElement !p-2'
                                onClick={() => { getWeather(true) }}
                            >{new Date().getDate().toString().padStart(2, '0')}</button>
                            <img src='../../../static/media/calender_empty.png' 
                            className='imgAsOverly !opacity-100 translate-y-[-4px]'/>
                        </div>
                    </div>

                </div>

                <div className='flex lg:flex-row sm:flex-col w-full my-3'>
                    <div className='graph w-full lg:basis-1/2 sm:min-h-[400px]'>

                        <select
                            onChange={(e) => { setSelectedCenterDate(e.target.value) }}
                            value={selectedCenterDate}
                            className='inputElement'>
                            <option value="overview">Overview</option>
                            {daysInRange.map((day, index) => (
                                <option key={index} value={day} >{currentWeather.date == day ? currentWeather.date == dateToString(new Date()) ? "Today" : "Center Date" : `${getWeekdayFromDate(day)} (${formatDay(day)})`}</option>
                            ))}
                        </select>

                        
                        {Object.keys(backcastWeather).length == 0 || Object.keys(forecastWeather).length == 0 ? <div></div> :
                            LineChart(forecastWeather, backcastWeather, currentWeather, selectedCenterDate, daysInRange)
                        }
                        


                        {window.window.screen.width > 768 ?
                            <DateBubbles
                            currentWeatherDate={currentWeather.date} 
                            daysInRange={daysInRange} selectedDay={selectedDay} 
                            changeSelectedDay={changeSelectedDay} />
                            : null
                        }

                    </div>
                    <div className='lg:basis-1/2 mt-5 lg:ml-3'>
                        <DisplaySelectedDay selectedDay={selectedDay}></DisplaySelectedDay>
                    </div>
                </div>

                {window.window.screen.width < 768 ?
                    <DateBubbles currentWeatherDate={currentWeather.date} daysInRange={daysInRange} selectedDay={selectedDay} changeSelectedDay={changeSelectedDay} />
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
                    {/*Needs backcast for center date*/ }
                    {backcastWeather.length != 0 ? (
                    <DisplayForecast 
                    forecastWeather={forecastWeather} 
                    currentWeather={currentWeather}
                    backcastWeather={backcastWeather.filter((value) => value.date == dateToString(date))}></DisplayForecast>
                    ) : <div/>}
                </div> 

                <div id='errorMSG'></div>
                <LoadingAnimation/>
            </main>
        {BottomBar()}
        </div>
    )
}

export default HomeWeather;
//
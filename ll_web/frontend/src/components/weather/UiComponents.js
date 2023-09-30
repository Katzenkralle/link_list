import React from "react";
import { calculateForecastDate, ZipFindExtremeValues, colorByTemp } from "./FindDatapoints";



export const formatTime = (time) => {
    time = time.toString();
    while (time.length < 4) {
        time = "0" + time;
    }
    return `${time.substring(0, 2)}:${time.substring(2,4)}`
}

export const formatDay = (date) => {
    date = date.toString();
    return `${date.substring(6, 8)}.${date.substring(4,6)}.${date.substring(0, 4)}`
}

export const DisplaySelectedDay = (props) => {
    if (props.selectedDay === undefined) {
        return <div>Loading...</div>;
    }
    
    //console.log(props.selectedDay);
    const weather_info = props.selectedDay.hasOwnProperty("forecast_weather")
        ? props.selectedDay.forecast_weather
        : props.selectedDay.current_weather;

    if (weather_info.main == undefined) {
        return <div>No Data...</div>;
    }
    return (
        weather_info.main.temp == null && weather_info.main.sea_level == null && weather_info.main.temp_max == null ? <div>Sadly, there seems to be no Data or an Error occurred</div> :
        <div className="bg-blue-950 rounded-md h-full mt-5 ml-2 mr-2 pl-2 pr-2 pt-2">
            <h2 className="">
                Weather for{" "}
                {formatDay(props.selectedDay.date)}{" "}
                at {formatTime(props.selectedDay.time)}
            </h2>
            <div className="mr-3">
                <h3 className="infoHl">Temperature:</h3>
                {weather_info.main.hasOwnProperty("temp") ? (
                <div>
                <p>Feels like: {weather_info.main.feels_like}°C</p>
                <p>Absolut: {weather_info.main.temp}°C</p>
                </div>) : <div></div>}
                {weather_info.main.temp_min !== weather_info.main.temp_max ? (
                    <div>
                        <p>Min: {weather_info.main.temp_min}°C</p>
                        <p>Max: {weather_info.main.temp_max}°C</p>
                    </div>
                ) : (
                    <div></div>
                )}
            </div>
            {weather_info.main.hasOwnProperty("humidity") ? (
            <div>
                <h3 className="infoHl">Climates:</h3>
                <p>Humidity: {weather_info.main.humidity}%</p>
                <p>Pressure: {weather_info.main.pressure ? weather_info.main.pressure : weather_info.main.sea_level}pHa</p>
            </div>) : <div></div>}
            
            {weather_info.wind.hasOwnProperty("speed") ? (
            <div>
                <h3 className="infoHl">Weather:</h3>
                <p>Wind Speed: {weather_info.wind.speed}m/s</p>
                <p>Wind Direction: {weather_info.wind.deg}°</p>
                {weather_info.pop >=0 && weather_info.pop != null ? <p>Rain probability: {(weather_info.pop*100).toFixed(2)}%</p> : undefined}
                {weather_info.weather.map((weather, index) => (
                    <p key={index}>→ {weather.description}</p>
                ))}
            </div>) : <div></div>}
        </div>
    );
};

export const DisplayForecast = (props) => {
    if (!Array.isArray(props.forecastWeather) || props.forecastWeather.length === 0) {
        return <div>Loading...</div>;
    }
    const unpackedForecast = props.forecastWeather.map((day) => {
        return JSON.parse(day.forecast_weather);
    });

    const unpackedCurrent = JSON.parse(props.currentWeather.current_weather);
   
    return(
        <div className="flex w-full">
            <div className="basis-1/5">
                <h3>Today</h3>
                <p>Max {ZipFindExtremeValues([...props.forecastWeather, props.currentWeather], [...unpackedForecast, unpackedCurrent], "main.temp_max",
                    props.currentWeather.date)[0]}°C</p>
                <p>Min {ZipFindExtremeValues([...props.forecastWeather, props.currentWeather], [...unpackedForecast, unpackedCurrent], "main.temp_min",
                    props.currentWeather.date)[1]}°C</p>
                <p>Chance of Rain {(ZipFindExtremeValues(props.forecastWeather, unpackedForecast, "pop",
                    props.currentWeather.date)[2]*100).toFixed(2)}%</p>
            </div>
            {[1, 2, 3, 4].map((i) => {
                let date = calculateForecastDate(props.currentWeather.date, i);

                return (
                    <div key={i} className="basis-1/5">
                        <h3>{formatDay(date)}</h3>
                        <p>Max {ZipFindExtremeValues(props.forecastWeather, unpackedForecast, "main.temp",
                         date)[0]}°C</p>
                        <p>Min {ZipFindExtremeValues(props.forecastWeather, unpackedForecast, "main.temp",
                         date)[1]}°C</p>
                        <p>Average {(ZipFindExtremeValues(props.forecastWeather, unpackedForecast, "pop",
                            date)[0]*100).toFixed(2)} % Rain probability</p>
                    </div>
                );
            })}
        </div>
    );
};


export const Bubbles = (props) => {
    if (!Array.isArray(props.forecastWeather) || props.forecastWeather.length === 0 || props.selectedDay === undefined ||
        !Array.isArray(props.backcastWeather) || props.backcastWeather.length === 0) {
        return <div>Loading...</div>;
    }

        return(
            <div className="flex flex-row">
                {props.forecastWeather.sort((a, b) => a.time - b.time)
                .map((day, i) => {
                    let deepCpDay = JSON.parse(JSON.stringify(day))
                    deepCpDay.forecast_weather = JSON.parse(day.forecast_weather)
                    if (day.date === props.selectedDay.date) {
                        
                        return (
                            <div className="relative inline-block">
                                <button
                                style={{backgroundColor: colorByTemp(deepCpDay.forecast_weather.main.temp), color: "black"}}
                                className="ml-2 mr-2" key={i} onClick={() => {
                                    props.setSelectedDay(deepCpDay)}}>{formatTime(day.time)}</button>
                                {deepCpDay.forecast_weather.pop > 0 ? <img key={i+"a"} className="absolute top-0 left-0 w-full h-full bg-transparent bg-center bg-no-repeat bg-cover opacity-50 pointer-events-none" src="../../../static/media/raindrop.png"></img>
                                : null}
                            </div>
                            
                        );
                    }
                    return null;
                })}
                {props.backcastWeather.sort((a, b) => a.time - b.time)
                .map((day, i) => {
                    let deepCpDayB = JSON.parse(JSON.stringify(day))
                    
                    deepCpDayB.backcastWeather = day.hasOwnProperty("forecast_weather") ? JSON.parse(day.forecast_weather) : JSON.parse(day.current_weather)
                    if (day.date === props.selectedDay.date) {
                        
                        return (
                            <div className="relative inline-block">
                                <button
                                style={{backgroundColor: colorByTemp(deepCpDayB.backcastWeather.main.temp), color: "black"}}
                                className="ml-2 mr-2" key={i} onClick={() => {
                                    props.setSelectedDay(deepCpDayB)}}>{formatTime(day.time)}</button>
                                {deepCpDayB.backcastWeather.pop > 0 ? <img key={i+"a"} className="absolute top-0 left-0 w-full h-full bg-transparent bg-center bg-no-repeat bg-cover opacity-50 pointer-events-none" src="../../../static/media/raindrop.png"></img>
                                : null}
                            </div>
                            
                        );
                    }
                    return null;
                })}
          </div>      
        );
    };

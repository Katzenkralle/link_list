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
        return <div className="infoContainer">
            <h3 className="infoHl">Loading...</h3>
            <p>If you have set an API key, it might be invalid!</p>
            <p>Thus no data can be fetch, try unsettling it <a className="text-pink-500" href="/settings">in the settings</a>.</p>
        </div>;
    }
    
    //console.log(props.selectedDay);
    const weather_info = props.selectedDay.hasOwnProperty("forecast_weather")
        ? props.selectedDay.forecast_weather
        : props.selectedDay.current_weather;

    if (weather_info.main == undefined) {
        return <div className="infoContainer">No Data...</div>;
    }
    return (
        weather_info.main.temp == null && weather_info.main.sea_level == null && weather_info.main.temp_max == null ? <div className="infoContainer">Sadly, there seems to be no Data or an Error occurred</div> :
        <div className="infoContainer">
            <h2 className="h-min ml-2 -mt-2">
                Weather for{" "}
                {formatDay(props.selectedDay.date)}{" "}
                at {formatTime(props.selectedDay.time)}
            </h2>

            <div className="flex flex-wrap justify-evenly">
                <div className="infoBox">
                    <h3 className="infoHl">Temperature</h3>
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
                <div className="infoBox">
                    <h3 className="infoHl">Climates</h3>
                    <p>Humidity: {weather_info.main.humidity}%</p>
                    <p>Pressure: {weather_info.main.pressure ? weather_info.main.pressure : weather_info.main.sea_level}pHa</p>
                </div>) : <div></div>}
                
                {weather_info.wind.hasOwnProperty("speed") ? (
                <div className="infoBox">
                    <h3 className="infoHl">Weather</h3>
                    <p>Wind Speed: {weather_info.wind.speed}m/s</p>
                    <p>Wind Direction: {weather_info.wind.deg}°</p>
                    {weather_info.pop >=0 && weather_info.pop != null ? <p>Rain probability: {(weather_info.pop*100).toFixed(2)}%</p> : undefined}
                    {weather_info.weather.map((weather, index) => (
                        weather.description != null ?
                        <p key={index}>→ {weather.description}</p> : null
                    ))}
                </div>) : <div></div>}
            </div>
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
        <div className="flex flex-wrap lg:flex-row sm:flex-col w-full my-3 justify-evenly">
            <div className="lg:basis-1/5 bg-blue-950 shrink-0 m-1 p-2 rounded-lg">
                <h3 className="infoHl">Today</h3>
                <p>Max {ZipFindExtremeValues([...props.forecastWeather, props.currentWeather], [...unpackedForecast, unpackedCurrent], "main.temp_max",
                    props.currentWeather.date)[0]}°C</p>
                <p>Min {ZipFindExtremeValues([...props.forecastWeather, props.currentWeather], [...unpackedForecast, unpackedCurrent], "main.temp_min",
                    props.currentWeather.date)[1]}°C</p>
                {props.forecastWeather.hasOwnProperty('pop') ? 
                <p>Chance of Rain {(ZipFindExtremeValues(props.forecastWeather, unpackedForecast, "pop",
                    props.currentWeather.date)[2]*100).toFixed(2)}%</p> : null}
            </div>
            {[1, 2, 3, 4].map((i) => {
                let date = calculateForecastDate(props.currentWeather.date, i);

                return (
                    <div key={i} className="lg:basis-1/5 bg-blue-950 shrink-0 m-1 p-2 rounded-lg">
                        <h3 className="infoHl">{formatDay(date)}</h3>
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
    let bubbels_exist = false;

    return (
        <div>
            <div className="flex flex-row flex-wrap justify-around" id="bubbles">
                {props.forecastWeather.sort((a, b) => a.time - b.time)
                    .map((day, i) => {
                        let deepCpDay = JSON.parse(JSON.stringify(day))
                        deepCpDay.forecast_weather = JSON.parse(day.forecast_weather)
                        if (day.date === props.selectedDay.date) {
                            bubbels_exist = true;
                            return (
                                <div className="relative inline-block" key={i}>
                                    <button
                                        style={{backgroundColor: colorByTemp(deepCpDay.forecast_weather.main.temp), color: "black"}}
                                        className="text-sm rounded-full m-1 px-2 py-1" onClick={() => {
                                            props.setSelectedDay(deepCpDay)
                                        }}>{formatTime(day.time)}</button>
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
                            bubbels_exist = true;
                            return (
                                <div className="relative inline-block" key={i}>
                                    <button
                                        style={{backgroundColor: colorByTemp(deepCpDayB.backcastWeather.main.temp), color: "black"}}
                                        className="text-sm rounded-full m-1 px-2 py-1" 
                                        onClick={() => {
                                            props.setSelectedDay(deepCpDayB)
                                        }}>{formatTime(day.time)}</button>
                                    {deepCpDayB.backcastWeather.pop > 0 ? <img key={i+"a"} className="absolute top-0 left-0 w-full h-full bg-transparent bg-center bg-no-repeat bg-cover opacity-50 pointer-events-none" src="../../../static/media/raindrop.png"></img>
                                    : null}
                                </div>

                            );
                        }
                        return null;
                    })}
            </div>
            {!bubbels_exist ? <p className="bg-gray-600 flex justify-center mx-1 rounded-lg">No timebubbles for today!</p> : null}
        </div>
    );
};

export const DateBubbles = (props) => {
    return(
    <div className='flex flex-row w-full inputElement mx-1 mb-2'>
    {Array.from({ length: 9 }, (_, i) => (
        <button 
            key={i}
            className='basis-1/9 ml-auto mr-auto pl-4 pr-4'
            value={i}
            onClick={(e) => props.changeSelectedDay(e.target.value)}>
            {i-4 == 0 ? "Today" : i-4}</button>
    ))}
    </div>)
}
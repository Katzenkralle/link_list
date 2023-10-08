import React from "react";
import { getWeekdayFromDate, getSumOfDownfall, calculateForecastDate, ZipFindExtremeValues, colorByTemp, dateToString } from "./FindDatapoints";
import "../../../static/animations.css"

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
        <div key={`${props.selectedDay.time}${props.selectedDay.date}}`}
         className="infoContainer fadeInRight lg:max-h-[0px] sm:max-h-auto overflow-y-scroll">
            <h2 className="h-min ml-2 -mt-2">
                Weather for{" "}
                {formatDay(props.selectedDay.date)}{" "}
                at {formatTime(props.selectedDay.time)}
            </h2>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 mt-2 p-2 overflow-scroll">
                <div className="infoBox">
                    <h3 className="infoHl">Temperature</h3>
                    {weather_info.main.hasOwnProperty("temp") ? (
                    <div>
                        <div className="infoRow">
                            <img src="../../../static/media/temp.png" className="symbole"></img>
                            <p>Feels like: {weather_info.main.feels_like}°C</p>
                        </div>
                        <div className="infoRow">
                            <img src="../../../static/media/abs_temp.png" className="symbole"></img>
                            <p>Absolute: {weather_info.main.temp}°C</p>
                        </div>

                        </div>) : null}
                        {weather_info.main.temp_min !== weather_info.main.temp_max ? (
                            <div>
                                <div className="infoRow">
                                    <img src="../../../static/media/min_temp.png" className="symbole"></img>
                                    <p>Min: {weather_info.main.temp_min}°C</p>
                                </div>
                                <div className="infoRow">
                                    <img src="../../../static/media/max_temp.png" className="symbole"></img>
                                    <p>Max: {weather_info.main.temp_max}°C</p>
                                </div>
                            </div>
                    ) : (
                        null
                    )}
                </div>

                {weather_info.main.hasOwnProperty("humidity") ? (
                <div className="infoBox">
                    <h3 className="infoHl">Climates</h3>
                    <div className="infoRow">
                        <img src="../../../static/media/humidity.png" className="symbole"></img>
                        <p>Humidity: {weather_info.main.humidity}%</p>
                    </div>
                    <div className="infoRow">
                        <img src="../../../static/media/pressure.png" className="symbole"></img>
                        <p>Pressure: {weather_info.main.pressure ? weather_info.main.pressure : weather_info.main.sea_level}pHa</p>
                    </div>
                </div>) : null}
                
                {weather_info.wind.hasOwnProperty("speed") ? (
                <div className="infoBox">
                    <h3 className="infoHl">Wind</h3>
                    <div className="infoRow">
                        <img src="../../../static/media/wind_speed.png" className="symbole"></img>
                        <p>Wind Speed: {weather_info.wind.speed}m/s</p>
                    </div>
                    <div className="infoRow">
                        <img src="../../../static/media/wind_dir.png" className="symbole"></img>
                        <p>Wind Direction: {weather_info.wind.deg}°</p>
                    </div>
                    {weather_info.hasOwnProperty("wind_gust") ? (
                    <div className="infoRow">
                        <img src="../../../static/media/wind_gust.png" className="symbole"></img>
                        <p>Gust: {weather_info.wind.gust}m/s</p>
                    </div>) : null}
                </div>) : null}
                
                {weather_info.hasOwnProperty("rain") || weather_info.hasOwnProperty("snow") || (weather_info.pop >= 0 && weather_info.pop != null) ? (
                    <div className="infoBox">
                        <h3 className="infoHl">Precipitation</h3>
                        {weather_info.hasOwnProperty("rain") && weather_info.rain !== null  ? (
                            <div className="infoRow">
                                <img src="../../../static/media/rain.png" className="symbole"></img>
                                <p>Rain: {weather_info.rain.hasOwnProperty("1h") ? `${weather_info.rain["1h"]}mm (1h)` :
                                `${weather_info.rain["3h"]}mm (3h)`}</p>
                            </div>
                        ) : null}
                        {weather_info.hasOwnProperty("snow") && weather_info.snow !== null ? (
                            <div className="infoRow">
                                <img src="../../../static/media/snow.png" className="symbole"></img>
                                <p>Snow: {weather_info.snow.hasOwnProperty("1h") ? `${weather_info.snow["1h"]}mm (1h)` :
                                `${weather_info.snow["3h"]}mm (3h)}`}</p>
                            </div>
                        ) : null}
                        {weather_info.pop >= 0 && weather_info.pop != null ? (
                            <div className="infoRow">
                                <img src="../../../static/media/chance_of_rain.png" className="symbole"></img>
                                <p>Rain probability: {(weather_info.pop * 100).toFixed(2)}%</p>
                            </div>
                        ) : undefined}
                    </div>
                   
                ) : null}

                {weather_info.hasOwnProperty("sys") && weather_info.sys.hasOwnProperty("sunrise") ? (
                <div className="infoBox">
                    <h3 className="infoHl">General</h3>
                    <div className="infoRow">
                        <img src="../../../static/media/sunrise.png" className="symbole"></img>
                        <p>Sunrise: {formatTime(weather_info.sys.sunrise)}</p>
                    </div>
                    <div className="infoRow">
                        <img src="../../../static/media/sunset.png" className="symbole"></img>
                        <p>Sunset: {formatTime(weather_info.sys.sunset)}</p>
                    </div>
                    {weather_info.weather.map((weather, index) => (
                        weather.description != null ?
                        <div className="infoRow" key={index}>
                            <img src="../../../static/media/weather.png" className="symbole"></img>
                            <p key={index}>→ {weather.description}</p>
                        </div> : null
                    ))}
                </div>) : <div></div>    
                }
            </div>
        </div>
    );
};

export const DisplayForecast = (props) => {
    if (!Array.isArray(props.forecastWeather) || props.forecastWeather.length === 0) {
        return <div>Loading...</div>;
    }
    const unpackedForecast = props.forecastWeather.map((day) => {
        return JSON.parse(day.hasOwnProperty("forecast_weather") ? day.forecast_weather : day.current_weather);
    });

    const unpackedCurrent = JSON.parse(props.currentWeather.current_weather);
   
    return(
        <div key={props.currentWeather.date} 
        className="flex flex-wrap lg:flex-row sm:flex-col w-full my-3 justify-evenly scaleInVerBottom">
            <div className="lg:basis-1/5 bg-blue-950 shrink-0 m-1 p-2 rounded-lg">
                <h3 className="infoHl">{props.currentWeather.date == dateToString(new Date()) ? "Today" : "Center Date"}</h3>
                <div className="infoRow">
                    <img src="../../../static/media/max_temp.png" className="symbole"></img>
                    <p>Max {ZipFindExtremeValues([...props.forecastWeather, props.currentWeather], [...unpackedForecast, unpackedCurrent], "main.temp_max",
                        props.currentWeather.date)[0]}°C</p>
                </div>
                <div className="infoRow">
                    <img src="../../../static/media/min_temp.png" className="symbole"></img>
                <p>Min {ZipFindExtremeValues([...props.forecastWeather, props.currentWeather], [...unpackedForecast, unpackedCurrent], "main.temp_min",
                    props.currentWeather.date)[1]}°C</p>
                </div>
                
                {props.forecastWeather.hasOwnProperty('pop') ? 
                <div className="infoRow">
                <img src="../../../static/media/chance_of_rain.png" className="symbole"></img>
                <p>Max chance of Rain {(ZipFindExtremeValues(props.forecastWeather, unpackedForecast, "pop",
                    props.currentWeather.date)[2]*100).toFixed(2)}%</p> </div>
                    : null}
                
            </div>
            {[1, 2, 3, 4].map((i) => {
                let date = calculateForecastDate(props.currentWeather.date, i);

                return (
                    <div key={i} className="lg:basis-1/5 bg-blue-950 shrink-0 m-1 p-2 rounded-lg">
                        <h3 className="infoHl">{formatDay(date)}</h3>
                        <div className="infoRow">
                            <img src="../../../static/media/max_temp.png" className="symbole"></img>
                            <p>Max {ZipFindExtremeValues(props.forecastWeather, unpackedForecast, "main.temp",
                            date)[0]}°C</p>
                        </div>
                        <div className="infoRow">
                            <img src="../../../static/media/min_temp.png" className="symbole"></img>
                            <p>Min {ZipFindExtremeValues(props.forecastWeather, unpackedForecast, "main.temp",
                                date)[1]}°C</p>
                        </div>
                        {!unpackedForecast.every(element => element.pop == null) ?
                        <div className="infoRow">
                            <img src="../../../static/media/chance_of_rain.png" className="symbole"></img>
                            <p>Average {(ZipFindExtremeValues(props.forecastWeather, unpackedForecast, "pop",
                                date)[2]*100).toFixed(2)} % Rain probability</p>
                        </div> : null}

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
        <div key={props.selectedDay.date}>
            <div className="flex flex-row flex-wrap justify-around puffInVer" id="bubbles">
                {props.forecastWeather.concat(props.backcastWeather).sort((a, b) => a.time - b.time)
                    .map((day, i) => {
                        let deepCpDay = JSON.parse(JSON.stringify(day))
                        deepCpDay.forecast_weather = deepCpDay.hasOwnProperty("forecast_weather") ? JSON.parse(day.forecast_weather) : JSON.parse(day.current_weather)
                        if (day.date === props.selectedDay.date) {
                            bubbels_exist = true;
                            return (
                                <div className="imgAsOverlyContainer" key={i}>
                                    <button
                                        style={{backgroundColor: colorByTemp(deepCpDay.forecast_weather.main.temp), color: "black"}}
                                        className={`text-sm rounded-full m-1 px-2 py-1 ${day.time === props.selectedDay.time ? "isSelectedBoder" : ""}`} 
                                        onClick={() => {
                                            props.setSelectedDay(deepCpDay)
                                        }}>{formatTime(day.time)}</button>
                                    {deepCpDay.forecast_weather.pop > 0.5  || getSumOfDownfall(deepCpDay.forecast_weather) > 0 ?
                                     <img key={i+"a"} className="imgAsOverly" src="../../../static/media/raindrop.png"></img>
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
    <div className='flex flex-wrap w-full inputElement mx-1 mb-2 mt-3'>
    {props.daysInRange.map((value, i) => (
        <button 
            key={i}
            className={`basis-1/9 ml-auto my-1 mr-auto pl-4 pr-4 ${value === props.selectedDay.date.toString() ? "isSelectedBoder" : ""}`}
            value={i}
            onClick={(e) => props.changeSelectedDay(e.target.value)}>
            {i-4 == 0 ? props.currentWeatherDate == dateToString(new Date()) ? "Today" : "Center Date" : getWeekdayFromDate(value)}</button>
    ))}
    </div>)
}
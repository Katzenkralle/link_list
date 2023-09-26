import React from "react";
import { calculateForecastDate } from "./FindDatapoints";

export const DisplaySelectedDay = (props) => {
    if (props.selectedDay === undefined) {
        return <div>Loading...</div>;
    }
    //console.log(props.selectedDay);
    const weather_info = props.selectedDay.hasOwnProperty("forecast_weather")
        ? props.selectedDay.forecast_weather
        : props.selectedDay.current_weather;
    let stringifyedDate = props.selectedDay.date.toString();
    let stringifyedTime = props.selectedDay.time.toString();
    return (
        <div>
            <h2>
                Weather for{" "}
                {`${stringifyedDate.substring(6, 8)}.${stringifyedDate.substring(4,6)}.${stringifyedDate.substring(0, 4)}`}{" "}
                at {`${stringifyedTime.substring(0, 2)}:${stringifyedTime.substring(2,4)}`}
            </h2>
            <div>
                <h3>Temperature:</h3>
                <p>Feels like: {weather_info.main.feels_like}°C</p>
                <p>Absolut: {weather_info.main.temp}°C</p>
                {weather_info.main.temp_min !== weather_info.main.temp_max ? (
                    <div>
                        <p>Min: {weather_info.main.temp_min}°C</p>
                        <p>Max: {weather_info.main.temp_max}°C</p>
                    </div>
                ) : (
                    <div></div>
                )}
            </div>
            <div>
                <h3>Climates:</h3>
                <p>Humidity: {weather_info.main.humidity}%</p>
                <p>Pressure: {weather_info.main.pressure}pHa</p>
            </div>
            <div>
                <h3>Weather:</h3>
                <p>Wind Speed: {weather_info.wind.speed}m/s</p>
                <p>Wind Direction: {weather_info.wind.deg}°</p>
                {weather_info.weather.map((weather, index) => (
                    <p key={index}>{weather.description}</p>
                ))}
            </div>
        </div>
    );
};

const ZipFindExtremeValues = (dataset, datasetb, entry, date) => {
    const getValueByPath = (obj, path) => {
        const pathArray = path.split(".");
        let value = obj;
        for (let i = 0; i < pathArray.length; i++) {
            value = value[pathArray[i]];
        };
        return value;
    }
    let average = [0, 0];
    let highest = Number.NEGATIVE_INFINITY; // Initialize with the lowest possible value
    let lowest = Number.POSITIVE_INFINITY; // Initialize with the highest possible value
    for (let i = 0; i < dataset.length; i++) {
        if (dataset[i].date.toString() == date) {
            let value = getValueByPath(datasetb[i], entry);
            if (value > highest) {
                highest = value;
            }
            if (value < lowest) {
                lowest = value;
            }
            average[0] += value;
            average[1] += 1;
            
            return [highest, lowest, average[0]/average[1]];
        }
    }

}

export const DisplayForecast = (props) => {
    if (!Array.isArray(props.forecastWeather) || props.forecastWeather.length === 0) {
        return <div>Loading...</div>;
    }
    const unpackedForecast = props.forecastWeather.map((day) => {
        return JSON.parse(day.forecast_weather);
    });
    console.log(unpackedForecast)
    
    const unpackedCurrent = JSON.parse(props.currentWeather.current_weather);
    console.log(unpackedCurrent)
    
    return(
        <div>
            <div>
                <h3>Today</h3>
                <p>{unpackedCurrent.main.temp}°C</p>
                <p>Chance of Rain {ZipFindExtremeValues(props.forecastWeather, unpackedForecast, "pop",
                    props.currentWeather.date)[2]}%</p>
                <p>Wind Speed {unpackedCurrent.wind.speed}m/s</p>
            </div>
            {[1, 2, 3, 4].map((i) => {
                let date = calculateForecastDate(props.currentWeather.date, i);
                return (
                    <div key={i}>
                        <h3>{`${date.substring(6, 8)}.${date.substring(4,6)}.${date.substring(0, 4)}`}</h3>
                        <p>Max {ZipFindExtremeValues(props.forecastWeather, unpackedForecast, "main.temp",
                         date)[0]}°C</p>
                        <p>Min {ZipFindExtremeValues(props.forecastWeather, unpackedForecast, "main.temp",
                         date)[1]}°C</p>
                        <p>Average {ZipFindExtremeValues(props.forecastWeather, unpackedForecast, "pop",
                            date)[2]*100} % Rain probability</p>
                    </div>
                );
            })}
        </div>
    );
};
import React, { useEffect, useState } from 'react';
import { Line, BaseChartComponent } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

import { ZipFindExtremeValues, getSumOfDownfall, calculateBackcastDate, calculateForecastDate, findNearestDataPoints, strToDate, dateToString } from './FindDatapoints';
import { formatTime } from './UiComponents';

export default function LineChart(forecastWeather, backcastWeather, currentWeather, selectedCenterDate, daysInRange) {
  
  const equalityOfArrays = (arr1, arr2) => {
    return arr1.length === arr2.length && arr1.every((value, index) => value === arr2[index]);
  }

  
  const findGraphData = (centerDate) => {
    let workingData = [];
    let scope = [];
    if (centerDate == "overview") {
      let currentWeatherTime = currentWeather.time;
      let currentWeatherDate = currentWeather.date;

      if (currentWeatherDate) {
        // Check if currentWeatherDate is defined
        for (let i = 1; i < 5; i++) {
          let IDate = calculateForecastDate(currentWeatherDate, i);
          workingData.push(findNearestDataPoints(IDate, currentWeatherTime, forecastWeather));

          IDate = calculateBackcastDate(currentWeatherDate, i);
          workingData.unshift(findNearestDataPoints(IDate, currentWeatherTime, backcastWeather));
        }
        //workingData.splice(4, 0, currentWeather);            //console.log(workingData)        
        workingData.splice(4, 0, findNearestDataPoints(currentWeatherDate, currentWeatherTime, forecastWeather.concat(backcastWeather)));
        scope = ["-4", "-3", "-2", "-1", currentWeather.date == dateToString(new Date()) ? "Today" : "Center Date", "+1", "+2", "+3", "+4"]
      }
    } else {

      workingData = forecastWeather.concat(backcastWeather).filter((data) => data.date == centerDate).sort((a, b) => a.time - b.time);
      scope = forecastWeather.concat(backcastWeather).filter((data) => data.date == centerDate).sort((a, b) => a.time - b.time).map((data) => formatTime(data.time));

    }

    return (provideGraphData({ "y": workingData, "x": scope }))

  }


  const provideGraphData = (basicGraphData) => {
    if (basicGraphData.y.length == 0) {
      return <div></div>;
    }

    let absolut_temperatur = [];
    let min_temperatur = [];
    let max_temperatur = [];
    let feels_like = [];
    let rain_prop = [];
    let rain = [];
    let wind_speed = [];

    if (selectedCenterDate != "overview") {
    basicGraphData.y.forEach(day => {
      let weatherData; // Declare weatherData here

      if (day.hasOwnProperty('forecast_weather')) {

        weatherData = JSON.parse(day.forecast_weather);

      } else {

        weatherData = JSON.parse(day.current_weather);

      }
      absolut_temperatur.push(weatherData.main.temp ?
        weatherData.main.temp :
        (weatherData.main.temp_min + weatherData.main.temp_max) / 2);
      min_temperatur.push(weatherData.main.temp_min);
      max_temperatur.push(weatherData.main.temp_max);
      feels_like.push(weatherData.main.feels_like ?
        weatherData.main.feels_like :
        (weatherData.main.temp_min + weatherData.main.temp_max) / 2);
      rain_prop.push(weatherData.pop != null ? weatherData.pop * 100 : null)
      wind_speed.push(weatherData.wind.speed);


      rain.push(getSumOfDownfall(weatherData));
    })
    } else {
      //Gets the amount of rain for each day in the range, adds it to the rain array
      forecastWeather.concat(backcastWeather).forEach((day) => {
        if (!rain.hasOwnProperty(day.date)) {
          rain[day.date] = 0
        }
        rain[day.date] += day.hasOwnProperty("forecast_weather") ? getSumOfDownfall(JSON.parse(day.forecast_weather)) :
          getSumOfDownfall(JSON.parse(day.current_weather));
      })
      rain = Object.values(rain);


      //Unpack forecast and backcast weather for Json access
      const unpackedForecast = forecastWeather.map((day) => {
        return JSON.parse(day.hasOwnProperty("forecast_weather") ? day.forecast_weather : day.current_weather);
      }).concat(backcastWeather.map((day) => {
        return JSON.parse(day.hasOwnProperty("forecast_weather") ? day.forecast_weather : day.current_weather);
      }));

      //Finds actual weather data for the center date; [0] = max, [1] = min, [2] = avrg 
      daysInRange.forEach((index) => {
        wind_speed.push(ZipFindExtremeValues(forecastWeather.concat(backcastWeather), unpackedForecast, "wind.speed", index)[2]);
        rain_prop.push(ZipFindExtremeValues(forecastWeather.concat(backcastWeather), unpackedForecast, "pop", index)[2] * 100);
        absolut_temperatur.push(ZipFindExtremeValues(forecastWeather.concat(backcastWeather), unpackedForecast, "main.temp", index)[2]);
        feels_like.push(ZipFindExtremeValues(forecastWeather.concat(backcastWeather), unpackedForecast, "main.feels_like", index)[2]);
        min_temperatur.push(ZipFindExtremeValues(forecastWeather.concat(backcastWeather), unpackedForecast, "main.temp_min", index)[1]);
        max_temperatur.push(ZipFindExtremeValues(forecastWeather.concat(backcastWeather), unpackedForecast, "main.temp_max", index)[0]);
      });
    }



    let datasets = [
      {
        label: "Absolute temperature in °C",
        data: absolut_temperatur,
        borderColor: "#ea999c",
        backgroundColor: "#ea999c",
        tension: 0.3,
      },
      {
        label: "Feels like in °C",
        data: feels_like,
        borderColor: "#a6d189",
        backgroundColor: "#a6d189",
        tension: 0.3,
      },
      {
        label: "Wind speed in m/s",
        data: wind_speed,
        borderColor: "#EF9F76",
        backgroundColor: "#EF9F76",
        tension: 0.3,
        hidden: true,
      },
    ];
    //If not in overview and rain data is available --> basicGraphData.x[4] !== "Today" && 
    if (!rain_prop.every(element => element == null) && !rain_prop.every(element => isNaN(element))) {
      datasets.push({
        label: "Rain Probability in %",
        data: rain_prop,
        borderColor: "#CA9EE6",
        backgroundColor: "#CA9EE6",
        tension: 0.3,
        hidden: basicGraphData.x[4] == "Today" || basicGraphData.x[4] == "Center Date" ? true : false,
      })
    }
    if (!rain.every(element => element == null)) {
      datasets.push({
        label: "Rain in mm",
        data: rain,
        borderColor: "#BABBF1",
        backgroundColor: "#BABBF1",
        tension: 0.3,
        hidden: true,
      })
    }
    console.log("Temp:", min_temperatur)
    if (min_temperatur.filter((value) => value != null || value != undefined).length > 1 && 
      !equalityOfArrays(min_temperatur, absolut_temperatur) &&
      !min_temperatur.every(element => Math.abs(element) == Number.POSITIVE_INFINITY)) {
      datasets.push({
        label: "Min-temperature in °C",
        data: min_temperatur,
        borderColor: "#8AADF4",
        backgroundColor: "#8AADF4",
        tension: 0.3,
        hidden: true,
      })
    }
    if (max_temperatur.filter((value) => value != null || value != undefined).length > 1 && 
      !equalityOfArrays(max_temperatur, absolut_temperatur)&&
      !min_temperatur.every(element => Math.abs(element) == Number.POSITIVE_INFINITY)) {
        datasets.push({
          label: "Max-temperature in °C",
          data: max_temperatur,
          borderColor: "#ED8796",
          backgroundColor: "#ED8796",
          tension: 0.3,
          hidden: true,
        }
      )
    }
    return { "dataset": datasets, "xAchses": basicGraphData.x };
  }

  const graphData = findGraphData(selectedCenterDate);
  const data = {
    labels: graphData.xAchses,
    datasets: graphData.dataset,
    labels: graphData.xAchses,
    datasets: graphData.dataset,
  };

  const config = {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      plugins: {
        title: {
          display: false,
          text: 'Suggested Min and Max Settings'
        },
        tooltip: {
          enabled: false,

        },
      },


      scales: {
        y: {
          // the data minimum used for determining the ticks is Math.min(dataMin, suggestedMin)
          suggestedMin: 40,

          // the data maximum used for determining the ticks is Math.max(dataMax, suggestedMax)
          suggestedMax: -10,
        }
      }
    },
  };


  ChartJS.register(ArcElement, Tooltip, Legend,);
  //ChartJS.defaults.plugins.tooltip.enabled = false;
  ChartJS.defaults.plugins.legend.display = true;
  ChartJS.defaults.color = "#c6d0f5"
  ChartJS.defaults.font.family = "sans-serif"
  ChartJS.defaults.font.size = 12
  ChartJS.defaults.maintainAspectRatio = false

  ChartJS.defaults.plugins.tooltip.mode = "x"
  ChartJS.defaults.plugins.tooltip.backgroundColor = "#626880"
  ChartJS.defaults.plugins.tooltip.font = { "family": "sans-serif" }
  ChartJS.defaults.plugins.tooltip.usePointStyle = true


  return (
    <Line data={data} options={config} className={`max-h-[450px]`} />
  );
};
/*
  ChartJS.register(ArcElement, Tooltip, Legend,);
  ChartJS.defaults.plugins.tooltip.enabled = false;
  ChartJS.defaults.plugins.legend.display = true;
*/
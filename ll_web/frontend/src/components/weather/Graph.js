import React, { useEffect, useState } from 'react';
import { Line, BaseChartComponent } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend} from "chart.js";

import { calculateBackcastDate, calculateForecastDate, findNearestDataPoints, strToDate, dateToString } from './FindDatapoints';
import { formatTime } from './UiComponents';

export default function LineChart(forecastWeather, backcastWeather, currentWeather, selectedCenterDate, setDaysInRange) {

  const findGraphData = (centerDate) => {
    let workingData = [];
    let scope = [];
    console.log(centerDate, centerDate == "overview")
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
            workingData.splice(4, 0, currentWeather);            //console.log(workingData)
            scope = ["-4", "-3", "-2", "-1", currentWeather.date == dateToString(new Date()) ? "Today" : "Center Date", "+1", "+2", "+3", "+4"]
    }} else {

            workingData = forecastWeather.concat(backcastWeather).filter((data) => data.date == centerDate).sort((a, b) => a.time - b.time);
            scope = forecastWeather.concat(backcastWeather).filter((data) => data.date == centerDate).sort((a, b) => a.time - b.time).map((data) => formatTime(data.time));
       
    }
    
    return (provideGraphData({"y": workingData, "x": scope}))
    
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
  return {"dataset": datasets, "xAchses": basicGraphData.x};
}

  const graphData = findGraphData(selectedCenterDate);
  const data = {
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
  ChartJS.defaults.plugins.tooltip.enabled = false;
  ChartJS.defaults.plugins.legend.display = true;
  
  return (
    <Line data={data} options={config} />
  );
};
/*

  ChartJS.register(ArcElement, Tooltip, Legend,);
  ChartJS.defaults.plugins.tooltip.enabled = false;
  ChartJS.defaults.plugins.legend.display = true;
*/
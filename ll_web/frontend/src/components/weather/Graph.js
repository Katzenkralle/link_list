import React, { useEffect, useState } from 'react';
import { Line, BaseChartComponent } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend} from "chart.js";



export const minMaxLineChart = (dataset) => {

  const data = {
    labels: ["-4", "-3", "-2", "-1", "Today", "+1", "+2", "+3", "+4"],
    datasets: dataset
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
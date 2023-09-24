import React, { useEffect, useState, Component} from 'react';
import { Chart, Utils } from 'chart.js/auto';

import { Line } from 'react-chartjs-2';

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
                    display: true,
                    text: 'Suggested Min and Max Settings'
                }
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

    return (
        <div>
            <h2>minMaxLineChart</h2>
            <Line data={data} options={config} />
        </div>
    );
};
/*label: 'Temperature',
            data: dataset,
            borderColor: Utils.CHART_COLORS.red,
            backgroundColor: Utils.CHART_COLORS.red,*/
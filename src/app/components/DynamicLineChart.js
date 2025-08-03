'use client';

// src/components/DynamicLineChart.js

import React, { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
// --- 1. IMPORT THE ANNOTATION PLUGIN ---
import annotationPlugin from 'chartjs-plugin-annotation';

// --- 2. REGISTER THE PLUGIN WITH CHART.JS ---
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    annotationPlugin // Add it to the registration list
);

// --- Helper Functions ---

/**
 * Creates the initial empty structure for the chart data.
 * I've changed the color to avoid conflicting with the red annotation line.
 */
const getInitialChartData = () => ({
    labels: [],
    datasets: [
        {
            label: 'Heads Ratio',
            data: [],
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
    ],
});

/**
 * Simulates a single coin flip. (No changes here)
 */
const simulateCoinFlip = (currentState) => {
    const { totalFlips, totalHeads } = currentState;
    const isHeads = Math.random() < 0.5;
    const newTotalFlips = totalFlips + 1;
    const newTotalHeads = totalHeads + (isHeads ? 1 : 0);
    const newRatio = newTotalHeads / newTotalFlips;
    return { newTotalFlips, newTotalHeads, newRatio };
};

// --- The React Component ---

const DynamicLineChart = () => {
    const [simulationState, setSimulationState] = useState({
        totalFlips: 0,
        totalHeads: 0,
    });
    const [chartData, setChartData] = useState(getInitialChartData());

    useEffect(() => {
        const UPDATE_INTERVAL_MS = 200;
        const interval = setInterval(() => {
            setSimulationState(currentSimState => {
                const { newTotalFlips, newTotalHeads, newRatio } = simulateCoinFlip(currentSimState);
                setChartData(currentChartData => {
                    const newLabels = [...currentChartData.labels, newTotalFlips.toString()];
                    const newDataPoints = [...currentChartData.datasets[0].data, newRatio];
                    return {
                        ...currentChartData,
                        labels: newLabels,
                        datasets: [
                            { ...currentChartData.datasets[0], data: newDataPoints },
                        ],
                    };
                });
                return { totalFlips: newTotalFlips, totalHeads: newTotalHeads };
            });
        }, UPDATE_INTERVAL_MS);

        return () => clearInterval(interval);
    }, []);

    // Chart options object
    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Live Coin Flip Simulation (Ratio of Heads)' },

            // --- 3. CONFIGURE THE ANNOTATION PLUGIN ---
            annotation: {
                annotations: {
                    // You can give each annotation a unique key
                    line1: {
                        type: 'line',
                        yMin: 0.5,
                        yMax: 0.5,
                        borderColor: 'rgb(255, 99, 132)',
                        borderWidth: 2,
                        borderDash: [10, 5], // Creates a dashed line effect
                        label: {
                            content: 'Theoretical Average (0.5)',
                            position: 'end',
                            enabled: true,
                            backgroundColor: 'rgba(255, 99, 132, 0.8)',
                            font: {
                                weight: 'bold',
                            },
                        },
                    },
                },
            },
        },
        scales: {
            x: {
                title: { display: true, text: 'Total Flips' },
                ticks: { maxTicksLimit: 10 },
            },
            y: {
                title: { display: true, text: 'Ratio' },
                min: 0,
                max: 1,
            },
        },
        animation: false,
        elements: {
            point: { radius: 1 },
        },
    };

    return (
        <div style={{ width: '90%', margin: 'auto' }}>
            <h3>
                Flips: {simulationState.totalFlips} | Heads: {simulationState.totalHeads}
            </h3>
            <Line options={options} data={chartData} />
        </div>
    );
};

export default DynamicLineChart;
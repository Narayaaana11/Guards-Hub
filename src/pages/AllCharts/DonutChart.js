import React from 'react';
import ReactApexChart from 'react-apexcharts';

const DonutChart = () => {
    const series = [12, 30, 20];
    const options = {
        labels: ['Download Sales', 'In-Store Sales', 'Mail-Order Sales'],
        colors: ['#f0f1f4', '#7a6fbe', '#28bbe3'],
        legend: {
            show: true,
            position: 'bottom',
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '70%',
                },
            },
        },
        responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    width: 200,
                },
                legend: {
                    position: 'bottom',
                },
            },
        }],
    };

    return (
        <ReactApexChart
            options={options}
            series={series}
            type="donut"
            height={300}
        />
    );
};

export default DonutChart;
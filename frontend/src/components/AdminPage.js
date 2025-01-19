import React, { useState, useEffect } from 'react';
import solace from 'solclientjs';

import BarChart from './BarChartAdmin';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './AdminPage.css';



const AdminPage = (props) => {

    // const dataset = {
    //     "label":"Washroom Traffic",
    //     "data": [12, 19, 3, 5, 2, 3]
    // }
    // const labels = ["Toilet 1", "Toilet 2", "Toilet 3", "Toilet 4", "Toilet 5"]

    const [chartData, setChartData] = useState({});
    const washrooms = [
        { id: 1, time: "2025-01-18T01:23:45Z" },
        { id: 2, time: "2025-01-18T01:45:30Z" },
        { id: 3, time: "2025-01-18T02:15:20Z" },
        { id: 4, time: "2025-01-18T03:05:10Z" },
        { id: 5, time: "2025-01-18T01:55:00Z" },
        { id: 6, time: "2025-01-18T01:55:00Z" },
        { id: 5, time: "2025-01-18T01:55:00Z" },
        { id: 1, time: "2025-01-18T01:55:00Z" },
        { id: 2, time: "2025-01-18T01:55:00Z" },
        { id: 6, time: "2025-01-18T01:55:00Z" },
        { id: 2, time: "2025-01-18T01:55:00Z" },
        { id: 2, time: "2025-01-18T01:55:00Z" },
    ];
    useEffect(() => {
        const hourlyCounts = filterAndCountByHour(washrooms);

        setChartData({
            labels: Array.from({ length: 24 }, (_, i) => `${i}:00 - ${i + 1}:00`),
            datasets: [
                {
                    label: "Objects Count Per Hour",
                    data: hourlyCounts,
                    backgroundColor: "rgba(75, 192, 192, 0.6)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1,
                },
            ],
        });
    }, [washrooms]);
    // Function to process dataset
    const filterAndCountByHour = (data) => {
        const hourlyCounts = Array(24).fill(0);
        data.forEach((item) => {
            const hour = new Date(item.time).getHours();
            hourlyCounts[hour]++;
        });
        return hourlyCounts;
    };
    return (
        <div className="container">
            This is admin page
            <BarChart dataset={dataset} labels={chartData.labels}/>
        </div>
    );
};

export default AdminPage;
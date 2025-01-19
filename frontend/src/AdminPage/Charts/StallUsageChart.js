import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

const StallUsageChart = ({ data }) => {
  // Data shape example: 
  // [{ stallId: 'Stall 1', usageCount: 15 }, { stallId: 'Stall 2', usageCount: 10 }]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="stallId" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="usageCount" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default StallUsageChart;
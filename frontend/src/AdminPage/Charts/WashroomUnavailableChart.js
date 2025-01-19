import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

const WashroomUnavailableChart = ({ data }) => {
  // Data shape example:
  // [{ time: '10:00 AM', unavailableCount: 2 }, { time: '11:00 AM', unavailableCount: 1 }]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Line type="monotone" dataKey="unavailableCount" stroke="#82ca9d" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default WashroomUnavailableChart;
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const StallUnavailableChart = ({ data, stallId }) => {
  // data is expected: [ { time: "09:00", unavailableCount: 2 }, ... ]
  // We'll show a bar chart of unavailableCount vs. time

  return (
    <div>
      <h5>Stall #{stallId} Unavailability</h5>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="unavailableCount" fill="#ff0000" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StallUnavailableChart;
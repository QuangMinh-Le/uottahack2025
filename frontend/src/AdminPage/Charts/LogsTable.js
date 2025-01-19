import React from "react";

const LogsTable = ({ logs }) => {
  return (
    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
      <table className="table table-striped">
        <thead>
          <tr>
            <th scope="col">Timestamp</th>
            <th scope="col">Washroom ID</th>
            <th scope="col">Total Stalls</th>
            <th scope="col">Available Stalls</th>
            <th scope="col">Gender</th>
            <th scope="col">Event</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((logItem, index) => {
            let parsedData = {};
            try {
              parsedData = JSON.parse(logItem.payload);
            } catch (err) {
              console.error("Failed to parse payload:", err);
            }

            return (
              <tr key={index}>
                <td>{logItem.timestamp}</td>
                <td>{parsedData.washroom_id || ""}</td>
                <td>{parsedData.totalStalls || ""}</td>
                <td>{parsedData.totalAvailableStalls || "None"}</td>
                <td>{parsedData.gender || ""}</td>
                <td>{logItem.message}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LogsTable;
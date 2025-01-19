import React from "react";

const LogsTable = ({ logs }) => {
  return (
    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
      <table className="table table-striped">
        <thead>
          <tr>
            <th scope="col">Timestamp</th>
            <th scope="col">Event</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((logItem, index) => (
            <tr key={index}>
              <td>{logItem.timestamp}</td>
              <td>{logItem.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LogsTable;
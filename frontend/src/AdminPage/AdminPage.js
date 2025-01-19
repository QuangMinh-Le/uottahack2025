import React, { useEffect, useState } from "react";
import solace from "solclientjs";

// Import your existing charts
import StallUsageChart from "./Charts/StallUsageChart";
import WashroomUnavailableChart from "./Charts/WashroomUnavailableChart";
import StallUnavailableChart from "./Charts/StallUnavailableChart"; 
import LogsTable from "./Charts/LogsTable";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const AdminDashboard = () => {
  // ---- State variables ----
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedWashroom, setSelectedWashroom] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");

  // Summary metrics
  const [totalUsageCount, setTotalUsageCount] = useState(0);
  const [washroomFullCount, setWashroomFullCount] = useState(0);

  // Chart data
  const [stallUsageData, setStallUsageData] = useState([]);
  const [washroomUnavailableData, setWashroomUnavailableData] = useState([]);

  // NEW: single state object for 6 stalls unavailability
  // Each key is the stall ID, and the value is an array of { time, unavailableCount }
  const [stallUnavailabilityData, setStallUnavailabilityData] = useState({
    "1": [],
    "2": [],
    "3": [],
    "4": [],
    "5": [],
    "6": [],
  });

  // Real-time logs
  const [logs, setLogs] = useState([]);

  let solaceSession = null;

  useEffect(() => {
    const solaceHost = "ws://mr-connection-ghw5zbvtb29.messaging.solace.cloud:80";
    const solaceUsername = "solace-cloud-client";
    const solacePassword = "b8888b098i13ip23decqu9cj87";

    solace.SolclientFactory.init({
      profile: solace.SolclientFactoryProfiles.version10,
    });

    solaceSession = solace.SolclientFactory.createSession({
      url: solaceHost,
      vpnName: "toiletflush",
      userName: solaceUsername,
      password: solacePassword,
    });

    try {
      solaceSession.connect();
    } catch (error) {
      console.error("Solace connection error:", error);
    }

    solaceSession.on(solace.SessionEventCode.UP_NOTICE, () => {
      console.log("Connected to Solace for Admin Dashboard!");

      const topic = "washrooms/status";
      solaceSession.subscribe(
        solace.SolclientFactory.createTopicDestination(topic),
        true,
        1000
      );
      console.log(`Subscribed to topic: ${topic}`);
    });

    solaceSession.on(solace.SessionEventCode.MESSAGE, (message) => {
      const rawPayload = message.getBinaryAttachment();
      const cleanPayload = rawPayload
        .replace(/^.*?{/, "{")
        .replace(/}[^}]*$/, "}")
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
        .trim();

      try {
        const parsed = JSON.parse(cleanPayload);
        console.log("Admin Dashboard - Real-time message:", parsed);

        // 1) Logs
        setLogs((prevLogs) => [
          {
            timestamp: new Date().toLocaleString(),
            message: `Washroom ${parsed.washroom_id} updated: ${cleanPayload}`,
          },
          ...prevLogs,
        ]);

        // 2) Global usage increment
        setTotalUsageCount((prevCount) => prevCount + 1);

        // 3) Stall usage update
        setStallUsageData((prev) =>
          prev.map((item) => {
            if (item.stallId === parsed.washroom_id) {
              return { ...item, usageCount: item.usageCount + 1 };
            }
            return item;
          })
        );

        // 4) If fully occupied => increment unavailability
        if (parsed.totalAvailableStalls === 0) {
          const now = new Date();
          const hour = String(now.getHours()).padStart(2, "0");
          const hourLabel = `${hour}:00`;

          // 4A) Update global washroom unavailability
          setWashroomUnavailableData((prevData) => {
            const existingIndex = prevData.findIndex((d) => d.time === hourLabel);
            if (existingIndex !== -1) {
              const updated = [...prevData];
              updated[existingIndex] = {
                ...updated[existingIndex],
                unavailableCount: updated[existingIndex].unavailableCount + 1,
              };
              return updated;
            } else {
              return [...prevData, { time: hourLabel, unavailableCount: 1 }];
            }
          });

          // 4B) Also increment total "Times Fully Occupied"
          setWashroomFullCount((prev) => prev + 1);

          // 4C) Update the *specific stall* unavailability
          const stallId = parsed.washroom_id;  // e.g. "3", "4", ...
          setStallUnavailabilityData((prevStalls) => {
            // clone our object
            const newStalls = { ...prevStalls };
            // array for the stall in question
            const currentArr = newStalls[stallId] || [];
            
            const existingIndex = currentArr.findIndex((d) => d.time === hourLabel);
            if (existingIndex !== -1) {
              // increment
              const updatedArr = [...currentArr];
              updatedArr[existingIndex] = {
                ...updatedArr[existingIndex],
                unavailableCount: updatedArr[existingIndex].unavailableCount + 1,
              };
              newStalls[stallId] = updatedArr;
            } else {
              // create
              newStalls[stallId] = [...currentArr, { time: hourLabel, unavailableCount: 1 }];
            }
            return newStalls;
          });
        }
      } catch (err) {
        console.error("Failed to parse message payload:", err);
      }
    });

    solaceSession.on(solace.SessionEventCode.DISCONNECTED, () => {
      console.log("Admin Dashboard - Disconnected from Solace.");
    });

    solaceSession.on(solace.SessionEventCode.CONNECT_FAILED_ERROR, (err) => {
      console.error("Admin Dashboard - Connection failed:", err);
    });

    return () => {
      if (solaceSession) {
        solaceSession.disconnect();
      }
    };
  }, []);

  // --- HARDCODE INITIAL DATA (for testing) ---
  useEffect(() => {
    // 1) Hardcode some usage data
    const mockStallUsageData = [
      { stallId: "1", usageCount: 1 },
      { stallId: "2", usageCount: 8 },
      { stallId: "3", usageCount: 15 },
      { stallId: "4", usageCount: 5 },
      { stallId: "5", usageCount: 34 },
      { stallId: "6", usageCount: 8 },
    ];

    // 2) Hardcode times washroom was unavailable (fully occupied)
    const mockWashroomUnavailableData = [
      { time: "09:00", unavailableCount: 1 },
      { time: "10:00", unavailableCount: 2 },
      { time: "11:00", unavailableCount: 1 },
      { time: "12:00", unavailableCount: 4 },
      { time: "13:00", unavailableCount: 2 },
    ];

    // 3) Hardcode each stall’s unavailability
    // e.g., stall #1, #2, ... #6
    const mockStallUnavail = {
      "1": [{ time: "09:00", unavailableCount: 1 }],
      "2": [{ time: "10:00", unavailableCount: 3 }],
      "3": [{ time: "09:00", unavailableCount: 2 }, { time: "10:00", unavailableCount: 1 }],
      "4": [{ time: "11:00", unavailableCount: 1 }],
      "5": [{ time: "10:00", unavailableCount: 2 }],
      "6": [{ time: "12:00", unavailableCount: 1 }],
    };

    setStallUsageData(mockStallUsageData);
    setWashroomUnavailableData(mockWashroomUnavailableData);
    setStallUnavailabilityData(mockStallUnavail);

    setTotalUsageCount(42);
    setWashroomFullCount(5);
  }, [startDate, endDate, selectedWashroom, genderFilter]);

  return (
    <div className="container-fluid my-4">
      <h2 className="mb-4">Admin Dashboard</h2>

      {/* Filter Section */}
      <div className="row mb-3">
        <div className="col-md-3 mb-2">
          <label>Date Start</label>
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="col-md-3 mb-2">
          <label>Date End</label>
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="col-md-3 mb-2">
          <label>Washroom</label>
          <select
            className="form-select"
            value={selectedWashroom}
            onChange={(e) => setSelectedWashroom(e.target.value)}
          >
            <option value="all">All</option>
            <option value="1">Washroom 1</option>
            <option value="2">Washroom 2</option>
            {/* etc. */}
          </select>
        </div>
        <div className="col-md-3 mb-2">
          <label>Gender</label>
          <select
            className="form-select"
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card p-3 mb-3 shadow-sm">
            <h5>Total Usage Count</h5>
            <p className="fs-4">{totalUsageCount}</p>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card p-3 mb-3 shadow-sm">
            <h5>Times Fully Occupied</h5>
            <p className="fs-4">{washroomFullCount}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card p-3 mb-3 shadow-sm">
            <h5>Stall Usage Today</h5>
            <StallUsageChart data={stallUsageData} />
          </div>
        </div>

        <div className="col-md-6">
          <div className="card p-3 mb-3 shadow-sm">
            <h5>Washroom Unavailability</h5>
            <WashroomUnavailableChart data={washroomUnavailableData} />
          </div>
        </div>
      </div>

      {/* 6 STALL UNAVAILABILITY CHARTS */}
      <div className="row mb-4">
        {/* Stall #1 */}
        <div className="col-md-4">
          <div className="card p-3 mb-3 shadow-sm">
            <StallUnavailableChart 
              data={stallUnavailabilityData["1"]} 
              stallId="1" 
            />
          </div>
        </div>
        {/* Stall #2 */}
        <div className="col-md-4">
          <div className="card p-3 mb-3 shadow-sm">
            <StallUnavailableChart 
              data={stallUnavailabilityData["2"]} 
              stallId="2" 
            />
          </div>
        </div>
        {/* Stall #3 */}
        <div className="col-md-4">
          <div className="card p-3 mb-3 shadow-sm">
            <StallUnavailableChart 
              data={stallUnavailabilityData["3"]} 
              stallId="3" 
            />
          </div>
        </div>
        {/* Stall #4 */}
        <div className="col-md-4">
          <div className="card p-3 mb-3 shadow-sm">
            <StallUnavailableChart 
              data={stallUnavailabilityData["4"]} 
              stallId="4" 
            />
          </div>
        </div>
        {/* Stall #5 */}
        <div className="col-md-4">
          <div className="card p-3 mb-3 shadow-sm">
            <StallUnavailableChart 
              data={stallUnavailabilityData["5"]} 
              stallId="5" 
            />
          </div>
        </div>
        {/* Stall #6 */}
        <div className="col-md-4">
          <div className="card p-3 mb-3 shadow-sm">
            <StallUnavailableChart 
              data={stallUnavailabilityData["6"]} 
              stallId="6" 
            />
          </div>
        </div>
      </div>

      {/* Logs Section */}
      <div className="row">
        <div className="col-12">
          <div className="card p-3 shadow-sm">
            <h5>Real-time Logs</h5>
            <LogsTable logs={logs} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
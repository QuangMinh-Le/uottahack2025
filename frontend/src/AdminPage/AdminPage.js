import React, { useEffect, useState, useRef } from "react";
import solace from "solclientjs";

// Import your existing charts
import StallUsageChart from "./Charts/StallUsageChart";
import WashroomUnavailableChart from "./Charts/WashroomUnavailableChart";
import StallUnavailableChart from "./Charts/StallUnavailableChart";
import LogsTable from "./Charts/LogsTable";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const AdminDashboard = () => {
  /**
   * 1) Ref-based simulated time
   * Start hour at 6:00. We won't re-render on each increment.
   */
  const simulatedTimeRef = useRef({ hour: 6, minute: 0 });
  
  // If you want to display the time in the UI, you can track it here:
  const [displayTime, setDisplayTime] = useState("06:00");

  // ---- Summary metrics ----
  const [totalUsageCount, setTotalUsageCount] = useState(0);
  const [washroomFullCount, setWashroomFullCount] = useState(0);

  // ---- Chart data ----
  const [stallUsageData, setStallUsageData] = useState([]);
  const [washroomUnavailableData, setWashroomUnavailableData] = useState([]);

  // Single state object for 6 stalls unavailability
  // Each key is the stall ID, and the value is an array of { time, unavailableCount }
  const [stallUnavailabilityData, setStallUnavailabilityData] = useState({
    "1": [],
    "2": [],
    "3": [],
    "4": [],
    "5": [],
    "6": [],
  });

  // ---- Real-time logs ----
  const [logs, setLogs] = useState([]);
  let solaceSession = null;

  /**
   * 2) Interval updating the ref-based time (e.g., every 100ms).
   * This does NOT cause re-renders, since we're updating a ref, not state.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      let { hour, minute } = simulatedTimeRef.current;
      // Move time forward by 1 minute (or 5 minutes, your choice) each tick
      minute += 1;
      if (minute >= 60) {
        minute = 0;
        hour += 1;
      }
      if (hour >= 22) {
        hour = 6;
        minute = 0;
      }
      // Update the ref
      simulatedTimeRef.current = { hour, minute };

      // Optionally update displayTime every time (or less often to reduce re-renders):
      const hourStr = String(hour).padStart(2, "0");
      const minStr = String(minute).padStart(2, "0");
      setDisplayTime(`${hourStr}:${minStr}`);

    }, 500); // update every 100ms => 0.1 second

    return () => clearInterval(interval);
  }, []);

  /**
   * 3) Solace setup
   */
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
        // console.log("Admin Dashboard - Real-time message:", parsed);

        /**
         * Build a timestamp from simulatedTimeRef
         */
        const { hour, minute } = simulatedTimeRef.current;
        const hourStr = String(hour).padStart(2, "0");
        const minStr = String(minute).padStart(2, "0");

        // Generate a random second from 0 to 59
        const randomSecond = Math.floor(Math.random() * 60);
        const secStr = String(randomSecond).padStart(2, "0");

        // Final "HH:MM:SS"
        const timestampStr = `${hourStr}:${minStr}:${secStr}`;

        // 1) Logs
        setLogs((prevLogs) => [
          {
            timestamp: timestampStr,
            message: `Washroom ${parsed.washroom_id} updated: ${cleanPayload}`,
            payload: cleanPayload,
          },
          ...prevLogs,
        ]);

        // 2) Global usage
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
          // For a simpler "whole hour" label, ignoring minutes:
          const hourLabel = `${hourStr}:00`;

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

          // 4B) Also increment "Times Fully Occupied"
          setWashroomFullCount((prev) => prev + 1);

          // 4C) Update the *specific stall* unavailability
          const stallId = parsed.washroom_id;
          setStallUnavailabilityData((prevStalls) => {
            const newStalls = { ...prevStalls };
            const currentArr = newStalls[stallId] || [];

            const existingIndex = currentArr.findIndex((d) => d.time === hourLabel);
            if (existingIndex !== -1) {
              const updatedArr = [...currentArr];
              updatedArr[existingIndex] = {
                ...updatedArr[existingIndex],
                unavailableCount: updatedArr[existingIndex].unavailableCount + 1,
              };
              newStalls[stallId] = updatedArr;
            } else {
              newStalls[stallId] = [
                ...currentArr,
                { time: hourLabel, unavailableCount: 1 },
              ];
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
  }, []); // no need for simulatedTime in dependency, since we read from ref

  /**
   * 4) Initialize data (mock or empty) once
   */
  useEffect(() => {
    // 1) Mock stall usage data
    const mockStallUsageData = [
      { stallId: "1", usageCount: 4 },
      { stallId: "2", usageCount: 16 },
      { stallId: "3", usageCount: 6 },
      { stallId: "4", usageCount: 1 },
      { stallId: "5", usageCount: 29 },
      { stallId: "6", usageCount: 30 },
    ];
  
    // 2) Mock global washroom unavailability
    const mockWashroomUnavailableData = [];
  
    // 3) Mock per-stall unavailability
    // Each array entry is { time, unavailableCount }
    const mockStallUnavail = {
      "1": [{ time: 6, unavailableCount: 1 }],
      "2": [{ time: 6, unavailableCount: 2 }],
      "3": [{ time: 6, unavailableCount: 1 }],
      "4": [{ time: 6, unavailableCount: 1 }],
      "5": [{ time: 6, unavailableCount: 1 }],
      "6": [{ time: 6, unavailableCount: 3 }],
    };
  
    // ---- Set the chart data states ----
    setStallUsageData(mockStallUsageData);
    setWashroomUnavailableData(mockWashroomUnavailableData);
    setStallUnavailabilityData(mockStallUnavail);
  
    // 4) Calculate the sum of stall usage across all stalls
    const totalUsage = mockStallUsageData.reduce(
      (acc, stall) => acc + stall.usageCount,
      0
    );
  
    // 5) Calculate the sum of unavailability events for all stalls
    //    (Times fully occupied, if that matches your meaning of washroomFullCount)
    let totalFullCount = 0;
    Object.values(mockStallUnavail).forEach((stallArray) => {
      stallArray.forEach((event) => {
        totalFullCount += event.unavailableCount;
      });
    });
  
    // 6) Update summary metrics
    setTotalUsageCount(totalUsage);    // e.g. 4 + 16 + 6 + 1 + 29 + 30 = 86
    setWashroomFullCount(totalFullCount); // e.g. 1+2+1+1+1+3 = 9
  }, []);

  return (
    <div className="container-fluid my-4">
      <h2 className="mb-4">Admin Dashboard</h2>
      <p>Simulated Time: {displayTime}</p>

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
            <h5>Washroom Usage Today</h5>
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
        <div className="col-md-4">
          <div className="card p-3 mb-3 shadow-sm">
            <StallUnavailableChart data={stallUnavailabilityData["1"]} stallId="1" />
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3 mb-3 shadow-sm">
            <StallUnavailableChart data={stallUnavailabilityData["2"]} stallId="2" />
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3 mb-3 shadow-sm">
            <StallUnavailableChart data={stallUnavailabilityData["3"]} stallId="3" />
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3 mb-3 shadow-sm">
            <StallUnavailableChart data={stallUnavailabilityData["4"]} stallId="4" />
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3 mb-3 shadow-sm">
            <StallUnavailableChart data={stallUnavailabilityData["5"]} stallId="5" />
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3 mb-3 shadow-sm">
            <StallUnavailableChart data={stallUnavailabilityData["6"]} stallId="6" />
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
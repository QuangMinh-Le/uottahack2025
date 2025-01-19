// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";

import ClientPage from "./components/ClientPage";
import AdminDashboard from "./AdminPage/AdminPage";

function App() {
  return (
    <Router>
      {/* Basic navigation bar */}
      <nav style={{ padding: "1rem", backgroundColor: "#e9ecef" }}>
        <Link to="/client" style={{ marginRight: "1rem" }}>
          Client
        </Link>
        <Link to="/admin">Admin</Link>
      </nav>

      {/* Define routes */}
      <Routes>
        <Route path="/client" element={<ClientPage />} />
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Redirect any unknown route to /client */}
        <Route path="*" element={<Navigate to="/client" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
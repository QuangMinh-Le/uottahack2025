import React, { useState } from "react";
import ClientPage from "./components/ClientPage";
import AdminDashboard from "./AdminPage/AdminPage";

function App() {
  const [showClientPage, setShowClientPage] = useState(true);

  const footerStyle = {
    position: "fixed",
    bottom: 0,
    left: 0,
    width: "100%",
    padding: "1rem",
    backgroundColor: "#f8f9fa",
    borderTop: "1px solid #ccc",
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
    zIndex: 999,
  };

  const buttonStyle = {
    padding: "0.6rem 1.2rem",
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    borderRadius: "4px",
    cursor: "pointer",
    textDecoration: "none",
    fontWeight: "500",
  };

  const buttonActiveStyle = {
    backgroundColor: "#0056b3",
  };

  const handleShowAdmin = (e) => {
    e.preventDefault();
    setShowClientPage(false);
  };

  const handleShowClient = (e) => {
    e.preventDefault();
    setShowClientPage(true);
  };

  return (
    <div style={{ paddingBottom: "80px" }}>
      {/* Conditionally render either Client or Admin */}
      {showClientPage ? <ClientPage /> : <AdminDashboard />}

      {/* Fixed footer navigation */}
      <nav style={footerStyle}>
        <a
          href="#"
          onClick={handleShowAdmin}
          style={{
            ...buttonStyle,
            ...(showClientPage ? {} : buttonActiveStyle),
          }}
        >
          Admin
        </a>
        <a
          href="#"
          onClick={handleShowClient}
          style={{
            ...buttonStyle,
            ...(showClientPage ? buttonActiveStyle : {}),
          }}
        >
          Client
        </a>
      </nav>
    </div>
  );
}

export default App;
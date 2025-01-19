import React from 'react';
import ClientPage from './components/ClientPage';
import AdminDashboard from './AdminPage/AdminPage';
function App() {
    return(
    <div>
        <AdminDashboard />;
        <ClientPage />;
    </div>

    ) 
}

export default App;
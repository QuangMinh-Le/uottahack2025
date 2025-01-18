import React, { useState, useEffect } from 'react';
import solace from 'solclientjs';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './ClientPage.css';

const ClientPage = (props) => {
    const [genderFilter, setGenderFilter] = useState('all');
    const [stalls, setStalls] = useState({}); // Define the stalls state

    const washrooms = [
        { id: 1, name: 'Washroom 1', gender: 'male', totalAvailStalls: 3 },
        { id: 2, name: 'Washroom 2', gender: 'female', totalAvailStalls: 0 },
        { id: 3, name: 'Washroom 3', gender: 'female', totalAvailStalls: 5 },
    ];

    const filteredWashrooms = washrooms.filter(washroom =>
        genderFilter === 'all' || washroom.gender === genderFilter
    );

        useEffect(() => {
            const solaceHost = 'wss://mr-connection-ghw5zbvtb29.messaging.solace.cloud';
            const solaceUsername = 'solace-cloud-client';
            const solacePassword = 'b8888b098i13ip23decqu9cj87';
            
            solace.SolclientFactory.init({
                profile: solace.SolclientFactoryProfiles.version10,
            });
    
            const solaceSession = solace.SolclientFactory.createSession({
                url: solaceHost,
                vpnName: "toiletflush",
                userName: solaceUsername,
                password: solacePassword,
              });
              try {
                solaceSession.connect();
              } catch (error) {
                console.log(error);
              }
        
            solaceSession.on(solace.SessionEventCode.UP_NOTICE, () => {
                console.log("Connected to Solace!");
                solaceSession.subscribe(solace.SolclientFactory.createTopicDestination("restroom/stall/status"), true, null, 1000);
            });
        
            solaceSession.on(solace.SessionEventCode.MESSAGE, (message) => {
                const payload = message.getBinaryAttachment();
                try {
                    const [stall, status] = payload.split(": ");
                    console.log(`Update received: ${stall} is ${status}`);
                    setStalls((prevStalls) => ({
                        ...prevStalls,
                        [stall]: status === "occupied",
                    }));
                } catch (error) {
                    console.error("Failed to process message:", error);
                }
            });
        
            solaceSession.on(solace.SessionEventCode.DISCONNECTED, () => {
                console.log("Disconnected from Solace.");
            });
        
        
            solaceSession.on(solace.SessionEventCode.CONNECT_FAILED_ERROR, (error) => {
                console.error("Failed to connect to Solace:", error);
            });
        
            return () => {
                if (solaceSession) {
                    solaceSession.disconnect();
                }
            };
        }, []);
    
    return (
        <div className="container-fluid">
            {/* Top Half: Floorplan Image */}
            <div className="row">
                <div className="col-12">
                    <div className="text-center my-3">
                        <img 
                            src="/Floor1.png" 
                            alt="Floorplan" 
                            className="img-fluid border"
                            style={{ maxHeight: '400px' }}
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Half: Washroom List and Filter */}
            <div className="row">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center my-3">
                        <h2>Washrooms</h2>
                        <div>
                            <label className="me-2">Filter by Gender:</label>
                            <select 
                                className="form-select d-inline-block w-auto" 
                                value={genderFilter} 
                                onChange={(e) => setGenderFilter(e.target.value)}
                            >
                                <option value="all">All</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                    </div>

                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>Floor 1</th>
                                <th>Gender</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredWashrooms.map(washroom => (
                                <tr key={washroom.id}>
                                    <td>{washroom.name} 
                                        {washroom.gender === "female" ? <i class="bi bi-person-standing-dress" style={{ color: '#c71585', marginLeft: '0.5rem' }}></i> : <i class="bi bi-person-standing" style={{ color: 'blue', marginLeft: '0.5rem' }}></i>} - {washroom.totalAvailStalls} available</td>
                                    <td>{washroom.gender}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ClientPage;
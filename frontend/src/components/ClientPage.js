import React, { useState, useEffect } from 'react';
import solace from 'solclientjs';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './ClientPage.css';
import Washroom from './Washroom';

let data = "";
let totalTaken = 0;
const ClientPage = (props) => {
    const [genderFilter, setGenderFilter] = useState('all');

    const [washrooms, setWashrooms] = useState([
        new Washroom("1", 5, 5, "male"),
        new Washroom("2", 5, 5, "female"),
        new Washroom("3", 5, 5, "male"),
        new Washroom("4", 5, 5, "female"),
        new Washroom("5", 5, 5, "male"),
        new Washroom("6", 5, 5, "female")
    ]);

    // Filter washrooms by gender
    const filteredWashrooms = washrooms.filter(washroom =>
        genderFilter === "all" || washroom.gender === genderFilter
    );

        useEffect(() => {
            const solaceHost = 'ws://mr-connection-ghw5zbvtb29.messaging.solace.cloud:80';
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
                // washrooms.forEach((washroom) => {
                //     console.log("WashROM ", washroom);
                //     const topic = `washrooms/${washroom.id}/status`;
                //     solaceSession.subscribe(
                //         solace.SolclientFactory.createTopicDestination(topic),
                //         true,
                //         washroom.id,
                //         1000
                //     );
                //     console.log(`Subscribed to topic: ${topic}`);

                // });

             
                    const topic = `washrooms/status`;
                    solaceSession.subscribe(
                        solace.SolclientFactory.createTopicDestination(topic),
                        true,
                        1000
                    );
                    console.log(`Subscribed to topic: ${topic}`);

                


                solaceSession.on(solace.SessionEventCode.SUBSCRIPTION_OK, () => {
                    console.log("Subscription acknowledged by the broker.");
                });
            
                solaceSession.on(solace.SessionEventCode.SUBSCRIPTION_ERROR, (error) => {
                    console.error("Subscription error:", error);
                });                
            });
        
            solaceSession.on(solace.SessionEventCode.MESSAGE, (message) => {
                console.log("Message here: " + message);
                const topic = message.getDestination().getName();
                const rawPayload = message.getBinaryAttachment();
                const cleanPayload = rawPayload
                .replace(/^.*?{/, "{")  // Remove any characters before the first '{'
                .replace(/}[^}]*$/, "}") // Remove any characters after the last '}'
                .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove control characters
                .trim();
                console.log(`Message received on topic ${topic}:`, cleanPayload);

                data = JSON.parse(cleanPayload);
                console.log("Parsed payload:", data);

                if (topic.startsWith("washrooms/")) {
                    const washroomId = topic.split("/")[1]; // Extract washroom ID
                    console.log(`Washroom ${washroomId} update:`, data);
            
                    setWashrooms((prevWashrooms) =>
                        prevWashrooms.map((washroom) => {
                            if (washroom.id.toString() === data.washroom_id) {
                                if(washroom.availableStalls < data.totalAvailableStalls)
                                    totalTaken++;
                                return {
                                    ...washroom,
                                    availableStalls: data.totalAvailableStalls
                                };
                            }
                            return washroom;
                        })
                    );

                }

                // try {
                //     const data = JSON.parse(payload);
                //     console.log("Parsed payload data:", data);
                // } catch (error) {
                //     console.error("Failed to parse payload:", error);
                // }
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
        <div className="container">
            {/* Top Half: Floorplan Image */}
            <div className="row">
                <div className="col-12">
                    <div className="text-center my-3">
                    </div>
                </div>
            </div>

            {/* Curvy Line Separator */}
            <svg
                className="wave-separator"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1440 320"
            >
                <path
                    fill="#f16c75"
                    fillOpacity="1"
                    d="M0,224L48,213.3C96,203,192,181,288,160C384,139,480,117,576,112C672,107,768,117,864,128C960,139,1056,149,1152,149.3C1248,149,1344,139,1392,133.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                ></path>
            </svg>

            {/* Bottom Half: Washroom List and Filter */}
            <div className="gradient-container">
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

                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Floor 1</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredWashrooms.map(washroom => (
                                <tr key={washroom.id}>
                                    <td>Washroom {washroom.id} 
                                        {washroom.gender === "female" ? <i class="bi bi-person-standing-dress" style={{ color: '#c71585', marginLeft: '0.5rem' }}></i> : <i class="bi bi-person-standing" style={{ color: 'blue', marginLeft: '0.5rem' }}></i>} - {washroom.availableStalls}/{washroom.totalStalls} available</td>
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
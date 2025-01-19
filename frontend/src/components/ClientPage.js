import React, { useState, useEffect } from 'react';
import solace from 'solclientjs';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './ClientPage.css';
import video from './assets/Kitten Unrolling Toilet Paper.mp4';
import Washroom from './Washroom';
// test
let data = ""
const ClientPage = (props) => {
    const [genderFilter, setGenderFilter] = useState('all');

    const [washrooms, setWashrooms] = useState([
        new Washroom("1", "name", 5, 5, "male"),
        new Washroom("2", "name", 5, 5, "female")
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

        useEffect(() => {
            const fetchWashroomData = () => {
                console.log("Hello");
            
                fetch('http://localhost:5001/get-washrooms', {
                    method: 'GET', // HTTP method
                    headers: {
                        'Content-Type': 'application/json', // Specifies the format of the data
                    }
                })
                    .then((response) => {
                        console.log("Response: ", response);
                
                        if (response.ok) {
                            return response.json();
                        } else {
                            console.error(`Failed to fetch washroom data. Status: ${response.status} ${response.statusText}`);
                            return Promise.reject(`Error: ${response.status} ${response.statusText}`);
                        }
                    })
                    .then((data) => {
                        const washroomData = Object.values(data.washrooms).map(washroom =>
                            new Washroom(
                                washroom.id,
                                washroom.name,
                                washroom.totalStalls,
                                washroom.totalAvailableStalls,
                                washroom.gender
                            )
                        );
                        setWashrooms(washroomData);
                    })
                    .catch((error) => {
                        console.error("Error fetching washroom data:", error);
                    });
            };
            
            fetchWashroomData();
        }, []);
    
    return (
        <div className="container-fluid">
            {/* Top Half: Floorplan Image */}
            <div className="row">
                <div className="col-12">
                    <div className="text-center my-3">
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
                                <th>Washroom Name</th>
                                <th>Available Stalls</th>
                                <th>Washroom Availability</th>
                                <th>Washroom Status</th>
                            </tr>
                        </thead>
                        <tbody>
 
                             {filteredWashrooms.map(washroom => (
                                <tr key={washroom.id}>
                                    <td>{washroom.name} 
                                    {washroom.gender === "female" ? <i class="bi bi-person-standing-dress" style={{ color: '#c71585', marginLeft: '0.5rem' }}></i> : <i class="bi bi-person-standing" style={{ color: 'blue', marginLeft: '0.5rem' }}></i>}</td>
                                    <td>{washroom.availableStalls}/{washroom.totalStalls}</td>
                                    <td>
                                    {washroom.availableStalls === 0 ? (
                                        // FULL (0 stalls left)
                                        <span className="text-danger">
                                        Full

                                        </span>
                                    ) : washroom.availableStalls === 1 ? (
                                        // ALMOST FULL (1 stall left)
                                        <span style={{ color: "#FFC107" /* bootstrap warning/yellow */ }}>
                                        Almost Full

                                        </span>
                                    ) : (
                                        // AVAILABLE (2 or more stalls left)
                                        <span className="text-success">
                                        Available
 
                                        </span>
                                    )}
                                    </td>
                                    <td>
                                    {washroom.availableStalls === 0 ? (
                                        // FULL (0 stalls left)
                                        <span className="text-danger">
                                        <span
                                            style={{
                                            display: "inline-block",
                                            width: "10px",
                                            height: "10px",
                                            backgroundColor: "red",
                                            borderRadius: "50%",
                                            marginLeft: "5px"
                                            }}
                                        ></span>
                                        </span>
                                    ) : washroom.availableStalls === 1 ? (
                                        // ALMOST FULL (1 stall left)
                                        <span style={{ color: "#FFC107" /* bootstrap warning/yellow */ }}>
                                        <span
                                            style={{
                                            display: "inline-block",
                                            width: "10px",
                                            height: "10px",
                                            backgroundColor: "#FFC107",
                                            borderRadius: "50%",
                                            marginLeft: "5px"
                                            }}
                                        ></span>
                                        </span>
                                    ) : (
                                        // AVAILABLE (2 or more stalls left)
                                        <span className="text-success">
                                        <span
                                            style={{
                                            display: "inline-block",
                                            width: "10px",
                                            height: "10px",
                                            backgroundColor: "green",
                                            borderRadius: "50%",
                                            marginLeft: "5px"
                                            }}
                                        ></span>
                                        </span>
                                    )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                        { /* Center the video */}
                        <div className="d-flex justify-content-center my-4">
                            <video autoPlay muted loop id="myVideo" style={{ maxWidth: "100%", height: "auto" }}>
                                <source src={video} type="video/mp4" />
                                Your browser does not support HTML5 video.
                            </video>
                        </div>
                </div>
            </div>
        </div>
    );
};

export default ClientPage;
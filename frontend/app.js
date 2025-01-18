import React, { useEffect, useState } from 'react';
import solace from 'solace';

const App = () => {
    const [stalls, setStalls] = useState({});

    useEffect(() => {
        // Initialize Solace connection
        const solaceHost = 'mr-connection-ghw5zbvtb29.messaging.solace.cloud';
        const solaceUsername = 'solace-cloud-client';
        const solacePassword = 'b8888b098i13ip23decqu9cj87';

        const solaceSession = solace.SolclientFactory.createSession({
            url: solaceHost,
            vpnName: "default",
            userName: solaceUsername,
            password: solacePassword,
        });

        solaceSession.connect();

        solaceSession.on(solace.SessionEventCode.UP_NOTICE, () => {
            console.log("Connected to Solace!");
            // Subscribe to topic
            solaceSession.subscribe(solace.SolclientFactory.createTopicDestination("restroom/stall/status"));
        });

        solaceSession.on(solace.SessionEventCode.MESSAGE, (message) => {
            const payload = message.getBinaryAttachment();
            const [stall, status] = payload.split(": ");
            console.log(`Update received: ${stall} is ${status}`);
            setStalls((prevStalls) => ({
                ...prevStalls,
                [stall]: status === "occupied",
            }));
        });

        solaceSession.on(solace.SessionEventCode.DISCONNECTED, () => {
            console.log("Disconnected from Solace.");
        });

        return () => solaceSession.disconnect();
    }, []);

    return (
        <div>
            <h1>Toilet Stall Availability</h1>
            <ul>
                {Object.entries(stalls).map(([stall, status]) => (
                    <li key={stall}>
                        {stall}: {status ? "Occupied" : "Available"}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default App;

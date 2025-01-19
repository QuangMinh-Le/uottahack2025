from flask import Flask, request
from solace.messaging.messaging_service import MessagingService, RetryStrategy
from solace.messaging.config.transport_security_strategy import TLS
from solace.messaging.resources.topic import Topic
import json
import time

app = Flask(__name__)

# Build the Solace messaging service connection
broker_props = {
    "solace.messaging.transport.host": "tcp://mr-connection-ghw5zbvtb29.messaging.solace.cloud:55555",
    "solace.messaging.service.vpn-name": "toiletflush",
    "solace.messaging.authentication.scheme.basic.username": "solace-cloud-client",
    "solace.messaging.authentication.scheme.basic.password": "b8888b098i13ip23decqu9cj87",
}

transport_security = TLS.create() \
   .with_certificate_validation(True, validate_server_name=False,
     trust_store_file_path="./Users/quynhvo/Library/Mobile Documents/com~apple~CloudDocs/Hackathon/uottahack2025/backend/DigiCertGlobalRootCA.crt.pem")

messaging_service = (
    MessagingService.builder()
    .from_properties(broker_props)
    .with_reconnection_retry_strategy(RetryStrategy.parametrized_retry(20, 3))
    .with_transport_security_strategy(transport_security)
    .build()

)


messaging_service.connect()
print("Connected to Solace PubSub+ successfully!")

publisher = messaging_service.create_direct_message_publisher_builder().build()
publisher.start()
print("Publisher started")

import time
from solace.messaging.resources.topic import Topic

washrooms = {
    "washroom1": {
        "id": 1,
        "totalStalls": 5,
        "totalAvailableStalls": 5,
        "gender": "male",
        "stalls": {f"stall{i}": {"vacant": True, "timeVacant": 0} for i in range(1, 6)}
    },
    "washroom2": {
        "id": 2,
        "totalStalls": 5,
        "totalAvailableStalls": 5,
        "gender": "female",
        "stalls": {f"stall{i}": {"vacant": True, "timeVacant": 0} for i in range(1, 6)}
    }
}

try:
    while True:
        print("\nWashrooms Overview:")
        for washroom_id, data in washrooms.items():
            print(f"{washroom_id} (Gender: {data['gender']}, "
                  f"Available: {data['totalAvailableStalls']}/{data['totalStalls']})")

        washroom_id = input("\nEnter Washroom ID: ").strip()
        if washroom_id not in washrooms:
            print("Invalid washroom ID. Try again.")
            continue

        stall_id = input(f"Enter Stall ID for {washroom_id} (e.g., stall1): ").strip()
        if stall_id not in washrooms[washroom_id]["stalls"]:
            print("Invalid stall ID. Try again.")
            continue

        # Prompt for Availability Status
        vacant = input("Is the stall vacant? (yes/no): ").strip().lower() == "yes"

        # Update Stall Status
        stall = washrooms[washroom_id]["stalls"][stall_id]
        if stall["vacant"] != vacant:  # Update only if status changes
            stall["vacant"] = vacant
            stall["timeVacant"] = int(time.time()) if vacant else 0

            washrooms[washroom_id]["totalAvailableStalls"] += 1 if vacant else -1

            stall_topic = Topic.of(f"washrooms/{washroom_id}/stalls/{stall_id}/status")
            stall_payload = {
                "washroom_id": washroom_id,
                "stall_id": stall_id,
                "vacant": stall["vacant"],
                "timeVacant": stall["timeVacant"]
            }
            publisher.publish(str(stall_payload), stall_topic)
            print(f"Published stall update: {stall_payload}")

            # Publish Washroom Update
            washroom_topic = Topic.of(f"washrooms/{washroom_id}/status")
            washroom_payload = {
                "washroom_id": washroom_id,
                "totalStalls": washrooms[washroom_id]["totalStalls"],
                "totalAvailableStalls": washrooms[washroom_id]["totalAvailableStalls"],
                "gender": washrooms[washroom_id]["gender"]
            }
            publisher.publish(str(washroom_payload), washroom_topic)
            print(f"Published washroom update: {washroom_payload}")
        else:
            print("No status change detected.")

except KeyboardInterrupt:
    print("\nExiting the publisher...")

# Clean Up
publisher.terminate()
messaging_service.disconnect()
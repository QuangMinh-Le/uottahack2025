from flask import Flask, jsonify, request
from flask_cors import CORS
from solace.messaging.messaging_service import MessagingService, RetryStrategy
from solace.messaging.config.transport_security_strategy import TLS
from solace.messaging.resources.topic import Topic
import json
import time
import threading
import random

app = Flask(__name__)
CORS(app)

# Build the Solace messaging service connection
broker_props = {
    "solace.messaging.transport.host": "tcp://mr-connection-ghw5zbvtb29.messaging.solace.cloud:55555",
    "solace.messaging.service.vpn-name": "toiletflush",
    "solace.messaging.authentication.scheme.basic.username": "solace-cloud-client",
    "solace.messaging.authentication.scheme.basic.password": "b8888b098i13ip23decqu9cj87",
}

transport_security = TLS.create() \
    .with_certificate_validation(True, validate_server_name=False,
     trust_store_file_path="./path/to/DigiCertGlobalRootCA.crt.pem")

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

washrooms = {
    "1": {
        "id": 1,
        "name": "Men's Washroom 101",
        "totalStalls": 5,
        "totalAvailableStalls": 5,
        "gender": "male",
        "stalls": {f"stall{i}": {"vacant": True, "timeVacant": 0} for i in range(1, 6)}
    },
    "2": {
        "id": 2,
        "name": "Women's Washroom 101",
        "totalStalls": 5,
        "totalAvailableStalls": 5,
        "gender": "female",
        "stalls": {f"stall{i}": {"vacant": True, "timeVacant": 0} for i in range(1, 6)}
    },
     "3": {
        "id": 3,
        "name": "Men's Washroom 102",
        "totalStalls": 2,
        "totalAvailableStalls": 2,
        "gender": "male",
        "stalls": {f"stall{i}": {"vacant": True, "timeVacant": 0} for i in range(1, 3)}
    },
     "4": {
        "id": 4,
        "name": "Women's Washroom 102",
        "totalStalls": 2,
        "totalAvailableStalls": 2,
        "gender": "female",
        "stalls": {f"stall{i}": {"vacant": True, "timeVacant": 0} for i in range(1, 3)}
    },
     "5": {
        "id": 5,
        "name": "Men's Washroom 103",
        "totalStalls": 3,
        "totalAvailableStalls": 3,
        "gender": "male",
        "stalls": {f"stall{i}": {"vacant": True, "timeVacant": 0} for i in range(1, 4)}
    },
     "6": {
        "id": 6,
        "name": "Women's Washroom 103",
        "totalStalls": 3,
        "totalAvailableStalls": 3,
        "gender": "female",
        "stalls": {f"stall{i}": {"vacant": True, "timeVacant": 0} for i in range(1, 4)}
    },

}

# Example bias factors:
# Default bias factors for most washrooms
DEFAULT_OCCUPANCY_PROBABILITY = 0.7  # chance a vacant stall becomes occupied
DEFAULT_VACANCY_PROBABILITY   = 0.2  # chance an occupied stall becomes vacant

# Custom bias factors for specific washrooms (IDs as strings)
WASHROOM_BIAS = {
    "1": {"occupancy": 0.95, "vacancy": 0.45},  # higher chance for washroom 1
    "4": {"occupancy": 0.95, "vacancy": 0.1},  # higher chance for washroom 4
}


OCCUPANCY_PROBABILITY = 0.7  # chance a vacant stall becomes occupied
VACANCY_PROBABILITY   = 0.2  # chance an occupied stall becomes vacant

def manage_washroom_status():
    """
    Background thread to simulate washroom status updates with a bias factor.
    """
    try:
        while True:
            # Pick a random washroom
            washroom_id = random.choice(list(washrooms.keys()))
            washroom = washrooms[washroom_id]

            # Pick a random stall in the chosen washroom
            stall_id = random.choice(list(washroom["stalls"].keys()))
            stall = washroom["stalls"][stall_id]

            # Determine the probabilities for this washroom
            if washroom_id in WASHROOM_BIAS:
                occupancy_probability = WASHROOM_BIAS[washroom_id]["occupancy"]
                vacancy_probability   = WASHROOM_BIAS[washroom_id]["vacancy"]
            else:
                occupancy_probability = DEFAULT_OCCUPANCY_PROBABILITY
                vacancy_probability   = DEFAULT_VACANCY_PROBABILITY

            # Current status
            vacant = stall["vacant"]

            # Decide if we change the stall's status based on the assigned bias factors
            if vacant:
                # If currently vacant, there's a probability we occupy it
                if random.random() < occupancy_probability:
                    vacant = False
            else:
                # If currently occupied, there's a probability it becomes vacant
                if random.random() < vacancy_probability:
                    vacant = True

            # Update Stall Status if it actually changes
            if stall["vacant"] != vacant:
                stall["vacant"] = vacant
                stall["timeVacant"] = int(time.time()) if vacant else 0

                # Update counters
                if vacant:
                    washroom["totalAvailableStalls"] += 1
                else:
                    washroom["totalAvailableStalls"] -= 1

                # -- Publish updates to Solace topics (pseudo-code below) --
                stall_topic = Topic.of(f"washrooms/{washroom_id}/stalls/{stall_id}/status")
                stall_payload = {
                    "washroom_id": washroom_id,
                    "stall_id": stall_id,
                    "vacant": stall["vacant"],
                    "timeVacant": stall["timeVacant"]
                }
                publisher.publish(json.dumps(stall_payload), stall_topic)
                print(f"Published stall update: {stall_payload}")

                washroom_topic = Topic.of("washrooms/status")
                washroom_payload = {
                    "washroom_id": washroom_id,
                    "totalStalls": washroom["totalStalls"],
                    "totalAvailableStalls": washroom["totalAvailableStalls"],
                    "gender": washroom["gender"]
                }
                publisher.publish(json.dumps(washroom_payload), washroom_topic)
                print(f"Published washroom update: {washroom_payload}")

            # Print washroom overview
            print("\nWashrooms Overview:")
            for wid, data in washrooms.items():
                print(
                    f"{wid} (Gender: {data['gender']}, "
                    f"Available: {data['totalAvailableStalls']}/{data['totalStalls']})"
                )

            # Sleep for a short interval before the next update
            time.sleep(0.5)

    except KeyboardInterrupt:
        print("\nExiting the publisher...")
        publisher.terminate()
        messaging_service.disconnect()

@app.route('/update-washroom', methods=['POST'])
def update_washroom():
    """
    Updates the status of a specific washroom stall.
    Expects JSON input: {"washroom_id": "1", "stall_id": "stall1", "vacant": true}
    """
    try:
        data = request.json
        washroom_id = data.get('washroom_id')
        stall_id = data.get('stall_id')
        vacant = data.get('vacant')

        if washroom_id not in washrooms:
            return jsonify({"error": "Invalid washroom_id"}), 400
        if stall_id not in washrooms[washroom_id]["stalls"]:
            return jsonify({"error": "Invalid stall_id"}), 400

        # Update Stall Status
        stall = washrooms[washroom_id]["stalls"][stall_id]
        if stall["vacant"] != vacant:  # Update only if status changes
            stall["vacant"] = vacant
            stall["timeVacant"] = int(time.time()) if vacant else 0

            washrooms[washroom_id]["totalAvailableStalls"] += 1 if vacant else -1

            # Publish updates to Solace topics
            stall_topic = Topic.of(f"washrooms/{washroom_id}/stalls/{stall_id}/status")
            stall_payload = {
                "washroom_id": washroom_id,
                "stall_id": stall_id,
                "vacant": stall["vacant"],
                "timeVacant": stall["timeVacant"]
            }
            publisher.publish(str(stall_payload), stall_topic)
            print(f"Published stall update: {stall_payload}")

            washroom_topic = Topic.of(f"washrooms/status")
            washroom_payload = {
                "washroom_id": washroom_id,
                "totalStalls": washrooms[washroom_id]["totalStalls"],
                "totalAvailableStalls": washrooms[washroom_id]["totalAvailableStalls"],
                "gender": washrooms[washroom_id]["gender"]
            }

            json_payload = json.dumps(washroom_payload)
            publisher.publish(json_payload, washroom_topic)
            print(f"Published washroom update: {washroom_payload}")

            return jsonify({"message": "Washroom status updated successfully"}), 200

        return jsonify({"message": "No status change detected"}), 200
    except Exception as e:
        print(f"Error updating washroom: {e}")
        return jsonify({"error": "Internal server error"}), 500


# Endpoint to get the initialized washroom data
@app.route('/get-washrooms', methods=['GET'])
def get_washrooms():
    """
    Returns the initialized washroom data as JSON.
    """
    return jsonify({"washrooms": washrooms}), 200

if __name__ == '__main__':
    # Start the background thread
    # threading.Thread(target=manage_washroom_status, daemon=True).start()
    threading.Thread(target=manage_washroom_status, daemon=True).start()

    # Run the Flask app
    app.run(debug=True, port=5001)
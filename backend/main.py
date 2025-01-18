from flask import Flask, jsonify, request
from solace.messaging.messaging_service import MessagingService
from solace.messaging.resources.topic import Topic
from solace.messaging.publisher.direct_message_publisher import DirectMessagePublisher
from solace.messaging.receiver.direct_message_receiver import DirectMessageReceiver

app = Flask(__name__)

# Solace PubSub+ configuration
SERVICE_HOST = 'mr-connection-ghw5zbvtb29.messaging.solace.cloud'
CLIENT_USERNAME = 'your-client-username'
CLIENT_PASSWORD = 'your-client-password'

# Initialize Solace Messaging Service
messaging_service = MessagingService.builder() \
    .from_properties({
        "solace.messaging.transport.host": SERVICE_HOST,
        "solace.messaging.service.authentication.basic.username": CLIENT_USERNAME,
        "solace.messaging.service.authentication.basic.password": CLIENT_PASSWORD,
        "solace.messaging.transport.ssl.validate_certificate": False
    }).build()
messaging_service.connect()

# Publisher setup
publisher = messaging_service.create_direct_message_publisher_builder().build()
publisher.start()

# Receiver setup
receiver = messaging_service.create_direct_message_receiver_builder() \
    .with_subscription(Topic.of("restroom/stall/status")) \
    .build()
receiver.start()

# In-memory data store for stalls
stall_status = {
    "washroom1": {"stall1": False, "stall2": True},
    "washroom2": {"stall1": True, "stall2": False},
}

@app.route('/api/stalls', methods=['GET'])
def get_stalls():
    """Fetch all stall statuses."""
    return jsonify(stall_status)

@app.route('/api/update', methods=['POST'])
def update_stall():
    """Update stall status and publish to Solace."""
    data = request.json
    washroom = data.get('washroom')
    stall = data.get('stall')
    status = data.get('status')

    if washroom in stall_status and stall in stall_status[washroom]:
        stall_status[washroom][stall] = status

        # Publish status update to Solace
        topic = f"restroom/{washroom}/{stall}/status"
        publisher.publish(message=f"{stall}: {'occupied' if status else 'available'}", topic=Topic.of(topic))

        return jsonify({"message": "Stall updated successfully"}), 200
    return jsonify({"message": "Invalid stall or washroom"}), 400

# Listen for updates
@receiver.message_handler
def handle_message(message):
    print(f"Received message: {message.get_payload_as_string()}")

if __name__ == '__main__':
    app.run(debug=True)

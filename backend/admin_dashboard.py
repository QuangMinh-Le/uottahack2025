from solace.messaging.resources.topic_subscription import TopicSubscription
from solace.messaging.receiver.message_receiver import MessageHandler
from solace.messaging.messaging_service import MessagingService, RetryStrategy
from solace.messaging.config.transport_security_strategy import TLS

# Configuration (reuse broker_properties from above)

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
print("Connected to Solace PubSub+")

# Subscribe to All Washrooms and Stalls
subscription = TopicSubscription.of("washrooms/>")
receiver = messaging_service.create_direct_message_receiver_builder().with_subscriptions([subscription]).build()
receiver.start()

# Custom MessageHandler
class CustomMessageHandler(MessageHandler):
    def on_message(self, incoming_message):
        topic = incoming_message.get_destination_name()
        payload = incoming_message.get_payload_as_string()
        print(f"Received message: Topic='{topic}', Payload={payload}")

# Create an instance of CustomMessageHandler
message_handler = CustomMessageHandler()

receiver.receive_async(message_handler)
print("Subscribed to all washroom and stall updates. Press Ctrl+C to exit.")

try:
    while True:
        pass  # Keep the subscriber running
except KeyboardInterrupt:
    print("\nExiting the subscriber...")

# Clean Up
receiver.terminate()
messaging_service.disconnect()

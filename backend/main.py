from flask import Flask, request
from solace.messaging.messaging_service import MessagingService, RetryStrategy
from solace.messaging.config.transport_security_strategy import TLS
from solace.messaging.resources.topic import Topic
import json
import os

app = Flask(__name__)
# = os.getenv("TRUST_STORE_FILE_PATH", "./DigiCertGlobalRootCA.crt")

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

@app.route("/user/create_user", methods=["POST"])
def create_user():
    user_data = request.get_json()
    print(user_data)

    destination = Topic.of("user/create_user")
    publisher.publish(message=json.dumps(user_data), destination=destination)

    return "User created successfully!"

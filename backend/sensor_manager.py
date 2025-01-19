import requests
import json
import time

# Flask server URL
BASE_URL = "http://localhost:5001"

def fetch_washrooms():
    """
    Fetch the current washroom data from the Flask server.
    """
    try:
        response = requests.get(f"{BASE_URL}/get-washrooms")
        if response.status_code == 200:
            washrooms = response.json()["washrooms"]
            return washrooms
        else:
            print(f"Error fetching washrooms: {response.status_code} {response.text}")
            return None
    except Exception as e:
        print(f"Failed to fetch washroom data: {e}")
        return None

def update_washroom(washroom_id, stall_id, vacant):
    """
    Update the status of a specific stall in a washroom using the Flask API.
    """
    try:
        payload = {
            "washroom_id": washroom_id,
            "stall_id": stall_id,
            "vacant": vacant
        }
        response = requests.post(f"{BASE_URL}/update-washroom", json=payload)
        if response.status_code == 200:
            print("Update successful:", response.json()["message"])
        else:
            print(f"Error updating washroom: {response.status_code} {response.text}")
    except Exception as e:
        print(f"Failed to update washroom: {e}")

def display_washrooms(washrooms):
    """
    Display washroom data in a user-friendly format.
    """
    print("\nWashrooms Overview:")
    for washroom_id, data in washrooms.items():
        print(f"  {washroom_id} - {data['name']} (Gender: {data['gender']}, "
              f"Available: {data['totalAvailableStalls']}/{data['totalStalls']})")
        for stall_id, stall in data["stalls"].items():
            status = "Vacant" if stall["vacant"] else "Occupied"
            print(f"    {stall_id}: {status}")

def simulate_updates(washrooms):
    """
    Simulate random updates to washroom stalls.
    """
    import random
    washroom_id = random.choice(list(washrooms.keys()))
    washroom = washrooms[washroom_id]
    stall_id = random.choice(list(washroom["stalls"].keys()))
    current_status = washroom["stalls"][stall_id]["vacant"]
    new_status = not current_status  # Toggle the status
    update_washroom(washroom_id, stall_id, new_status)

def main():
    """
    Main function to continuously fetch and update washroom data.
    """
    try:
        while True:
            washrooms = fetch_washrooms()
            if washrooms:
                display_washrooms(washrooms)
                simulate_updates(washrooms)
            else:
                print("Failed to fetch washroom data.")
            time.sleep(1)  # Delay for 1 second
    except KeyboardInterrupt:
        print("Exiting...")

if __name__ == "__main__":
    main()
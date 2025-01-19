from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/admin")
def admin():
    return jsonify({"toilets": ["toilet1", "toilet2","toilet3"]})


@app.route("/client")
def client():
    return jsonify({"toilets": ["toilet11", "toilet22","toilet33"]})

# Run the app
if __name__ == '__main__':
    app.run(debug=True)
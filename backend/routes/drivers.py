from flask import Blueprint, jsonify
import json, os

drivers_bp = Blueprint('drivers', __name__)
DATA_PATH = os.path.join(os.path.dirname(__file__), '../data/drivers.json')

@drivers_bp.route('/', methods=['GET'])
def get_drivers():
    with open(DATA_PATH, 'r') as f:
        data = json.load(f)
    return jsonify(data)

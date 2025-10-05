from flask import Blueprint, jsonify
import json, os

stores_bp = Blueprint('stores', __name__)
DATA_PATH = os.path.join(os.path.dirname(__file__), '../data/stores.json')

@stores_bp.route('/', methods=['GET'])
def get_stores():
    with open(DATA_PATH, 'r') as f:
        data = json.load(f)
    return jsonify(data)

from flask import Blueprint, jsonify
import json, os

orders_bp = Blueprint('orders', __name__)
DATA_PATH = os.path.join(os.path.dirname(__file__), '../data/orders.json')

@orders_bp.route('/', methods=['GET'])
def get_orders():
    with open(DATA_PATH, 'r') as f:
        data = json.load(f)
    return jsonify(data)

from flask import Blueprint, jsonify
import json, os

customers_bp = Blueprint('customers', __name__)
DATA_PATH = os.path.join(os.path.dirname(__file__), '../data/customers.json')

@customers_bp.route('/', methods=['GET'])
def get_customers():
    with open(DATA_PATH, 'r') as f:
        data = json.load(f)
    return jsonify(data)

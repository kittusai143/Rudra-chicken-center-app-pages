from flask import Blueprint, jsonify
import json, os

products_bp = Blueprint('products', __name__)
DATA_PATH = os.path.join(os.path.dirname(__file__), '../data/products.json')

@products_bp.route('/', methods=['GET'])
def get_products():
    with open(DATA_PATH, 'r') as f:
        data = json.load(f)
    return jsonify(data)

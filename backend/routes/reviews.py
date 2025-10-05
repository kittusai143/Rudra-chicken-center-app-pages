from flask import Blueprint, jsonify
import json, os

reviews_bp = Blueprint('reviews', __name__)
DATA_PATH = os.path.join(os.path.dirname(__file__), '../data/reviews.json')

@reviews_bp.route('/', methods=['GET'])
def get_reviews():
    with open(DATA_PATH, 'r') as f:
        data = json.load(f)
    return jsonify(data)

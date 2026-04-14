from flask import Blueprint, jsonify
from services.train_service import train_model

train_bp = Blueprint("train", __name__)

@train_bp.route("/train", methods=["POST"])
def train():
    result = train_model()
    return jsonify(result)
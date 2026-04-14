from flask import Blueprint, request, jsonify
from services.recognize_service import process_frame

recognize_bp = Blueprint("recognize", __name__)

@recognize_bp.route("/recognize", methods=["POST"])
def recognize():
    file = request.files["frame"]
    result = process_frame(file)
    return jsonify(result)
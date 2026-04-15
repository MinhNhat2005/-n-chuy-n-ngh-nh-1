from flask import Blueprint, request, jsonify
from services.recognize_service import process_frame

recognize_bp = Blueprint("recognize", __name__)

@recognize_bp.route("/recognize", methods=["POST"])
def recognize():
    file = request.files["frame"]
    class_id = request.form.get("classId")  

    result = process_frame(file, class_id)

    return jsonify(result)
from flask import Blueprint, request, jsonify
from db import get_db

class_bp = Blueprint("classes", __name__)


# =========================
# GET ALL CLASSES
# =========================
@class_bp.route("/classes", methods=["GET"])
def get_classes():

    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM classes")
    data = cursor.fetchall()

    cursor.close()
    db.close()

    return jsonify(data)


# =========================
# ADD CLASS
# =========================
@class_bp.route("/classes", methods=["POST"])
def add_class():

    data = request.json

    db = get_db()
    cursor = db.cursor()

    sql = "INSERT INTO classes (id,name,faculty) VALUES (%s,%s,%s)"
    val = (data["id"], data["name"], data["faculty"])

    cursor.execute(sql, val)

    db.commit()

    cursor.close()
    db.close()

    return jsonify({"message": "Class added"})


# =========================
# DELETE CLASS
# =========================
@class_bp.route("/classes/<id>", methods=["DELETE"])
def delete_class(id):

    db = get_db()
    cursor = db.cursor()

    cursor.execute("DELETE FROM classes WHERE id=%s", (id,))
    db.commit()

    cursor.close()
    db.close()

    return jsonify({"message": "Class deleted"})
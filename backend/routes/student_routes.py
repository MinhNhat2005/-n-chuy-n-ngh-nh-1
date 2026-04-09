from flask import Blueprint, request, jsonify
from db import get_db

student_bp = Blueprint("student_bp", __name__)

# ===== LẤY TẤT CẢ SINH VIÊN =====
@student_bp.route("/students", methods=["GET"])
def get_all_students():
    db = get_db()
    cursor = db.cursor(dictionary=True)

    query = """
    SELECT s.id, s.name, s.email,
        GROUP_CONCAT(e.class_id) AS classes
    FROM students s
    LEFT JOIN enrollments e ON s.id = e.student_id
    GROUP BY s.id
    """

    cursor.execute(query)
    data = cursor.fetchall()

    return jsonify(data)


# ===== LẤY SINH VIÊN THEO LỚP =====
@student_bp.route("/students/class/<class_id>", methods=["GET"])
def get_students_by_class(class_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)

    query = """
    SELECT s.id, s.name, s.email
    FROM students s
    JOIN enrollments e ON s.id = e.student_id
    WHERE e.class_id = %s
    """

    cursor.execute(query, (class_id,))
    data = cursor.fetchall()

    return jsonify(data)


# ===== THÊM SINH VIÊN =====
@student_bp.route("/students", methods=["POST"])
def add_student():
    data = request.json

    db = get_db()
    cursor = db.cursor()

    query = "INSERT INTO students (id, name, email) VALUES (%s, %s, %s)"
    cursor.execute(query, (data["id"], data["name"], data["email"]))

    db.commit()

    return jsonify({"message": "Thêm sinh viên thành công"})


# ===== GÁN SINH VIÊN VÀO LỚP =====
@student_bp.route("/enrollments", methods=["POST"])
def add_enrollment():
    data = request.json

    db = get_db()
    cursor = db.cursor()

    query = "INSERT INTO enrollments (student_id, class_id) VALUES (%s, %s)"
    cursor.execute(query, (data["studentId"], data["classId"]))

    db.commit()

    return jsonify({"message": "Thêm vào lớp thành công"})


# ===== XÓA SINH VIÊN =====
@student_bp.route("/students/<student_id>", methods=["DELETE"])
def delete_student(student_id):
    db = get_db()
    cursor = db.cursor()

    # xóa enrollment trước
    cursor.execute("DELETE FROM enrollments WHERE student_id = %s", (student_id,))
    cursor.execute("DELETE FROM students WHERE id = %s", (student_id,))

    db.commit()

    return jsonify({"message": "Xóa thành công"})
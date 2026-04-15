from flask import Blueprint, request, jsonify
from db import get_db
from datetime import datetime

attendance_bp = Blueprint("attendance", __name__)

@attendance_bp.route("/attendance", methods=["POST"])
def save_attendance():
    data = request.get_json(force=True)

    print("DATA RECEIVED:", data)

    student_id = data.get("studentId")
    student_name = data.get("studentName")
    class_id = data.get("classId")
    image = data.get("image")

    if not student_id or not student_name or not class_id:
        return jsonify({
            "error": "Missing data",
            "received": data
        }), 400

    try:
        db = get_db()
        cursor = db.cursor()

        # 🔥 check trùng theo ngày
        cursor.execute("""
            SELECT id FROM attendance
            WHERE student_id = %s AND class_id = %s
            AND DATE(time) = CURDATE()
        """, (student_id, class_id))

        if cursor.fetchone():
            cursor.close()
            db.close()
            return jsonify({"message": "Already checked in"}), 200

        # 🔥 insert
        cursor.execute("""
            INSERT INTO attendance (student_id, student_name, class_id, image)
            VALUES (%s, %s, %s, %s)
        """, (student_id, student_name, class_id, image))

        db.commit()

        # 🔥 lấy lại dữ liệu vừa insert
        cursor.execute("""
            SELECT student_id, student_name, time, image
            FROM attendance
            WHERE id = LAST_INSERT_ID()
        """)

        result = cursor.fetchone()

        cursor.close()
        db.close()

        return jsonify({
            "studentId": result[0],
            "studentName": result[1],
            "time": result[2].strftime("%H:%M:%S"),
            "image": result[3]
        }), 200

    except Exception as e:
        db.rollback()   # 🔥 quan trọng
        print("ERROR:", e)

        return jsonify({"error": "Database error"}), 500
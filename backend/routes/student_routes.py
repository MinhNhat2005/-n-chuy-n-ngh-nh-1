import os
import uuid
from flask import Blueprint, request, jsonify
from db import get_db


student_bp = Blueprint("student_bp", __name__)

# ===== LẤY TẤT CẢ SINH VIÊN =====
# @student_bp.route("/students", methods=["GET"])
# def get_all_students():
#     db = get_db()
#     cursor = db.cursor(dictionary=True)

#     query = """
#     SELECT 
#         s.id, 
#         s.name, 
#         s.email,
#         GROUP_CONCAT(c.name) AS class_names,
#         GROUP_CONCAT(c.id) AS class_ids
#     FROM students s
#     LEFT JOIN enrollments e ON s.id = e.student_id
#     LEFT JOIN classes c ON e.class_id = c.id
#     GROUP BY s.id
#     """

#     cursor.execute(query)
#     data = cursor.fetchall()

#     return jsonify(data)


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
    conn = get_db()
    cursor = conn.cursor()

    try:
        query = "INSERT INTO enrollments (student_id, class_id) VALUES (%s, %s)"
        cursor.execute(query, (data["studentId"], data["classId"]))

        conn.commit()   # 🔥 BẮT BUỘC
        return jsonify({"message": "OK"})
    
    except Exception as e:
        conn.rollback()
        print("ERROR:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()   # 🔥 QUAN TRỌNG


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

@student_bp.route("/update-student-full/<id>", methods=["PUT"])
def update_student_full(id):
    data = request.json
    conn = get_db()
    cursor = conn.cursor()

    try:
        # update info
        cursor.execute(
            "UPDATE students SET name=%s, email=%s WHERE id=%s",
            (data["name"], data["email"], id)
        )

        # xóa lớp cũ
        cursor.execute("DELETE FROM enrollments WHERE student_id=%s", (id,))

        # thêm lớp mới
        for class_id in data["class_ids"]:
            cursor.execute(
                "INSERT INTO enrollments (student_id, class_id) VALUES (%s, %s)",
                (id, class_id)
            )

        conn.commit()
        return jsonify({"message": "OK"})

    except Exception as e:
        conn.rollback()
        print("ERROR:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

@student_bp.route("/enrollments/<student_id>", methods=["DELETE"])
def delete_enrollments(student_id):
    conn = get_db()
    cursor = conn.cursor()

    try:
        cursor.execute("DELETE FROM enrollments WHERE student_id=%s", (student_id,))
        conn.commit()
        return jsonify({"message": "Deleted"})
    
    finally:
        cursor.close()
        conn.close()


UPLOAD_FOLDER = "data/students"
@student_bp.route("/upload-images/<student_id>", methods=["POST"])
def upload_images(student_id):
    conn = get_db()
    cursor = conn.cursor()

    try:
        files = request.files.getlist("images")

        if not files:
            return jsonify({"error": "No files"}), 400

        # 📁 tạo folder: data/students/{student_id}
        student_folder = os.path.join(UPLOAD_FOLDER, student_id)
        os.makedirs(student_folder, exist_ok=True)

        saved_paths = []

        for file in files:
            # 🔥 tạo tên file unique
            filename = f"{uuid.uuid4().hex}.png"

            # 🔥 path lưu thật trên server
            student_folder = os.path.join(UPLOAD_FOLDER, student_id)
            os.makedirs(student_folder, exist_ok=True)

            filepath = os.path.join(student_folder, filename)

            # 🔥 LƯU FILE THẬT
            file.save(filepath)

            # 🔥 lưu đường dẫn tương đối vào DB
            relative_path = f"{student_id}/{filename}"

            cursor.execute(
                "INSERT INTO student_images (student_id, image_path) VALUES (%s, %s)",
                (student_id, relative_path)
            )

            saved_paths.append(relative_path)  # 👈 đúng phải là cái này

        conn.commit()

        return jsonify({
            "message": "Upload thành công",
            "files": saved_paths
        })

    except Exception as e:
        conn.rollback()
        print("UPLOAD ERROR:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


@student_bp.route("/students", methods=["GET"])
def get_students():
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    query = """
     SELECT 
        s.id,
        s.name,
        s.email,

        -- Đếm ảnh riêng (chuẩn 100%)
        (
            SELECT COUNT(*) 
            FROM student_images si 
            WHERE si.student_id = s.id
        ) AS images,

        GROUP_CONCAT(DISTINCT c.name) AS class_names,
        GROUP_CONCAT(DISTINCT c.id) AS class_ids

        FROM students s

        LEFT JOIN enrollments e
        ON s.id = e.student_id

        LEFT JOIN classes c
        ON e.class_id = c.id

        GROUP BY s.id
    """

    cursor.execute(query)
    data = cursor.fetchall()

    # 👉 convert class_ids string → array
    for row in data:
        if row["class_ids"]:
            row["class_ids"] = row["class_ids"].split(",")
        else:
            row["class_ids"] = []

    cursor.close()
    conn.close()

    return jsonify(data)


@student_bp.route("/student-images/<student_id>", methods=["GET"])
def get_student_images(student_id):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT id, image_path FROM student_images WHERE student_id=%s",
        (student_id,)
    )

    data = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(data)


@student_bp.route("/student-images/<int:image_id>", methods=["DELETE"])
def delete_image(image_id):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    try:
        # 1. lấy path từ DB
        cursor.execute(
            "SELECT image_path FROM student_images WHERE id=%s",
            (image_id,)
        )
        img = cursor.fetchone()

        if img:
            # 2. tạo path thật
            real_path = os.path.join("data/students", img["image_path"])

            # 3. xóa file nếu tồn tại
            if os.path.exists(real_path):
                os.remove(real_path)
                print("Đã xóa file:", real_path)
            else:
                print("Không tìm thấy file:", real_path)

            folder = os.path.join("data/students", img["image_path"].split("/")[0])

            if os.path.exists(folder) and len(os.listdir(folder)) == 0:
                os.rmdir(folder)

        # 4. xóa DB
        cursor.execute(
            "DELETE FROM student_images WHERE id=%s",
            (image_id,)
        )

        conn.commit()
        return jsonify({"message": "Deleted"})

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

@student_bp.route("/upload-students-file/<class_id>", methods=["POST"])
def upload_students_file(class_id):
    conn = get_db()
    cursor = conn.cursor()

    try:
        file = request.files.get("file")

        if not file:
            return jsonify({"error": "No file"}), 400

        filename = file.filename.lower()

        students = []

        # ===== CSV =====
        if filename.endswith(".csv"):
            import csv
            stream = file.stream.read().decode("utf-8").splitlines()
            reader = csv.DictReader(stream)

            for row in reader:
                students.append({
                    "id": row.get("id"),
                    "name": row.get("name"),
                    "email": row.get("email", "")
                })

        # ===== EXCEL =====
        elif filename.endswith(".xlsx"):
            import pandas as pd
            df = pd.read_excel(file)

            for _, row in df.iterrows():
                students.append({
                    "id": str(row.get("id")).strip(),
                    "name": str(row.get("name")).strip(),
                    "email": str(row.get("email", "")).strip()
                })

        else:
            return jsonify({"error": "Chỉ hỗ trợ CSV hoặc Excel"}), 400

        added = 0

        for sv in students:
            if not sv["id"] or not sv["name"]:
                continue

            # check tồn tại
            cursor.execute("SELECT id FROM students WHERE id=%s", (sv["id"],))
            exists = cursor.fetchone()

            if not exists:
                cursor.execute(
                    "INSERT INTO students (id, name, email) VALUES (%s, %s, %s)",
                    (sv["id"], sv["name"], sv["email"])
                )

            # gán lớp
            cursor.execute(
                "INSERT IGNORE INTO enrollments (student_id, class_id) VALUES (%s, %s)",
                (sv["id"], class_id)
            )

            added += 1

        conn.commit()

        return jsonify({
            "message": f"Đã import {added} sinh viên"
        })

    except Exception as e:
        conn.rollback()
        print("UPLOAD FILE ERROR:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()
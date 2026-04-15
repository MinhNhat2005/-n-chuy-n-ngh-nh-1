import os
from flask import Blueprint, jsonify, request,send_file
from db import get_db
import pandas as pd
from openpyxl import Workbook
from openpyxl.drawing.image import Image as ExcelImage
from datetime import datetime
from io import BytesIO

attendance_history_bp = Blueprint("attendance_history", __name__)

@attendance_history_bp.route("/attendance/history", methods=["GET"])
def get_history():
    try:
        db = get_db()
        cursor = db.cursor()

        search = request.args.get("search", "")
        class_id = request.args.get("classId", "all")

        query = """
            SELECT id, student_id, student_name, class_id, time, image
            FROM attendance
            WHERE 1=1
        """

        params = []

        # 🔍 search theo tên hoặc MSSV
        if search:
            query += " AND (student_name LIKE %s OR student_id LIKE %s)"
            params.append(f"%{search}%")
            params.append(f"%{search}%")

        # 🎯 filter theo lớp
        if class_id != "all":
            query += " AND class_id = %s"
            params.append(class_id)

        query += " ORDER BY time DESC"

        cursor.execute(query, params)
        rows = cursor.fetchall()

        result = []
        for row in rows:
            result.append({
                "id": row[0],
                "student_id": row[1],
                "student_name": row[2],
                "class_name": row[3],
                "time": row[4].strftime("%Y-%m-%d %H:%M:%S"),
                "image": row[5]   # 🔥 QUAN TRỌNG
            })

        cursor.close()
        db.close()

        return jsonify(result), 200

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": "Server error"}), 500
    

@attendance_history_bp.route("/attendance/<int:id>", methods=["DELETE"])
def delete_attendance(id):
    try:
        db = get_db()
        cursor = db.cursor()

        # 🔥 1. Lấy đường dẫn ảnh
        cursor.execute("SELECT image FROM attendance WHERE id = %s", (id,))
        row = cursor.fetchone()

        if not row:
            return jsonify({"error": "Record not found"}), 404

        image_path = row[0]

        # 🔥 2. Xóa file ảnh (nếu có)
        if image_path:
            try:
                if os.path.exists(image_path):
                    os.remove(image_path)
                    print("Deleted image:", image_path)
            except Exception as e:
                print("Error deleting image:", e)

        # 🔥 3. Xóa DB
        cursor.execute("DELETE FROM attendance WHERE id = %s", (id,))
        db.commit()

        cursor.close()
        db.close()

        return jsonify({"message": "Deleted successfully"}), 200

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": "Server error"}), 500
    
attendance_export_bp = Blueprint("attendance_export", __name__)

@attendance_export_bp.route("/attendance/export", methods=["GET"])
def export_excel():
    db = get_db()
    cursor = db.cursor()

    # ===== LẤY FILTER =====
    search = request.args.get("search", "")
    class_id = request.args.get("classId", "all")

    query = """
        SELECT student_id, student_name, class_id, time, image
        FROM attendance
        WHERE 1=1
    """

    params = []

    # 🔍 search
    if search:
        query += " AND (student_name LIKE %s OR student_id LIKE %s)"
        params.append(f"%{search}%")
        params.append(f"%{search}%")

    # 🎯 filter class
    if class_id != "all":
        query += " AND class_id = %s"
        params.append(class_id)

    query += " ORDER BY time DESC"

    cursor.execute(query, params)
    rows = cursor.fetchall()

    wb = Workbook()
    ws = wb.active

    # ===== 🔥 TIÊU ĐỀ =====
    if class_id == "all":
        title = "DANH SÁCH ĐIỂM DANH SINH VIÊN (TẤT CẢ LỚP)"
    else:
        title = f"DANH SÁCH ĐIỂM DANH SINH VIÊN LỚP {class_id.upper()}"

    ws.merge_cells("A1:E1")
    ws["A1"] = title

    from openpyxl.styles import Font, Alignment

    ws["A1"].font = Font(size=14, bold=True)
    ws["A1"].alignment = Alignment(horizontal="center")

    # ===== HEADER =====
    ws.append(["MSSV", "Tên", "Lớp", "Thời gian", "Ảnh"])

    row_index = 3

    for row in rows:
        student_id, name, class_id_row, time, image_path = row

        ws.cell(row=row_index, column=1, value=student_id)
        ws.cell(row=row_index, column=2, value=name)
        ws.cell(row=row_index, column=3, value=class_id_row)
        ws.cell(row=row_index, column=4, value=str(time))

        # ✅ CHÈN ẢNH
        if image_path and os.path.exists(image_path):
            try:
                img = ExcelImage(image_path)
                img.width = 80
                img.height = 80
                ws.add_image(img, f"E{row_index}")
                ws.row_dimensions[row_index].height = 60
            except:
                pass

        row_index += 1

    # ===== XUẤT FILE =====
    output = BytesIO()
    wb.save(output)
    output.seek(0)

    cursor.close()
    db.close()

    return send_file(
        output,
        as_attachment=True,
        download_name="attendance.xlsx",
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
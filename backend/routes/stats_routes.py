from flask import Blueprint, jsonify
from db import get_db
from datetime import datetime, timedelta
stats_bp = Blueprint("stats", __name__)


@stats_bp.route("/attendance/stats", methods=["GET"])
def get_stats():
    db = get_db()
    cursor = db.cursor()

    cursor.execute("SELECT COUNT(*) FROM students")
    total_students = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM classes")
    total_classes = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM attendance")
    total_attendance = cursor.fetchone()[0]

    # 👉 Lấy ngày hôm nay
    today = datetime.today()

    # 👉 Tìm Thứ 2 của tuần hiện tại
    day = today.weekday()  # 0 = Monday
    monday = today - timedelta(days=day)

    # 👉 Query dữ liệu trong tuần
    cursor.execute("""
        SELECT DATE(time), COUNT(*)
        FROM attendance
        WHERE DATE(time) BETWEEN %s AND %s
        GROUP BY DATE(time)
    """, (monday.strftime("%Y-%m-%d"), (monday + timedelta(days=6)).strftime("%Y-%m-%d")))

    raw_data = cursor.fetchall()

    # 👉 Convert về dạng FE cần
    chart = []
    for r in raw_data:
        chart.append({
            "date": r[0].strftime("%Y-%m-%d"),
            "count": r[1]
        })

    return jsonify({
        "total_students": total_students,
        "total_classes": total_classes,
        "total_attendance": total_attendance,
        "chart": chart
    })
import cv2
import numpy as np
import face_recognition
from datetime import datetime
import os

from services.face_service import recognize_face
from services.tracking_service import update_tracking
from db import get_db


def process_frame(file, class_id):
    npimg = np.frombuffer(file.read(), np.uint8)
    frame = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    face_locations = face_recognition.face_locations(rgb)
    face_encodings = face_recognition.face_encodings(rgb, face_locations)

    results = []

    db = get_db()
    cursor = db.cursor()

    for (top, right, bottom, left), encoding in zip(face_locations, face_encodings):

        # ===== 🔥 NHẬN DIỆN =====
        student_id = recognize_face(encoding)

        if student_id == "Unknown" or student_id is None:
            student_id = "Unknown"
            student_name = "Unknown"
        else:
            cursor.execute("SELECT name FROM students WHERE id=%s", (student_id,))
            row = cursor.fetchone()
            student_name = row[0] if row else "Unknown"

        update_tracking(student_id)

        # ===== 🔥 CẮT ẢNH =====
        face_img = frame[top:bottom, left:right]

        # ===== 🔥 CHECK DB THEO CLASS =====
        allow_save = True

        if student_id != "Unknown":
            cursor.execute("""
                SELECT time FROM attendance
                WHERE student_id=%s AND class_id=%s
                ORDER BY time DESC
                LIMIT 1
            """, (student_id, class_id))

            row = cursor.fetchone()

            if row:
                last_time = row[0]
                diff = datetime.now() - last_time

                if diff.total_seconds() < 3600:
                    allow_save = False


        # ===== 🔥 LƯU ẢNH =====
        image_path = None

        if student_id != "Unknown" and allow_save:

            # 👉 copy frame trước
            full_img = frame.copy()

            # 👉 vẽ bounding box
            cv2.rectangle(full_img, (left, top), (right, bottom), (0, 255, 0), 2)

            # 👉 vẽ tên
            cv2.putText(full_img, student_name, (left, top - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,255,0), 2)

            # 👉 resize để nhẹ
            full_img = cv2.resize(full_img, (640, 480))

            # 👉 lưu theo class + student
            folder = f"data/history/{class_id}/{student_id}"
            os.makedirs(folder, exist_ok=True)

            filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
            filepath = f"{folder}/{filename}"

            cv2.imwrite(filepath, full_img, [int(cv2.IMWRITE_JPEG_QUALITY), 70])

            image_path = filepath

        # ===== OUTPUT =====
        results.append({
            "id": student_id,
            "name": student_name,
            "time": datetime.now().strftime("%H:%M:%S"),
            "bbox": [top, right, bottom, left],
            "image": image_path
        })

    cursor.close()
    db.close()

    return {"results": results}
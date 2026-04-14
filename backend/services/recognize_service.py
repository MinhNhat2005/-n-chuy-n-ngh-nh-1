import cv2
import numpy as np
import face_recognition
from datetime import datetime

from services.face_service import recognize_face
from services.tracking_service import update_tracking
from db import get_db   # 🔥 THÊM

def process_frame(file):
    npimg = np.frombuffer(file.read(), np.uint8)
    frame = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    face_locations = face_recognition.face_locations(rgb)
    face_encodings = face_recognition.face_encodings(rgb, face_locations)

    results = []

    db = get_db()
    cursor = db.cursor()

    for (top, right, bottom, left), encoding in zip(face_locations, face_encodings):

        # 🔥 ID sau nhận diện
        student_id = recognize_face(encoding)

        if student_id == "Unknown" or student_id is None:
            student_id = "Unknown"
            student_name = "Unknown"
        else:
            # 🔥 LẤY TÊN TỪ DB
            cursor.execute("SELECT name FROM students WHERE id=%s", (student_id,))
            row = cursor.fetchone()
            student_name = row[0] if row else "Unknown"

        update_tracking(student_id)

        # ✅ OUTPUT CHUẨN
        results.append({
            "id": student_id,
            "name": student_name,
            "time": datetime.now().strftime("%H:%M:%S"),
            "bbox": [top, right, bottom, left]
        })

    return {"results": results}
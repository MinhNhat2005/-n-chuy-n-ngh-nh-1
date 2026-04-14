import numpy as np
from models.face_model import load_model
from core.config import THRESHOLD

def recognize_face(face_encoding):
    database = load_model()

    min_dist = 999
    best_match = "Unknown"

    for student_id, encodings in database.items():
        for enc in encodings:
            dist = np.linalg.norm(enc - face_encoding)

            if dist < min_dist:
                min_dist = dist
                best_match = student_id

    if min_dist < THRESHOLD:
        return best_match

    return "Unknown"
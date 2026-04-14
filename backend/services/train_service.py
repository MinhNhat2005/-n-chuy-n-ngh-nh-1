import os
import face_recognition
from core.config import DATA_PATH
from models.face_model import save_model

def train_model():
    print("🚀 Training started...")
    print("📁 DATA_PATH:", DATA_PATH)

    data = {}

    if not os.path.exists(DATA_PATH):
        print("❌ DATA_PATH không tồn tại")
        return {"error": "Data path not found"}

    for student_id in os.listdir(DATA_PATH):
        student_path = os.path.join(DATA_PATH, student_id)

        if not os.path.isdir(student_path):
            continue

        encodings = []
        print(f"👉 Processing {student_id}")

        for img_name in os.listdir(student_path):
            img_path = os.path.join(student_path, img_name)

            try:
                image = face_recognition.load_image_file(img_path)
                faces = face_recognition.face_encodings(image)

                if faces:
                    encodings.append(faces[0])
                else:
                    print(f"⚠️ No face: {img_name}")

            except Exception as e:
                print(f"❌ Error {img_name}: {e}")

        print(f"✅ {student_id}: {len(encodings)} faces")

        if encodings:
            data[student_id] = encodings

    print("💾 Saving model...")
    save_model(data)

    print("🎉 Training DONE!")

    return {"message": "Training completed", "total_students": len(data)}
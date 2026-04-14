import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DATA_PATH = os.path.join(BASE_DIR, "data", "students")
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")

THRESHOLD = 0.5
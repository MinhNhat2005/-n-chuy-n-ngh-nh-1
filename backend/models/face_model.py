import pickle
from core.config import MODEL_PATH

def save_model(data):
    print("💾 Saving model to:", MODEL_PATH)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(data, f)

def load_model():
    try:
        with open(MODEL_PATH, "rb") as f:
            return pickle.load(f)
    except:
        return {}
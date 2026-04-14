from flask import Flask
from flask_cors import CORS
from flask import send_from_directory
from routes.train_routes import train_bp
from routes.recognize_routes import recognize_bp

# import routes
from routes.class_routes import class_bp
from routes.student_routes import student_bp
from routes.attendance_routes import attendance_bp

app = Flask(__name__)
CORS(app)

# đăng ký routes
app.register_blueprint(class_bp)
app.register_blueprint(student_bp)

@app.route('/images/<path:filename>')
def serve_images(filename):
    return send_from_directory('data/students', filename)

@app.route('/images/<path:filename>')
def get_image(filename):
    return send_from_directory('data/students', filename)

# register routes
app.register_blueprint(train_bp, url_prefix="/api")
app.register_blueprint(recognize_bp, url_prefix="/api")

@app.route("/")
def home():
    return "Face Recognition API is running 🚀"
# attendance
app.register_blueprint(attendance_bp)

if __name__ == "__main__":
    app.run(port=5001, debug=True)

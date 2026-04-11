from flask import Flask
from flask_cors import CORS
from flask import send_from_directory

# import routes
from routes.class_routes import class_bp
from routes.student_routes import student_bp

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

if __name__ == "__main__":
    app.run(debug=True)
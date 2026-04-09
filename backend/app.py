from flask import Flask
from flask_cors import CORS

# import routes
from routes.class_routes import class_bp
from routes.student_routes import student_bp

app = Flask(__name__)
CORS(app)

# đăng ký routes
app.register_blueprint(class_bp)
app.register_blueprint(student_bp)

if __name__ == "__main__":
    app.run(debug=True)
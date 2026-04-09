from db import get_cursor

# ===== GET ALL =====
def get_all_students():
    db, cursor = get_cursor()

    cursor.execute("SELECT id, name, email FROM students")
    students = cursor.fetchall()

    cursor.close()
    db.close()

    return students


# ===== GET BY CLASS =====
def get_students_by_class_db(class_id):
    db, cursor = get_cursor()

    cursor.execute("""
        SELECT s.id, s.name, s.email
        FROM students s
        JOIN enrollments e ON s.id = e.student_id
        WHERE e.class_id = %s
    """, (class_id,))

    students = cursor.fetchall()

    cursor.close()
    db.close()

    return students


# ===== ADD =====
def add_student_db(data):
    db, cursor = get_cursor()

    # check tồn tại
    cursor.execute("SELECT * FROM students WHERE id = %s", (data["id"],))
    existing = cursor.fetchone()

    if not existing:
        cursor.execute(
            "INSERT INTO students (id, name, email) VALUES (%s, %s, %s)",
            (data["id"], data["name"], data["email"])
        )

    # thêm vào lớp
    cursor.execute(
        "INSERT INTO enrollments (student_id, class_id) VALUES (%s, %s)",
        (data["id"], data["classId"])
    )

    db.commit()
    cursor.close()
    db.close()


# ===== UPDATE =====
def update_student_db(id, data):
    db, cursor = get_cursor()

    cursor.execute(
        "UPDATE students SET name=%s, email=%s WHERE id=%s",
        (data["name"], data["email"], id)
    )

    db.commit()
    cursor.close()
    db.close()


# ===== DELETE =====
def delete_student_db(id):
    db, cursor = get_cursor()

    cursor.execute("DELETE FROM enrollments WHERE student_id=%s", (id,))
    cursor.execute("DELETE FROM students WHERE id=%s", (id,))

    db.commit()
    cursor.close()
    db.close()
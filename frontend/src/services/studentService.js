const API = "http://localhost:5000"

// ===== LẤY DANH SÁCH SINH VIÊN THEO LỚP =====
export const getStudentsByClass = async (classId) => {
  try {
    const res = await fetch(`${API}/students/class/${classId}`)

    if (!res.ok) throw new Error("Lỗi lấy danh sách sinh viên")

    const data = await res.json()
    console.log("API students:", data) // 🔥 debug

    return data
  } catch (error) {
    console.error(error)
    return []
  }
}

export const getAllStudents = async () => {
  const res = await fetch("http://localhost:5000/students")
  return await res.json()
}

// ===== THÊM SINH VIÊN =====
export const addStudent = async (data) => {
  try {
    const res = await fetch(`http://localhost:5000/students`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: data.id,
        name: data.name,
        email: data.email
      })
    })

    if (!res.ok) throw new Error("Thêm sinh viên thất bại")

    return await res.json()
  } catch (error) {
    console.error(error)
    return null
  }
}

// ===== XÓA SINH VIÊN =====
export const deleteStudent = async (id) => {
  try {
    const res = await fetch(`${API}/students/${id}`, {
      method: "DELETE"
    })

    if (!res.ok) throw new Error("Xóa sinh viên thất bại")

    return await res.json()
  } catch (error) {
    console.error(error)
    return null
  }
}

// ===== UPDATE =====
export const updateStudent = async (id, data) => {
  try {
    const res = await fetch(`${API}/students/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email
      })
    })

    if (!res.ok) throw new Error("Update thất bại")

    return await res.json()
  } catch (error) {
    console.error(error)
    return null
  }
}

export const addEnrollment = async (data) => {
  try {
    const res = await fetch("http://localhost:5000/enrollments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })

    if (!res.ok) throw new Error("Lỗi thêm enrollment")

    return await res.json()
  } catch (error) {
    console.error(error)
    return null
  }
}
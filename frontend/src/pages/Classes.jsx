import { useState, useEffect } from "react"
import MainLayout from "../layout/MainLayout"
import { FaPlus, FaTrash, FaBook, FaUsers } from "react-icons/fa"
import { addEnrollment } from "../services/studentService"

// services
import { getClasses, addClass, deleteClass } from "../services/classService"
import { addStudent, getStudentsByClass } from "../services/studentService"

export default function Classes() {

  // ===== STATE =====
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState("")
  const [students, setStudents] = useState([])

  const [searchClass, setSearchClass] = useState("")
  const [searchStudent, setSearchStudent] = useState("")

  const [editingStudent, setEditingStudent] = useState(null)
  const [menuOpenId, setMenuOpenId] = useState(null)

  const [newClass, setNewClass] = useState({
    id: "",
    name: "",
    faculty: ""
  })

  const [newStudent, setNewStudent] = useState({
    id: "",
    name: "",
    email: ""
  })

  const faculties = [
    { id: "KHMT", name: "Khoa học máy tính" },
    { id: "KTMT_DT", name: "Kỹ thuật máy tính và Điện tử" },
    { id: "KTS_TMDT", name: "Kinh tế số và Thương mại điện tử" },
  ]

  const [addType, setAddType] = useState("manual")

  // ===== LOAD CLASSES =====
  useEffect(() => {
    loadClasses()
  }, [])

  const loadClasses = async () => {
    const data = await getClasses()
    setClasses(data)

    if (data.length > 0) {
      setSelectedClass(data[0].id)
    }
  }

  // ===== LOAD STUDENTS =====
  useEffect(() => {
    if (selectedClass) {
      loadStudents()
    }
  }, [selectedClass])

  const loadStudents = async () => {
    const data = await getStudentsByClass(selectedClass)
    setStudents(data)
  }

  // ===== ADD CLASS =====
  const handleAddClass = async () => {
    if (!newClass.id || !newClass.name) {
      alert("Nhập đầy đủ thông tin!")
      return
    }

    try {
      await addClass(newClass)
      await loadClasses()

      setNewClass({ id: "", name: "", faculty: "" })

      alert("Thêm lớp thành công!")
    } catch (err) {
      console.error(err)
      alert("Lỗi thêm lớp!")
    }
  }

  // ===== DELETE CLASS =====
  const handleDelete = async (id) => {
    if (confirm("Xóa lớp?")) {
      await deleteClass(id)
      await loadClasses()
    }
  }

  // ===== ADD STUDENT =====
  const handleAddStudent = async () => {
    if (!selectedClass) {
      alert("Chọn lớp trước!")
      return
    }

    if (!newStudent.id || !newStudent.name) {
      alert("Nhập đủ thông tin!")
      return
    }

    try {
      // 1. thêm sinh viên (KHÔNG có classId)
      await addStudent({
        id: newStudent.id,
        name: newStudent.name,
        email: newStudent.email
      })

      // 2. gán vào lớp (enrollment)
      await addEnrollment({
        studentId: newStudent.id,
        classId: selectedClass
      })

      await loadStudents()

      setNewStudent({ id: "", name: "", email: "" })

      alert("Thêm thành công")
    } catch (err) {
      console.error(err)
      alert("Lỗi thêm sinh viên")
    }
  }

  const handleUpdateStudent = async () => {
    try {
      await fetch(`http://localhost:5000/students/${newStudent.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: newStudent.name,
          email: newStudent.email
        })
      })

      alert("Cập nhật thành công")

      setEditingStudent(null)
      setNewStudent({ id: "", name: "", email: "" })

      loadStudents()
    } catch (err) {
      console.error(err)
      alert("Lỗi cập nhật")
    }
  }


  return (
    <MainLayout>

      <div className="p-6">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white p-6 rounded-2xl shadow mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            🏫 Quản lý lớp học
          </h1>
          <p className="opacity-90 mt-1">
            Tạo lớp, quản lý sinh viên và tổ chức dữ liệu dễ dàng
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* LEFT */}
          <div className="space-y-6">

             <input
            placeholder="🔍 Tìm lớp theo tên hoặc mã..."
            value={searchClass}
            onChange={(e) => setSearchClass(e.target.value)}
            className="border p-3 rounded-lg w-full mb-3"
          />

            {/* ADD CLASS */}
            <div className="bg-white p-5 rounded-2xl shadow border">
              <div className="flex items-center gap-2 mb-4 font-semibold">
                <FaPlus className="text-blue-500" />
                Thêm lớp học
              </div>

              <div className="space-y-3">
                <input
                  placeholder="Mã lớp"
                  value={newClass.id}
                  onChange={(e) => setNewClass({ ...newClass, id: e.target.value })}
                  className="border p-3 rounded-lg w-full"
                />

                <input
                  placeholder="Tên lớp"
                  value={newClass.name}
                  onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                  className="border p-3 rounded-lg w-full"
                />

                <select
                  value={newClass.faculty}
                  onChange={(e) => setNewClass({ ...newClass, faculty: e.target.value })}
                  className="border p-3 rounded-lg w-full"
                >
                  <option value="">-- Chọn khoa --</option>
                  {faculties.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleAddClass}
                  className="w-full bg-blue-500 text-white p-3 rounded-lg"
                >
                  ➕ Thêm lớp
                </button>
              </div>
            </div>

            {/* CLASS LIST */}
            <div className="bg-white p-5 rounded-2xl shadow border">
              <h2 className="font-semibold mb-4">📋 Danh sách lớp</h2>

              {classes
                .filter((c) =>
                  c.name.toLowerCase().includes(searchClass.toLowerCase()) ||
                  c.id.toLowerCase().includes(searchClass.toLowerCase())
                )
                .map((c) => (
                  <div key={c.id} className="relative mb-3">

                    <div
                      onClick={() => setSelectedClass(c.id)}
                      className={`p-4 rounded-xl cursor-pointer border ${
                        selectedClass === c.id
                          ? "bg-blue-50 border-blue-400"
                          : ""
                      }`}
                    >
                      <div className="flex justify-between">
                        <div>
                          <p>{c.name}</p>
                          <p className="text-sm text-gray-500">{c.id}</p>
                        </div>
                        <FaBook />
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(c.id)}
                      className="absolute top-2 right-2 text-red-500"
                    >
                      <FaTrash />
                    </button>

                  </div>
                ))
              }

            </div>

          </div>

          {/* RIGHT */}
          <div className="lg:col-span-2">
          <input
            placeholder="🔍 Tìm sinh viên theo tên..."
            value={searchStudent}
            onChange={(e)=>setSearchStudent(e.target.value)}
            className="border p-3 rounded-lg w-full mb-4"
          />

            <div className="bg-white p-6 rounded-2xl shadow border">

              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FaUsers />
                Sinh viên lớp {selectedClass}
              </h2>

              {/* FORM */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">

                <input
                  placeholder="Mã SV"
                  value={newStudent.id}
                  onChange={(e)=>setNewStudent({...newStudent,id:e.target.value})}
                  className="border p-3 rounded-lg"
                />

                <input
                  placeholder="Tên SV"
                  value={newStudent.name}
                  onChange={(e)=>setNewStudent({...newStudent,name:e.target.value})}
                  className="border p-3 rounded-lg"
                />

                <input
                  placeholder="Email"
                  value={newStudent.email}
                  onChange={(e)=>setNewStudent({...newStudent,email:e.target.value})}
                  className="border p-3 rounded-lg md:col-span-2"
                />

                <button
                  onClick={editingStudent ? handleUpdateStudent : handleAddStudent}
                  className="md:col-span-2 bg-blue-500 text-white p-3 rounded-lg"
                >
                  {editingStudent ? "✏️ Cập nhật sinh viên" : "➕ Thêm sinh viên"}
                </button>

              </div>

              {/* STUDENT LIST */}
              <div className="space-y-2">

                {students
                  .filter((sv) =>
                    sv.id.toLowerCase().includes(searchStudent.toLowerCase())
                  )
                  .map((sv) => (
                    <div key={sv.id} className="p-3 border rounded-lg flex justify-between relative">

                      {/* INFO */}
                      <div>
                        <p className="font-medium">{sv.name}</p>
                        <p className="text-sm text-gray-500">{sv.email}</p>
                      </div>

                      {/* RIGHT SIDE */}
                      <div className="flex items-center gap-3">

                        <span className="text-sm text-gray-400">{sv.id}</span>

                        {/* 3 CHẤM */}
                        <div className="relative">
                          <button
                            onClick={() => setMenuOpenId(menuOpenId === sv.id ? null : sv.id)}
                            className="text-xl px-2"
                          >
                            ⋮
                          </button>

                          {/* MENU */}
                          {menuOpenId === sv.id && (
                            <div className="absolute right-0 mt-2 bg-white border rounded shadow w-32 z-10">

                              <button
                                onClick={() => {
                                  // EDIT
                                  setEditingStudent(sv)
                                  setNewStudent({
                                    id: sv.id,
                                    name: sv.name,
                                    email: sv.email
                                  })
                                  setMenuOpenId(null)
                                }}
                                className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                              >
                                ✏️ Chỉnh sửa
                              </button>

                              <button
                                onClick={async () => {
                                  if (window.confirm("Xóa sinh viên?")) {
                                    await fetch(`http://localhost:5000/students/${sv.id}`, {
                                      method: "DELETE"
                                    })
                                    loadStudents()
                                  }
                                  setMenuOpenId(null)
                                }}
                                className="block w-full text-left px-3 py-2 text-red-500 hover:bg-gray-100"
                              >
                                🗑 Xóa
                              </button>

                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  ))}

              </div>

            </div>

          </div>

        </div>

      </div>

    </MainLayout>
  )
}
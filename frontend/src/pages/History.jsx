import { useState, useEffect } from "react"
import MainLayout from "../layout/MainLayout"
import { FaSearch, FaSync, FaImage, FaTrash } from "react-icons/fa"
import Swal from "sweetalert2"
import { FaFileExcel } from "react-icons/fa"

export default function AttendanceHistory() {

  const [data, setData] = useState([])
  const [classes, setClasses] = useState([])

  const [search, setSearch] = useState("")
  const [filterClass, setFilterClass] = useState("all")
  const [selectedImage, setSelectedImage] = useState(null)
  const [loading, setLoading] = useState(false)

  // ===== 🚀 LOAD CLASSES =====
  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      const res = await fetch("http://localhost:5001/classes")
      const result = await res.json()
      setClasses(result)
    } catch (err) {
      console.error(err)
    }
  }

  // ===== 🚀 LOAD DATA (DEBOUNCE) =====
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchData()
    }, 500)

    return () => clearTimeout(timeout)
  }, [search, filterClass])

  const fetchData = async () => {
    try {
      setLoading(true)

      const res = await fetch(
        `http://localhost:5001/attendance/history?search=${search}&classId=${filterClass}`
      )

      const result = await res.json()

      // 👉 MAP CHUẨN
      const mapped = result.map(item => ({
        id: item.id,
        mssv: item.student_id || "",
        name: item.student_name || "",
        class: item.class_name || "",
        time: item.time,
        image: item.image
      }))

      setData(mapped)

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // ===== 🗑️ DELETE =====
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Bạn có chắc?",
      text: "Dữ liệu sẽ bị xóa vĩnh viễn!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e3342f",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy"
    })

    if (!result.isConfirmed) return

    try {
      await fetch(`http://localhost:5001/attendance/${id}`, {
        method: "DELETE"
      })

      setData(prev => prev.filter(item => item.id !== id))

      Swal.fire({
        title: "Đã xóa!",
        text: "Bản ghi đã được xóa thành công.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      })

    } catch (err) {
      console.error(err)

      Swal.fire({
        title: "Lỗi!",
        text: "Không thể xóa dữ liệu.",
        icon: "error"
      })
    }
  }

  // ===== 🖼️ IMAGE =====
  const getImageUrl = (path) => {
    if (!path) return "/no-image.png"
    return `http://localhost:5001/history/${path.replace(/^data\/history\//, "")}`
  }

  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    try {
      const res = await fetch(
        `http://localhost:5001/attendance/export?search=${search}&classId=${filterClass}`
      )

      const blob = await res.blob()

      // 🔥 mở hộp thoại lưu file
      const handle = await window.showSaveFilePicker({
        suggestedName: "attendance.xlsx",
        types: [
          {
            description: "Excel file",
            accept: {
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"]
            }
          }
        ]
      })

      const writable = await handle.createWritable()
      await writable.write(blob)
      await writable.close()

      // ✅ THÔNG BÁO THÀNH CÔNG
      Swal.fire({
        icon: "success",
        title: "Xuất file thành công!",
        text: "File đã được lưu vào máy của bạn",
        timer: 2000,
        showConfirmButton: false
      })

    } catch (err) {
      console.error(err)

      // ❌ nếu user bấm cancel thì không báo lỗi
      if (err.name === "AbortError") return

      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Không thể xuất file"
      })    
    }
  }
  return (
    <MainLayout>

      <div className="p-6 space-y-6">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-6 rounded-2xl shadow">
          <h1 className="text-3xl font-bold">📜 Lịch sử điểm danh</h1>
          <p className="opacity-90 mt-1">Quản lý và theo dõi lịch sử điểm danh sinh viên</p>
        </div>

        {/* FILTER */}
        <div className="bg-white p-5 rounded-2xl shadow border grid md:grid-cols-4 gap-4 items-center">

          <div className="relative md:col-span-2">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Tìm theo tên hoặc MSSV..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="p-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
          >
            <option value="all">Tất cả lớp</option>

            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearch("")
              setFilterClass("all")
            }}
            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 p-3 rounded-xl"
          >
            <FaSync /> Reset
          </button>

        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow border overflow-hidden">

          <div className="flex justify-between items-center p-4 border-b">

            <h2 className="font-semibold">📌 Danh sách điểm danh</h2>

            <div className="flex items-center gap-3">

              <span className="text-sm text-gray-500">
                {data.length} bản ghi
              </span>

              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm disabled:opacity-50"
              >
                <FaFileExcel />
                {exporting ? "Đang xuất..." : "Xuất Excel"}
              </button>

            </div>

          </div>

          <table className="w-full text-sm">

            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">MSSV</th>
                <th className="p-3">Họ tên</th>
                <th className="p-3">Lớp</th>
                <th className="p-3">Thời gian</th>
                <th className="p-3">Ảnh</th>
                <th className="p-3">Xóa</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center p-5 text-gray-400">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-5 text-gray-400">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={item.id} className="border-t hover:bg-gray-50 transition">

                    <td className="p-3 font-medium">{index + 1}</td>
                    <td className="p-3">{item.mssv}</td>
                    <td className="p-3 font-semibold">{item.name}</td>

                    <td className="p-3">
                      <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs">
                        {item.class}
                      </span>
                    </td>

                    <td className="p-3 text-gray-500">
                      {item.time ? new Date(item.time).toLocaleString("vi-VN") : ""}
                    </td>

                    <td className="p-3">
                      <img
                        src={getImageUrl(item.image)}
                        alt=""
                        onClick={() => item.image && setSelectedImage(getImageUrl(item.image))}
                        className="w-12 h-12 object-cover rounded-lg cursor-pointer hover:scale-110 transition"
                      />
                    </td>

                    <td className="p-3">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
            

          </table>

        </div>

        {/* MODAL IMAGE */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-2xl shadow-xl max-w-md w-full">

              <h2 className="font-semibold mb-3">🖼️ Ảnh điểm danh</h2>

              <img
                src={selectedImage}
                className="w-full rounded-xl"
              />

              <button
                onClick={() => setSelectedImage(null)}
                className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg"
              >
                Đóng
              </button>

            </div>
          </div>
        )}

      </div>

    </MainLayout>
  )
}
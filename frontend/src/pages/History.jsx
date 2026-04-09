import { useState } from "react"
import MainLayout from "../layout/MainLayout"
import { FaSearch, FaSync, FaImage, FaTrash } from "react-icons/fa"

export default function AttendanceHistory() {

  const [data] = useState([
    {
      id: 1,
      mssv: "23IT.B152",
      name: "Phạm Minh Nhật",
      class: "LTCB",
      time: "2026-03-02 17:19:05",
      image: "https://via.placeholder.com/120"
    },
    {
      id: 2,
      mssv: "23IT.B152",
      name: "Phạm Minh Nhật",
      class: "LTCB",
      time: "2026-02-02 09:39:36",
      image: "https://via.placeholder.com/120"
    }
  ])

  const [search, setSearch] = useState("")
  const [filterClass, setFilterClass] = useState("all")
  const [selectedImage, setSelectedImage] = useState(null)

  const filteredData = data.filter(item => {
    return (
      (item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.mssv.toLowerCase().includes(search.toLowerCase())) &&
      (filterClass === "all" || item.class === filterClass)
    )
  })

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
            <option value="LTCB">LTCB</option>
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
            <span className="text-sm text-gray-500">{filteredData.length} bản ghi</span>
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
              {filteredData.map((item, index) => (
                <tr key={item.id} className="border-t hover:bg-gray-50 transition">

                  <td className="p-3 font-medium">{index + 1}</td>
                  <td className="p-3">{item.mssv}</td>
                  <td className="p-3 font-semibold">{item.name}</td>

                  <td className="p-3">
                    <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs">
                      {item.class}
                    </span>
                  </td>

                  <td className="p-3 text-gray-500">{item.time}</td>

                  <td className="p-3">
                    <img
                      src={item.image}
                      alt=""
                      onClick={() => setSelectedImage(item.image)}
                      className="w-12 h-12 object-cover rounded-lg cursor-pointer hover:scale-110 transition"
                    />
                  </td>

                  <td className="p-3">
                    <button className="text-red-500 hover:text-red-700">
                      <FaTrash />
                    </button>
                  </td>

                </tr>
              ))}
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

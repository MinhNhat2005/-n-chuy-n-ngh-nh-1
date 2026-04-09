import MainLayout from "../layout/MainLayout"
import { FaUserGraduate, FaCamera, FaChartBar } from "react-icons/fa"
import { useNavigate } from "react-router-dom"

export default function Dashboard() {

  const navigate = useNavigate()

  return (
    <MainLayout>

      <div className="p-6">

        {/* HERO */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-10 rounded-2xl shadow mb-8 text-center">

          <h1 className="text-3xl font-bold mb-2">
            🎉 Dashboard Face Attendance
          </h1>

          <p className="text-lg opacity-90">
            👋 Chào mừng Admin quay trở lại! Chúc bạn một ngày làm việc hiệu quả 🚀
          </p>

        </div>

        {/* FEATURES */}
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          📌 Chức năng hệ thống
        </h2>

        <div className="grid md:grid-cols-3 gap-6">

          {/* STUDENTS */}
          <div
            onClick={() => navigate("/students")}
            className="bg-white p-6 rounded-xl shadow border cursor-pointer hover:shadow-lg transition"
          >
            <FaUserGraduate className="text-3xl text-blue-500 mb-3" />
            <h3 className="text-xl font-semibold text-blue-600">
              Quản lý sinh viên
            </h3>
            <p className="text-gray-500 mt-2 text-sm">
              Thêm, sửa, xóa và quản lý danh sách sinh viên.
            </p>
          </div>

          {/* ATTENDANCE */}
          <div
            onClick={() => navigate("/attendance")}
            className="bg-white p-6 rounded-xl shadow border cursor-pointer hover:shadow-lg transition"
          >
            <FaCamera className="text-3xl text-purple-500 mb-3" />
            <h3 className="text-xl font-semibold text-purple-600">
              Điểm danh khuôn mặt
            </h3>
            <p className="text-gray-500 mt-2 text-sm">
              Điểm danh tự động bằng AI nhận diện khuôn mặt.
            </p>
          </div>

          {/* REPORT */}
          <div
            onClick={() => navigate("/statistics")}
            className="bg-white p-6 rounded-xl shadow border cursor-pointer hover:shadow-lg transition"
          >
            <FaChartBar className="text-3xl text-green-500 mb-3" />
            <h3 className="text-xl font-semibold text-green-600">
              Thống kê dữ liệu
            </h3>
            <p className="text-gray-500 mt-2 text-sm">
              Xem báo cáo và thống kê điểm danh theo ngày.
            </p>
          </div>

        </div>

      </div>

    </MainLayout>
  )
}
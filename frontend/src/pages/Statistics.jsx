import MainLayout from "../layout/MainLayout"
import { FaUsers, FaBook, FaCheckSquare, FaChartBar } from "react-icons/fa"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts"

export default function Dashboard() {

  // DATA GIẢ
  const data = [
    { name: "T2", attendance: 5 },
    { name: "T3", attendance: 8 },
    { name: "T4", attendance: 6 },
    { name: "T5", attendance: 10 },
    { name: "T6", attendance: 7 },
    { name: "T7", attendance: 4 },
  ]

  return (
    <MainLayout>
      <div className="p-6">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-2xl shadow mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FaChartBar />
            Thống kê dữ liệu
          </h1>
          <p className="opacity-90 mt-1">
            Tổng quan hệ thống điểm danh khuôn mặt
          </p>
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">

          {/* CARD 1 */}
          <div className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Tổng sinh viên</p>
                <h2 className="text-3xl font-bold mt-1">21</h2>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FaUsers className="text-blue-500 text-xl" />
              </div>
            </div>
          </div>

          {/* CARD 2 */}
          <div className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Số lớp học</p>
                <h2 className="text-3xl font-bold mt-1">2</h2>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FaBook className="text-purple-500 text-xl" />
              </div>
            </div>
          </div>

          {/* CARD 3 */}
          <div className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Lượt điểm danh</p>
                <h2 className="text-3xl font-bold mt-1">4</h2>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FaCheckSquare className="text-green-500 text-xl" />
              </div>
            </div>
          </div>

        </div>

        {/* CHART */}
        <div className="bg-white p-6 rounded-2xl shadow border">

          <h2 className="text-lg font-semibold mb-4">
            📊 Thống kê điểm danh theo tuần
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="attendance" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

        </div>

      </div>
    </MainLayout>
  )
}
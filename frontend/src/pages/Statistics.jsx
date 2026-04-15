import { useEffect, useState } from "react"
import MainLayout from "../layout/MainLayout"
import { FaUsers, FaBook, FaCheckSquare, FaChartBar } from "react-icons/fa"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts"

export default function Statistics() {

  const [stats, setStats] = useState({
    total_students: 0,
    total_classes: 0,
    total_attendance: 0,
    chart: []
  })

  const [loading, setLoading] = useState(true)

  // 🚀 LOAD DATA
  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:5001/attendance/stats")
      const data = await res.json()

      // 👉 build chart tại đây
      const chartData = buildChartData(data.chart || [])

      setStats({
        ...data,
        chart: chartData
      })

    } catch (err) {
      console.error("Lỗi load stats:", err)
    } finally {
      setLoading(false)
    }
  }

  const getCurrentWeek = () => {
    const today = new Date()

    const day = today.getDay() // 0 (CN) → 6 (T7)
    const diff = day === 0 ? -6 : 1 - day // đưa về Thứ 2

    const monday = new Date(today)
    monday.setDate(today.getDate() + diff)

    const week = []

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)

      week.push({
        date: d.toISOString().split("T")[0], // yyyy-mm-dd
        name: `T${i + 2}`, // T2 → CN
        attendance: 0
      })
    }

    // sửa lại CN
    week[6].name = "CN"

    return week
  }

  const buildChartData = (apiData) => {
    const week = getCurrentWeek()

    return week.map(day => {
      const found = apiData.find(item => item.date === day.date)

      return {
        ...day,
        attendance: found ? found.count : 0
      }
    })
  }



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

        {/* LOADING */}
        {loading ? (
          <div className="text-center text-gray-400">Đang tải dữ liệu...</div>
        ) : (
          <>
            {/* STATS */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">

              {/* CARD 1 */}
              <div className="bg-white p-5 rounded-2xl shadow border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Tổng sinh viên</p>
                    <h2 className="text-3xl font-bold mt-1">
                      {stats.total_students}
                    </h2>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FaUsers className="text-blue-500 text-xl" />
                  </div>
                </div>
              </div>

              {/* CARD 2 */}
              <div className="bg-white p-5 rounded-2xl shadow border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Số lớp học</p>
                    <h2 className="text-3xl font-bold mt-1">
                      {stats.total_classes}
                    </h2>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <FaBook className="text-purple-500 text-xl" />
                  </div>
                </div>
              </div>

              {/* CARD 3 */}
              <div className="bg-white p-5 rounded-2xl shadow border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Lượt điểm danh</p>
                    <h2 className="text-3xl font-bold mt-1">
                      {stats.total_attendance}
                    </h2>
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
                📊 Thống kê điểm danh 7 ngày gần nhất
              </h2>

              {stats.chart.length === 0 ? (
                <div className="text-gray-400 text-center">
                  Chưa có dữ liệu
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.chart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="attendance" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}

            </div>
          </>
        )}

      </div>
    </MainLayout>
  )
}
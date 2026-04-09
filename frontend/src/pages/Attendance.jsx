import { useState } from "react";
import MainLayout from "../layout/MainLayout";
import { FaCamera, FaPlay, FaStop, FaWifi } from "react-icons/fa";

export default function Attendance() {
  const [isRunning, setIsRunning] = useState(false);

  return (
    <MainLayout>
      <div className="p-6 space-y-6">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white p-6 rounded-2xl shadow">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FaCamera /> Hệ thống Điểm danh AI
          </h1>
          <p className="opacity-90 mt-1">Nhận diện khuôn mặt và ghi nhận điểm danh tự động</p>
        </div>

        {/* CONTROL PANEL */}
        <div className="bg-white p-6 rounded-2xl shadow border grid md:grid-cols-3 gap-6 items-end">

          {/* CHỌN LỚP */}
          <div>
            <label className="block text-sm mb-2 font-medium">
              🎯 Chọn lớp
            </label>
            <select className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400">
              <option>LTCB</option>
              <option>PT&TKGT</option>
            </select>
          </div>

          {/* CAMERA TYPE */}
          <div>
            <label className="block text-sm mb-2 font-medium">
              📷 Nguồn Camera
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg cursor-pointer">
                <input type="radio" name="camera" defaultChecked /> Webcam
              </label>
              <label className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg cursor-pointer">
                <input type="radio" name="camera" /> IP Camera
              </label>
            </div>
          </div>

          {/* BUTTON */}
          <div className="flex gap-3">
            {!isRunning ? (
              <button
                onClick={() => setIsRunning(true)}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white p-3 rounded-xl flex items-center justify-center gap-2"
              >
                <FaPlay /> Bắt đầu
              </button>
            ) : (
              <button
                onClick={() => setIsRunning(false)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white p-3 rounded-xl flex items-center justify-center gap-2"
              >
                <FaStop /> Dừng
              </button>
            )}
          </div>

        </div>

        {/* MAIN CONTENT */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* CAMERA */}
          <div className="md:col-span-2 bg-black rounded-2xl overflow-hidden shadow relative">

            {/* STATUS */}
            <div className="absolute top-3 left-3 bg-black/60 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-2">
              <FaWifi className="text-green-400" />
              {isRunning ? "Đang hoạt động" : "Chưa bật"}
            </div>

            <div className="h-[420px] flex items-center justify-center text-gray-400">
              Camera Stream
            </div>
          </div>

          {/* LIST */}
          <div className="bg-white p-5 rounded-2xl shadow border">
            <h3 className="font-semibold mb-4 flex justify-between">
              📝 Danh sách vừa quét
              <span className="text-sm text-gray-400">1 bản ghi</span>
            </h3>

            <div className="max-h-[380px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 sticky top-0">
                  <tr>
                    <th className="p-2">ID</th>
                    <th className="p-2">Tên</th>
                    <th className="p-2">Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t hover:bg-gray-50">
                    <td className="p-2 font-medium">SV001</td>
                    <td className="p-2">Nguyễn Văn A</td>
                    <td className="p-2 text-gray-500">08:21</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

        </div>

      </div>
    </MainLayout>
  );
}

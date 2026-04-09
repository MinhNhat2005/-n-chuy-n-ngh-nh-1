import { useState } from "react";
import MainLayout from "../layout/MainLayout";
import { FaCog, FaRocket, FaCheckCircle, FaBrain, FaDatabase } from "react-icons/fa";

export default function TrainModel() {

  const [status, setStatus] = useState("idle"); // idle | training | done
  const [progress, setProgress] = useState(0);

  const handleTrain = () => {
    setStatus("training");
    setProgress(0);

    let percent = 0;

    const interval = setInterval(() => {
      percent += 10;
      setProgress(percent);

      if (percent >= 100) {
        clearInterval(interval);
        setStatus("done");
      }
    }, 400);
  };

  return (
    <MainLayout>

      <div className="p-6 space-y-6">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-6 rounded-2xl shadow">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FaBrain /> Huấn luyện AI Model
          </h1>
          <p className="opacity-90 mt-1">Cập nhật và tối ưu mô hình nhận diện khuôn mặt</p>
        </div>

        {/* NOTE */}
        <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-2xl">
          💡 Nên huấn luyện lại khi thêm sinh viên hoặc cập nhật dữ liệu ảnh.
        </div>

        <div className="grid md:grid-cols-3 gap-6">

          {/* LEFT - CONTROL */}
          <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow border">

            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <FaCog /> Trạng thái huấn luyện
            </h2>

            {/* PROGRESS BAR */}
            <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden mb-4">
              <div
                className="bg-gradient-to-r from-green-400 to-blue-500 h-5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* STATUS TEXT */}
            <p className="mb-4 text-sm text-gray-600">
              {status === "idle" && "Chưa huấn luyện"}
              {status === "training" && `Đang huấn luyện... (${progress}%)`}
              {status === "done" && "✅ Hoàn tất huấn luyện"}
            </p>

            {/* BUTTON */}
            <button
              onClick={handleTrain}
              disabled={status === "training"}
              className={`w-full p-3 rounded-xl text-white flex items-center justify-center gap-2 transition ${{
                true: ""
              } && (status === "training"
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-500 hover:bg-indigo-600")}`}
            >
              <FaRocket />
              {status === "training" ? "Đang huấn luyện..." : "Bắt đầu huấn luyện"}
            </button>

          </div>

          {/* RIGHT - INFO */}
          <div className="bg-white p-6 rounded-2xl shadow border space-y-4">

            <h2 className="font-semibold flex items-center gap-2">
              <FaDatabase /> Thông tin mô hình
            </h2>

            <div className="text-sm space-y-3">
              <div className="flex justify-between">
                <span>Thuật toán</span>
                <span className="font-medium">Facenet</span>
              </div>

              <div className="flex justify-between">
                <span>Cơ chế</span>
                <span className="font-medium">Embedding Vector</span>
              </div>

              <div className="flex justify-between">
                <span>Output</span>
                <span className="font-medium">.pkl</span>
              </div>

              <div className="flex justify-between">
                <span>Dữ liệu</span>
                <span className="font-medium">data/students</span>
              </div>
            </div>

          </div>

        </div>

        {/* DONE ALERT */}
        {status === "done" && (
          <div className="p-5 bg-green-50 border border-green-200 text-green-700 rounded-2xl flex items-center gap-3 shadow">
            <FaCheckCircle className="text-xl" />
            <div>
              <p className="font-semibold">Huấn luyện thành công</p>
              <p className="text-sm">Mô hình đã sẵn sàng để nhận diện khuôn mặt</p>
            </div>
          </div>
        )}

      </div>

    </MainLayout>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { FaBars } from "react-icons/fa";

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  // state thời gian
  const [time, setTime] = useState(new Date());

  // kiểm tra token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, []);

  // cập nhật thời gian mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex">

      {/* SIDEBAR */}
      <Sidebar collapsed={collapsed} />

      {/* CONTENT AREA */}
      <div
        className={`flex-1 bg-gray-100 min-h-screen flex flex-col mt-16 transition-all
        ${collapsed ? "ml-20" : "ml-64"}`}
      >

        {/* HEADER */}
        <div
          className={`bg-white/80 backdrop-blur-md border-b h-16 flex items-center px-6 fixed top-0 right-0 z-50 transition-all
          ${collapsed ? "left-20" : "left-64"}`}
        >
          {/* LEFT */}
         <div className="-ml-2 mr-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="bg-white p-3 rounded-lg text-xl shadow hover:bg-gray-200 transition"
          >
            <FaBars />
          </button>
        </div>

          {/* CENTER */}
          <h1 className="flex-1 text-center text-2xl md:text-3xl font-extrabold text-gray-800">
            HỆ THỐNG ĐIỂM DANH BẰNG NHẬN DIỆN KHUÔN MẶT
          </h1>

          {/* RIGHT */}
          <div className="text-right">
            <p className="font-extrabold">
              {time.toLocaleTimeString("vi-VN")}
            </p>
            <p className="text-sm text-gray-500">
              {time.toLocaleDateString("vi-VN")}
            </p>
          </div>
        </div>

        {/* CONTENT + FOOTER */}
        <div className="flex flex-col flex-1">

          {/* PAGE CONTENT */}
          <div className="p-6 flex-1">
            {children}
          </div>

          {/* FOOTER */}
          <div className="bg-white border-t text-center py-3 text-sm text-gray-500 shadow-inner">
            © 2026 Hệ thống điểm danh AI • Developed by Phạm Minh Nhật 😎
          </div>

        </div>

      </div>

    </div>
  );
}
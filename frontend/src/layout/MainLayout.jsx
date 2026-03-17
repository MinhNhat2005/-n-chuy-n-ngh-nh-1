import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import { FaBars } from "react-icons/fa"

export default function MainLayout({ children }) {

  const navigate = useNavigate()
  const [collapsed,setCollapsed] = useState(false)

  // kiểm tra token
  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) {
      navigate("/login")
    }
  }, [])

  return (

    <div className="flex">

      <Sidebar collapsed={collapsed}/>

      {/* CONTENT AREA */}
      <div className="flex-1 bg-gray-100 min-h-screen flex flex-col">

        {/* HEADER */}
       <div className="bg-gray-100 h-16 flex items-center justify-center px-6 shadow relative">

        {/* Nút toggle sidebar */}
        <button
        onClick={()=>setCollapsed(!collapsed)}
        className="absolute left-6 bg-white p-3 rounded-lg text-xl shadow hover:bg-gray-200 transition"
        >
        <FaBars/>
        </button>

        {/* Tiêu đề */}
        <h1 className="text-2xl font-semibold text-gray-800 text-center">
        Hệ thống điểm danh bằng nhận diện khuôn mặt
        </h1>

        </div>

        {/* PAGE CONTENT */}
        <div className="p-6">

          {children}

        </div>

      </div>

    </div>

  ) 
}
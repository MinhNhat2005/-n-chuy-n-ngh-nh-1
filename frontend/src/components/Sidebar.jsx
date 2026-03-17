import { useState } from "react"
import { NavLink } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import {
FaHome,
FaUsers,
FaChalkboardTeacher,
FaHistory,
FaCamera,
FaBrain,
FaChartBar,
FaSignOutAlt,
FaBars
} from "react-icons/fa"

export default function Sidebar({ collapsed }){


const navigate = useNavigate()

const logout = () => {

  Swal.fire({
    title: "Xác nhận đăng xuất",
    text: "Bạn có chắc chắn muốn đăng xuất không?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#2563eb",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Đăng xuất",
    cancelButtonText: "Huỷ",
    reverseButtons: true
  }).then((result) => {

    if (result.isConfirmed) {
      localStorage.removeItem("token")
      navigate("/login")

      Swal.fire({
        title: "Đã đăng xuất!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      })
    }

  })

}

const menuClass = ({isActive}) =>
`flex items-center ${collapsed ? "justify-center" : "gap-4"} 
p-4 rounded-xl transition text-lg
${isActive
? "bg-white text-blue-700 font-semibold"
: "text-white hover:bg-blue-500"}`

return(

<div className={`relative bg-blue-600 text-white min-h-screen transition-all duration-300 ${collapsed ? "w-[86px]" : "w-[255px]"} p-4`}>

{/* HEADER */}

<div className="flex items-center mb-10">

{!collapsed && (
<h2 className="text-2xl font-bold flex items-center gap-3">
<FaCamera className="text-2xl"/>
Face Attendance
</h2>
)}

</div>


<nav className="flex flex-col gap-4">

<NavLink to="/" className={menuClass}>
<FaHome className={`${collapsed ? "text-3xl" : "text-2xl"}`}/>
{!collapsed && "Trang chủ"}
</NavLink>

<NavLink to="/classes" className={menuClass}>
<FaChalkboardTeacher className={`${collapsed ? "text-3xl" : "text-2xl"}`}/>
{!collapsed && "Quản lý lớp học"}
</NavLink>

<NavLink to="/students" className={menuClass}>
<FaUsers className={`${collapsed ? "text-3xl" : "text-2xl"}`}/>
{!collapsed && "Quản lý sinh viên"}
</NavLink>

<NavLink to="/history" className={menuClass}>
<FaHistory className={`${collapsed ? "text-3xl" : "text-2xl"}`}/>
{!collapsed && "Lịch sử điểm danh"}
</NavLink>

<NavLink to="/attendance" className={menuClass}>
<FaCamera className={`${collapsed ? "text-3xl" : "text-2xl"}`}/>
{!collapsed && "Điểm danh camera"}
</NavLink>

<NavLink to="/training" className={menuClass}>
<FaBrain className={`${collapsed ? "text-3xl" : "text-2xl"}`}/>
{!collapsed && "Huấn luyện AI"}
</NavLink>

<NavLink to="/statistics" className={menuClass}>
<FaChartBar className={`${collapsed ? "text-3xl" : "text-2xl"}`}/>
{!collapsed && "Thống kê"}
</NavLink>

<hr className="border-blue-400 my-4"/>

<div
  onClick={logout}
  className="flex items-center gap-4 p-4 rounded-xl cursor-pointer text-white hover:bg-blue-500"
>
  <FaSignOutAlt className="text-2xl"/>
  {!collapsed && "Đăng xuất"}
</div>

</nav>

</div>

)

}
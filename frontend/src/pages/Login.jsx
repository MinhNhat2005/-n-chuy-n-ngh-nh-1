import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa"
import Swal from "sweetalert2"

export default function Login(){

const navigate = useNavigate()

const [username,setUsername] = useState("")
const [password,setPassword] = useState("")

const [showPassword,setShowPassword] = useState(false)
const [loading,setLoading] = useState(false)

const handleLogin = (e) => {
  e.preventDefault()

  setLoading(true)

  setTimeout(() => {

    if (username === "admin" && password === "123456") {

      Swal.fire({
        title: "Đăng nhập thành công!",
        text: "Chào mừng bạn quay lại hệ thống",
        icon: "success",
        confirmButtonColor: "#2563eb",
        confirmButtonText: "Vào hệ thống"
      }).then(() => {

        localStorage.setItem("token", "admin")
        navigate("/")

      })

    } else {

      Swal.fire({
        title: "Đăng nhập thất bại",
        text: "Sai tài khoản hoặc mật khẩu",
        icon: "error",
        confirmButtonColor: "#2563eb",
        confirmButtonText: "Thử lại"
      })

    }

    setLoading(false)

  },1000)

}

return(

<div className="min-h-screen bg-gray-200 p-[50px]">

<div className="w-full h-[calc(100vh-100px)] bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden">

{/* LEFT PANEL */}

<div className="md:w-1/2 bg-gradient-to-b from-blue-600 to-cyan-500 text-white flex flex-col items-center justify-center p-10">

<h1 className="text-2xl md:text-3xl font-bold text-center mb-6 leading-snug">
HỆ THỐNG ĐIỂM DANH SINH VIÊN <br/>
BẰNG NHẬN DIỆN KHUÔN MẶT
</h1>

<img
src="https://cdn-icons-png.flaticon.com/512/3135/3135755.png"
className="w-40 md:w-52 mb-10"
/>

<div className="flex gap-6">

<div className="bg-white/20 p-6 rounded-xl text-center w-32">
🏠
<p className="mt-2 text-sm">Quản lý sinh viên</p>
</div>

<div className="bg-white/20 p-6 rounded-xl text-center w-32">
📋
<p className="mt-2 text-sm">Quản lý lớp học</p>
</div>

<div className="bg-white/20 p-6 rounded-xl text-center w-32">
🔔
<p className="mt-2 text-sm">Thông báo</p>
</div>

</div>

</div>

{/* RIGHT PANEL */}

<div className="md:w-1/2 flex items-center justify-center p-12 bg-gray-50">

<div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-200 p-12">

<div className="text-center mb-8">

<div className="text-blue-600 text-4xl mb-3">📘</div>

<h2 className="text-2xl font-bold text-gray-700">
DormManager
</h2>

<p className="text-blue-600 font-semibold mt-2 text-lg">
Đăng nhập Quản trị viên
</p>

</div>

<form onSubmit={handleLogin} className="space-y-6">

{/* USERNAME */}

<div className="relative">

<input
type="text"
placeholder="Nhập tên đăng nhập"
className="w-full border border-gray-300 rounded-xl p-4 pl-12 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
value={username}
onChange={(e)=>setUsername(e.target.value)}
/>

<FaUser className="absolute left-4 top-5 text-gray-400"/>

</div>

{/* PASSWORD */}

<div className="relative">

<input
type={showPassword ? "text" : "password"}
placeholder="Nhập mật khẩu"
className="w-full border border-gray-300 rounded-xl p-4 pl-12 pr-12 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
value={password}
onChange={(e)=>setPassword(e.target.value)}
/>

<FaLock className="absolute left-4 top-5 text-gray-400"/>

<button
type="button"
onClick={()=>setShowPassword(!showPassword)}
className="absolute right-4 top-5 text-gray-400"
>
{showPassword ? <FaEyeSlash/> : <FaEye/>}
</button>

</div>


<div className="flex justify-between text-sm text-gray-500">

<label className="flex items-center gap-2">
<input type="checkbox"/>
Ghi nhớ đăng nhập
</label>

<span className="text-blue-500 cursor-pointer hover:underline">
Quên mật khẩu?
</span>

</div>

<button
disabled={loading}
className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-4 rounded-xl font-semibold text-lg hover:scale-[1.02] transition"
>
{loading ? "Đang đăng nhập..." : "Đăng nhập"}
</button>

</form>

</div>

</div>

</div>

</div>

)

}
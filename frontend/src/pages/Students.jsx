import { useState, useEffect, useRef } from "react"
import MainLayout from "../layout/MainLayout"
import {
  FaUserFriends, FaSave, FaTrash
} from "react-icons/fa"

import {
  getAllStudents,
  addStudent,
  deleteStudent,
  updateStudent
} from "../services/studentService"

export default function Students() {

  // ===== CAMERA =====
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [capturedImages, setCapturedImages] = useState([])
  const [isCameraOn, setIsCameraOn] = useState(false)

  // ===== STATE =====
  const [activeTab, setActiveTab] = useState("list")
  const [openId, setOpenId] = useState(null)
  const [editData, setEditData] = useState({})
  const [students, setStudents] = useState([])

  const [selectedClass, setSelectedClass] = useState("")

  const [form, setForm] = useState({
    id: "",
    name: "",
    email: "",
    classId: ""
  })

  // 👉 NEW
  const [uploadType, setUploadType] = useState("camera")
  const [cameraSource, setCameraSource] = useState("webcam")
  const [uploadedFiles, setUploadedFiles] = useState([])

  // ===== REMOVE IMAGE =====
  const removeCapturedImage = (index) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeUploadedImage = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // ===== LOAD DATA =====
  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      const data = await getAllStudents()
      console.log("DATA FE:", data)   // 👈 QUAN TRỌNG

      setStudents(data || [])
    } catch {
      alert("Lỗi load dữ liệu")
    }
  }

  // ===== CAMERA =====
  const toggleCamera = async () => {
    if (isCameraOn) {
      // tắt camera
      stream?.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
      setStream(null)
      setIsCameraOn(false)
    } else {
      // mở camera
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setIsCameraOn(true)
      } catch {
        alert("Không mở được camera")
      }
    }
  }

  const captureImage = () => {
    const canvas = canvasRef.current
    const video = videoRef.current

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    ctx.drawImage(video, 0, 0)

    const imageData = canvas.toDataURL("image/png")
    setCapturedImages(prev => [...prev, imageData])
  }

  const dataURLtoBlob = (dataurl) => {
    const arr = dataurl.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }

    return new Blob([u8arr], { type: mime })
  }

  const uploadImages = async (studentId) => {
    if (!studentId) {
      alert("Nhập mã SV trước!")
      return
    }

    const formData = new FormData()

    // camera images
    capturedImages.forEach((img, index) => {
      const blob = dataURLtoBlob(img)
      formData.append("images", blob, `image_${index}.png`)
    })

    // upload file images
    uploadedFiles.forEach((file) => {
      formData.append("images", file)
    })

    try {
      await fetch("http://localhost:5000/upload-images/" + studentId, {
        method: "POST",
        body: formData
      })

      alert("Upload thành công!")
      setCapturedImages([])
      setUploadedFiles([])
    } catch {
      alert("Upload lỗi")
    }
  }

  // ===== ADD =====
  const handleRegister = async () => {
    if (!form.id || !form.name || !form.email) {
      alert("Nhập đầy đủ thông tin!")
      return
    }

    try {
      await addStudent({
        id: form.id,
        name: form.name,
        email: form.email,
        classId: form.classId
      })
      await uploadImages(form.id)

      alert("Đăng ký thành công!")

      setForm({
        id: "",
        name: "",
        email: "",
        classId: "LTCB"
      })

      setCapturedImages([])
      setUploadedFiles([])

      loadStudents()
      setActiveTab("list")

    } catch {
      alert("Lỗi thêm sinh viên")
    }
  }

  // ===== DELETE =====
  const handleDelete = async (id) => {
    if (!window.confirm("Xóa sinh viên?")) return
    await deleteStudent(id)
    loadStudents()
  }

  // ===== UPDATE =====
  const handleSave = async () => {
    await updateStudent(editData.id, editData)
    alert("Cập nhật thành công!")
    loadStudents()
  }

  return (
    <MainLayout>
      <div className="p-6">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-2xl shadow mb-6">
  
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FaUserFriends />
            Quản lý sinh viên & dữ liệu khuôn mặt
          </h1>

          <p className="opacity-90 mt-1">
            Thêm, chỉnh sửa và quản lý thông tin sinh viên cùng dữ liệu nhận diện khuôn mặt
          </p>

        </div>

        {/* TAB */}
        <div className="flex gap-4 mb-6">
          <button onClick={() => setActiveTab("list")}
            className={`px-5 py-2 rounded-lg ${activeTab === "list" ? "bg-purple-500 text-white" : "bg-white border"}`}>
            📋 Danh sách sinh viên
          </button>

          <button onClick={() => setActiveTab("add")}
            className={`px-5 py-2 rounded-lg ${activeTab === "add" ? "bg-purple-500 text-white" : "bg-white border"}`}>
            ➕ Đăng ký mới
          </button>
        </div>

        {/* ================= LIST ================= */}
        {activeTab === "list" && (
          <div className="space-y-4">
            {students.map((sv) => {
              const isOpen = openId === sv.id

              return (
                <div key={sv.id} className="bg-white rounded-2xl shadow border">

                  <div
                    onClick={() => {
                      setOpenId(isOpen ? null : sv.id)
                      setEditData(sv)
                    }}
                    className="flex justify-between items-center p-4 cursor-pointer"
                  >
                    <div>
                      <p className="font-semibold">{sv.name}</p>
                      <p className="text-sm text-gray-500">
                        {sv.id} • {sv.images || 0} ảnh
                      </p>
                    </div>
                    <span className="text-xs bg-gray-100 px-3 py-1 rounded">
                      {sv.class_id || "chưa có lớp"}
                    </span>
                  </div>  

                  {isOpen && (
                    <div className="border-t bg-gray-50 p-6 space-y-6">

                      {/* ===== THÔNG TIN SINH VIÊN ===== */}
                      <div className="bg-white rounded-xl border p-4">
                        <p className="font-semibold text-gray-800">
                          {sv.id} - {sv.name} ({sv.images || 0} ảnh)
                        </p>

                        <div className="mt-3 space-y-2 text-sm text-gray-600">

                          <p>
                            📁 <span className="font-medium">Lớp:</span> {sv.class_id || "LTCB"}
                          </p>

                          <p>
                            📧 <span className="font-medium">Email:</span> {sv.email}
                          </p>

                          <p>
                            📍 <span className="font-medium">Thư mục:</span> data/students/{sv.id}
                          </p>

                        </div>
                      </div>

                      {/* ===== SỬA THÔNG TIN ===== */}
                      <div className="bg-white rounded-xl border p-5">

                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          ✏️ Sửa thông tin
                        </h3>

                        {/* GRID INPUT */}
                        <div className="grid grid-cols-2 gap-4">

                          {/* HỌ TÊN */}
                          <div>
                            <label className="text-sm text-gray-600">Họ tên mới</label>
                            <input
                              value={editData.name || ""}
                              onChange={(e) =>
                                setEditData({ ...editData, name: e.target.value })
                              }
                              className="border rounded-lg p-2 w-full mt-1 bg-gray-50"
                            />
                          </div>

                          {/* LỚP */}
                          <div>
                            <label className="text-sm text-gray-600">Lớp mới</label>
                            <select
                              value={editData.class_id || ""}
                              onChange={(e) =>
                                setEditData({ ...editData, class_id: e.target.value })
                              }
                              className="border rounded-lg p-2 w-full mt-1 bg-gray-50"
                            >
                              <option value="LTCB">LTCB</option>
                              <option value="KTPM">KTPM</option>
                              <option value="HTTT">HTTT</option>
                            </select>
                          </div>

                        </div>

                        {/* EMAIL */}
                        <div className="mt-4">
                          <label className="text-sm text-gray-600">Email mới</label>
                          <input
                            value={editData.email || ""}
                            onChange={(e) =>
                              setEditData({ ...editData, email: e.target.value })
                            }
                            className="border rounded-lg p-2 w-full mt-1 bg-gray-50"
                          />
                        </div>

                        {/* BUTTON */}
                        <div className="flex gap-3 mt-6">

                          <button
                            onClick={handleSave}
                            className="flex-1 border rounded-lg py-2 flex items-center justify-center gap-2 hover:bg-gray-100"
                          >
                            💾 Lưu
                          </button>

                          <button
                            className="flex-1 border rounded-lg py-2 flex items-center justify-center gap-2 hover:bg-gray-100"
                          >
                            ➕ Thêm ảnh
                          </button>

                          <button
                            onClick={() => handleDelete(sv.id)}
                            className="flex-1 border rounded-lg py-2 flex items-center justify-center gap-2 hover:bg-red-50 text-red-600"
                          >
                            🗑 Xóa
                          </button>

                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ================= ADD ================= */}
        {activeTab === "add" && (
          <div className="bg-white p-6 rounded shadow">

            {/* FORM */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <input placeholder="Mã SV"
                value={form.id}
                onChange={(e) => setForm({ ...form, id: e.target.value })}
                className="border p-2" />

              <input placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="border p-2" />

              <input placeholder="Họ tên"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border p-2" />

              <select
                className="border p-2"
                value={form.classId}
                onChange={(e) => setForm({ ...form, classId: e.target.value })}
              >
                <option value="LTCB">LTCB</option>
                <option value="JV">JV</option>
              </select>
            </div>

            {/* ===== UI GIỐNG HÌNH ===== */}
           <div className="mb-5">

            <p className="font-semibold mb-3">Chọn phương thức thêm ảnh:</p>

            <div className="flex gap-3 w-full max-w-md">

              <div
                onClick={() => setUploadType("camera")}
                className={`flex-1 px-4 py-2 text-center rounded-lg border cursor-pointer transition text-sm
                  ${uploadType === "camera"
                    ? "border-purple-500 bg-purple-50"
                    : "hover:border-gray-400"
                  }`}
              >
                📷 Chụp trực tiếp
              </div>

              <div
                onClick={() => setUploadType("upload")}
                className={`flex-1 px-4 py-2 text-center rounded-lg border cursor-pointer transition text-sm
                  ${uploadType === "upload"
                    ? "border-purple-500 bg-purple-50"
                    : "hover:border-gray-400"
                  }`}
              >
                📁 Tải ảnh
              </div>

            </div>
          </div>

              {uploadType === "camera" && (
                <div className="mb-4">

                  <p className="font-semibold mb-3">Nguồn Camera:</p>

              <div className="flex gap-3 w-full max-w-md">

                <div
                  onClick={() => setCameraSource("webcam")}
                  className={`flex-1 px-3 py-2 text-center rounded-md border cursor-pointer text-sm
                    ${cameraSource === "webcam"
                      ? "bg-green-50 border-green-500"
                      : "hover:border-gray-400"
                    }`}
                >
                  💻 Webcam
                </div>

                <div
                  onClick={() => setCameraSource("ip")}
                  className={`flex-1 px-3 py-2 text-center rounded-md border cursor-pointer text-sm
                    ${cameraSource === "ip"
                      ? "bg-green-50 border-green-500"
                      : "hover:border-gray-400"
                    }`}
                >
                  📱 IP Camera
                </div>

              </div>
                </div>
              )}

            {/* CAMERA */}
            {uploadType === "camera" && (
              <>
                <div className="flex justify-center mb-3">
                  <div className="w-full h-[500px] bg-black rounded-xl shadow border flex items-center justify-center overflow-hidden">

                    {!isCameraOn && (
                      <p className="text-gray-400 text-lg">video stream</p>
                    )}

                    <video
                      ref={videoRef}
                      autoPlay
                      className={`w-full h-full object-cover ${!isCameraOn && "hidden"}`}
                    />

                  </div>
                </div>
                <canvas ref={canvasRef} className="hidden"></canvas>

                <div className="flex gap-2 mb-3">
                  <button 
                    onClick={toggleCamera} 
                    className={`p-2 flex-1 rounded text-white
                      ${isCameraOn ? "bg-red-500" : "bg-blue-500"}
                    `}
                  >
                    {isCameraOn ? "🔴 Tắt Camera" : "🎥 Mở Camera"}
                  </button>

                  <button onClick={captureImage} className="bg-yellow-400 p-2 flex-1 rounded">
                    📸 Chụp
                  </button>
                </div>
              </>
            )}

            {/* UPLOAD FILE */}
            {uploadType === "upload" && (
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files)
                  setUploadedFiles(prev => [...prev, ...files])
                }}
                className="mb-3"
              />
            )}

            {/* PREVIEW */}
            <div className="grid grid-cols-4 gap-2 mb-3">

              {/* ===== ẢNH CHỤP ===== */}
              {capturedImages.map((img, i) => (
                <div key={"cam-" + i} className="relative group">
                  <div className="aspect-square">
                    <img 
                      src={img} 
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>

                  {/* nút xoá */}
                  <button
                    onClick={() => removeCapturedImage(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {/* ===== ẢNH UPLOAD ===== */}
              {uploadedFiles.map((file, i) => (
                <div key={"file-" + i} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    className="rounded w-full h-24 object-cover"
                  />

                  {/* nút xoá */}
                  <button
                    onClick={() => removeUploadedImage(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}

            </div>

            <button
              onClick={handleRegister}
              className="w-full bg-purple-600 text-white p-3 rounded">
              🚀 Đăng ký
            </button>

          </div>
        )}

      </div>
    </MainLayout>
  )
}
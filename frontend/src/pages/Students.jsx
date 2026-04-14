import { useState, useEffect, useRef } from "react"
import MainLayout from "../layout/MainLayout"
import Swal from "sweetalert2"
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
  const [classes, setClasses] = useState([])

  const [openDropdownId, setOpenDropdownId] = useState(null)

  const [images, setImages] = useState([])
  const [previewImage, setPreviewImage] = useState(null)
  const [search, setSearch] = useState("")
  const [ipUrl, setIpUrl] = useState("http://192.168.");

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
 
   // ===== LOAD CLASS =====
  useEffect(() => {
    loadStudents()
    loadClasses()
  }, [])

  const loadClasses = async () => {
    const res = await fetch("http://localhost:5001/classes")
    const data = await res.json()
    setClasses(data)
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
      Swal.fire({
        icon: "error",
        title: "Không tải được dữ liệu!",
        text: "Vui lòng thử lại"
      })
    }
  }

  // ===== CAMERA =====
  const toggleCamera = async () => {

    if (cameraSource === "ip") {
      if (!ipUrl) {
        Swal.fire("Nhập IP camera trước!")
        return
      }

      setIsCameraOn(prev => !prev)
      return
    }

    // webcam
    if (isCameraOn) {
      stream?.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
      setStream(null)
      setIsCameraOn(false)
    } else {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setIsCameraOn(true)
      } catch {
        Swal.fire("Không mở được webcam")
      }
    }
  }

  const captureImage = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    if (cameraSource === "webcam") {
      const video = videoRef.current

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      ctx.drawImage(video, 0, 0)

    } else if (cameraSource === "ip") {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.src = `${ipUrl}/shot.jpg`

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height

        ctx.drawImage(img, 0, 0)

        const imageData = canvas.toDataURL("image/png")
        setCapturedImages(prev => [...prev, imageData])
      }

      return
    }

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
    const formData = new FormData()

    // ảnh chụp
    capturedImages.forEach((img, index) => {
      const blob = dataURLtoBlob(img)
      formData.append("images", blob, `cam_${index}.png`)
    })

    // ảnh upload
    uploadedFiles.forEach((file) => {
      formData.append("images", file)
    })

    await fetch(`http://localhost:5001/upload-images/${studentId}`, {
      method: "POST",
      body: formData
    })
  }

  // ===== ADD =====
  const handleRegister = async () => {
    if (!form.id || !form.name || !form.email) {
      Swal.fire({
        icon: "warning",
        title: "Thiếu thông tin!",
        text: "Vui lòng nhập đầy đủ các trường"
      })
      return
    }

    try {
      // 1. lưu student
      await addStudent({
        id: form.id,
        name: form.name,
        email: form.email
      })

      // 2. enroll class
      if (form.classId) {
        await fetch("http://localhost:5001/enrollments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            studentId: form.id,
            classId: form.classId
          })
        })
      }

      // 3. upload ảnh
      await uploadImages(form.id)

      // 🔴 tắt camera sau khi đăng ký
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null
      }

      setStream(null)
      setIsCameraOn(false)

      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Đăng ký sinh viên thành công",
        timer: 2000,
        showConfirmButton: false
      })

      // reset
      setForm({ id: "", name: "", email: "", classId: "" })
      setCapturedImages([])
      setUploadedFiles([])

      loadStudents()
      setActiveTab("list")

    } catch (err) {
      console.error(err)
      Swal.fire({
        icon: "error",
        title: "Đăng ký thất bại!",
        text: "Vui lòng thử lại"
      })
    }
  }

  // ===== DELETE =====
  const handleDelete = async (id) => {

    const result = await Swal.fire({
      title: "Xóa sinh viên?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy"
    })

    if (!result.isConfirmed) return

    await deleteStudent(id)

    Swal.fire({
      icon: "success",
      title: "Đã xóa thành công",
      timer: 1500,
      showConfirmButton: false
    })

    loadStudents()
  }

  // ===== UPDATE =====
  const handleSave = async () => {
    try {
      await fetch(`http://localhost:5001/update-student-full/${editData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData)
      })

      Swal.fire({
        icon: "success",
        title: "Cập nhật thành công!",
        timer: 1500,
        showConfirmButton: false
      })

      loadStudents()

    } catch (err) {
      console.error(err)

      Swal.fire({
        icon: "error",
        title: "Lỗi cập nhật!",
        text: "Vui lòng thử lại"
      })
    }
  }

  const loadImages = async (studentId) => {
    const res = await fetch(`http://localhost:5001/student-images/${studentId}`)
    const data = await res.json()
    setImages(data)
  }

  const handleDeleteImage = async (imageId) => {

    const result = await Swal.fire({
      title: "Xóa ảnh này?",
      text: "Ảnh sẽ bị xóa vĩnh viễn!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy"
    })

    if (!result.isConfirmed) return

    Swal.fire({
      title: "Đang xóa...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      }
    })

    await fetch(`http://localhost:5001/student-images/${imageId}`, {
      method: "DELETE"
    })

    loadImages(openId)

    Swal.fire({
      icon: "success",
      title: "Đã xóa ảnh",
      timer: 1500,
      showConfirmButton: false
    })
  }

  const handleAddImage = (sv) => {
    // chuyển tab
    setActiveTab("add")

    // truyền dữ liệu qua form
    setForm({
      id: sv.id,
      name: sv.name,
      email: sv.email,
      classId: sv.class_ids?.[0] || "" // lấy lớp đầu tiên (nếu có)
    })

    // reset ảnh cũ (tránh dính dữ liệu)
    setCapturedImages([])
    setUploadedFiles([])
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
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("list")}
              className={`px-5 py-2 rounded-lg ${
                activeTab === "list" ? "bg-purple-500 text-white" : "bg-white border"
              }`}
            >
              📋 Danh sách sinh viên
            </button>

            <button
              onClick={() => setActiveTab("add")}
              className={`px-5 py-2 rounded-lg ${
                activeTab === "add" ? "bg-purple-500 text-white" : "bg-white border"
              }`}
            >
              ➕ Đăng ký mới
            </button>
          </div>

          {/* RIGHT: SEARCH */}
          <input
            type="text"
            placeholder="🔍 Tìm theo tên hoặc mã SV..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-4 py-2 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />

        </div>

        {/* ================= LIST ================= */}
        {activeTab === "list" && (
          <div className="space-y-4">
            {students
              .filter((sv) => {
                const keyword = search.toLowerCase().trim()

                return (
                  sv.name?.toLowerCase().includes(keyword) ||
                  sv.id?.toLowerCase().includes(keyword)
                )
              })
              .map((sv) => {
              const isOpen = openId === sv.id

              return (
                <div key={sv.id} className="bg-white rounded-2xl shadow border">

                  <div
                    onClick={() => {
                      setOpenId(isOpen ? null : sv.id)
                      setEditData({
                        ...sv,
                        class_ids: sv.class_ids || []
                      })
                      loadImages(sv.id)
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
                      {sv.class_names || "chưa có lớp"}
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

                          <p> 📁 <span className="font-medium">Lớp:</span>  {sv.class_names || "Chưa có"}</p>

                          <p>
                            📧 <span className="font-medium">Email:</span> {sv.email}
                          </p>

                          <p>
                            📍 <span className="font-medium">Thư mục:</span> data/students/{sv.id}
                          </p>

                        </div>
                      </div>

                      {/* ===== DANH SÁCH ẢNH ===== */}
                      <div className="bg-white rounded-xl border p-4">
                        <p className="font-semibold mb-3">📸 Ảnh sinh viên</p>

                        {images.length === 0 ? (
                          <p className="text-gray-400 text-sm">Chưa có ảnh</p>
                        ) : (
                          <div className="grid grid-cols-4 gap-3">

                            {images.map((img) => (
                              <div key={img.id} className="relative group">

                                <img
                                  src={`http://localhost:5001/images/${img.image_path}`}  // ✅ FIX
                                  className="w-full h-24 object-cover rounded-lg cursor-pointer"
                                  onClick={() => setPreviewImage(img.image_path)}
                                />

                                {/* NÚT XÓA */}
                                <button
                                  onClick={() => handleDeleteImage(img.id)}
                                  className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full text-xs 
                                            flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                >
                                  ✕
                                </button>

                              </div>
                            ))}

                          </div>
                        )}
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
                           <div className="relative mt-1">

                              {/* BOX HIỂN THỊ */}
                              <div
                                onClick={() =>   setOpenDropdownId(openDropdownId === sv.id ? null : sv.id)}
                                className="border rounded-lg p-2 bg-gray-50 cursor-pointer flex justify-between items-center"
                              >
                                <span className="text-sm">
                                  {editData.class_ids?.length > 0
                                    ? classes
                                        .filter(c => editData.class_ids.includes(c.id))
                                        .map(c => c.name)
                                        .join(", ")
                                    : "-- Chọn lớp --"}
                                </span>
                                <span>▼</span>
                              </div>

                              {/* DROPDOWN */}
                              {openDropdownId === sv.id && (
                                <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow max-h-48 overflow-y-auto">

                                  {classes.map((c) => (
                                    <label
                                      key={c.id}
                                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                    >
                                      <input
                                        type="checkbox"
                                        className="accent-blue-500"
                                        checked={editData.class_ids?.includes(c.id)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setEditData({
                                              ...editData,
                                              class_ids: [...(editData.class_ids || []), c.id]
                                            })
                                          } else {
                                            setEditData({
                                              ...editData,
                                              class_ids: editData.class_ids.filter(id => id !== c.id)
                                            })
                                          }
                                        }}
                                      />

                                      <span>{c.name}</span>
                                    </label>
                                  ))}

                                </div>
                              )}

                            </div>
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

                          {/* LƯU */}
                          <button
                            onClick={handleSave}
                            className="flex-1 bg-blue-500 text-white rounded-lg py-2 flex items-center justify-center gap-2 
                                      hover:bg-blue-600 transition shadow-sm"
                          >
                            💾 Lưu
                          </button>

                          {/* THÊM ẢNH */}
                          <button
                            onClick={() => handleAddImage(sv)}
                            className="flex-1 bg-green-500 text-white rounded-lg py-2 flex items-center justify-center gap-2 
                                      hover:bg-green-600 transition shadow-sm"
                          >
                            ➕ Thêm ảnh
                          </button>

                          {/* XÓA */}
                          <button
                            onClick={() => handleDelete(sv.id)}
                            className="flex-1 bg-red-500 text-white rounded-lg py-2 flex items-center justify-center gap-2 
                                      hover:bg-red-600 transition shadow-sm"
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
                <option value="">-- Chọn lớp --</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
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

                {/* WEBCAM */}
                <div
                  onClick={() => {
                    setCameraSource("webcam")

                    // 👉 nếu đang dùng IP thì reset trạng thái
                    setIsCameraOn(false)
                  }}
                  className={`flex-1 px-3 py-2 text-center rounded-md border cursor-pointer text-sm transition
                    ${cameraSource === "webcam"
                      ? "bg-green-50 border-green-500"
                      : "hover:border-gray-400"
                    }`}
                >
                  💻 Webcam
                </div>

                {/* IP CAMERA */}
                <div
                  onClick={() => {

                    // 🔴 QUAN TRỌNG: tắt webcam nếu đang chạy
                    if (stream) {
                      stream.getTracks().forEach(track => track.stop())
                    }

                    if (videoRef.current) {
                      videoRef.current.srcObject = null
                    }

                    setStream(null)
                    setIsCameraOn(false)

                    // 👉 chuyển sang IP
                    setCameraSource("ip")
                  }}
                  className={`flex-1 px-3 py-2 text-center rounded-md border cursor-pointer text-sm transition
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

            {cameraSource === "ip" && (
              <div className="mb-3">
                
                {/* LABEL */}
                <p className="text-sm text-gray-600 mb-1">
                  Nhập IP camera
                </p>

                {/* INPUT */}
                <input
                  placeholder="http://192.168.xxx.xxx:8080"
                  value={ipUrl}
                  onChange={(e) => setIpUrl(e.target.value)}
                  className="border p-2 w-full rounded"
                />

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

                    {cameraSource === "webcam" ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        className={`w-full h-full object-cover ${!isCameraOn && "hidden"}`}
                      />
                    ) : (
                      isCameraOn && ipUrl && (
                        <img
                          src={`${ipUrl}/video`}
                          className="w-full h-full object-cover"
                          alt="IP Camera"
                        />
                      )
                    )}

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
         {previewImage && (
              <div
                onClick={() => setPreviewImage(null)}
                className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
              >
                {/* NGĂN click ảnh bị đóng */}
                <div onClick={(e) => e.stopPropagation()} className="relative">

                  {/* ẢNH FULL */}
                  <img
                    src={`http://localhost:5001/images/${previewImage}`}
                    className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-lg"
                  />

                  {/* NÚT ĐÓNG */}
                  <button
                    onClick={() => setPreviewImage(null)}
                    className="absolute -top-3 -right-3 bg-white text-black w-8 h-8 rounded-full shadow flex items-center justify-center"
                  >
                    ✕
                  </button>

                </div>
              </div>
            )}

      </div>
    </MainLayout>
  )
}
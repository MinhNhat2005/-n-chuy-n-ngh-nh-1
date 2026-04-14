import { useState, useRef, useEffect } from "react";
import MainLayout from "../layout/MainLayout";
import { FaCamera, FaPlay, FaStop, FaWifi } from "react-icons/fa";
import { getClasses } from "../services/classService"

export default function Attendance() {
  const videoRef = useRef(null);

  const [isRunning, setIsRunning] = useState(false);
  const [cameraSource, setCameraSource] = useState("webcam");
  const [ipUrl, setIpUrl] = useState("http://192.168.");
  const [stream, setStream] = useState(null);
  const [showIpModal, setShowIpModal] = useState(false)
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState("") 
  const [detections, setDetections] = useState([]);
  const canvasRef = useRef(null);
  const [attendanceList, setAttendanceList] = useState([]);
  const imgRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedIds, setSavedIds] = useState(new Set());
  

  useEffect(() => {
    loadClasses()
  }, [])

  useEffect(() => {
    setAttendanceList([]);
    setSavedIds(new Set()); // 🔥 reset luôn
  }, [selectedClass]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      captureFrame();
    }, 1000); // 1s (có thể giảm xuống 500ms nếu muốn nhanh hơn)

    return () => clearInterval(interval);
  }, [isRunning]);


  useEffect(() => {
    const canvas = canvasRef.current;

    let source;

    if (cameraSource === "webcam") {
      source = videoRef.current;
      if (!source || source.videoWidth === 0) return;
    } else {
      source = imgRef.current;
      if (!source || source.width === 0) return;
    }

    canvas.width = source.videoWidth || source.width;
    canvas.height = source.videoHeight || source.height;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach((face) => {
      const [top, right, bottom, left] = face.bbox;

      ctx.strokeStyle = "lime";
      ctx.lineWidth = 3;
      ctx.strokeRect(left, top, right - left, bottom - top);

      ctx.fillStyle = "lime";
      ctx.font = "16px Arial";

      const label = `${face.id} | ${face.name || "Unknown"} | ${face.time}`;

      ctx.fillStyle = "lime";
      ctx.font = "bold 16px Arial";

      // nền đen cho dễ nhìn
      ctx.fillStyle = "black";
      ctx.fillRect(left, top - 25, ctx.measureText(label).width + 10, 20);

      ctx.fillStyle = "lime";
      ctx.fillText(label, left + 5, top - 10);
    });

  }, [detections, cameraSource]);

  useEffect(() => {
    detections.forEach((d) => {
      if (d.name === "Unknown") return;

      // 👇 nếu chưa lưu thì mới gọi API
      if (!savedIds.has(d.id)) {

        // thêm vào danh sách hiển thị
        setAttendanceList((prev) => [
          ...prev,
          {
            id: d.id,
            name: d.name,
            time: d.time
          }
        ]);

        // gọi API
        saveAttendance(d);

        // đánh dấu đã lưu
        setSavedIds(prev => new Set(prev).add(d.id));
      }
    });
  }, [detections]);

  const loadClasses = async () => {
    try {
      const data = await getClasses()
      setClasses(data)

      if (data.length > 0) {
        setSelectedClass(data[0].id) // chọn mặc định
      }
    } catch (err) {
      console.error(err)
      alert("Không tải được danh sách lớp")
    }
  }

  const captureFrame = async () => {
    if (isProcessing) return; // 🚫 tránh spam
    setIsProcessing(true);

    try {
      let source;

      if (cameraSource === "webcam") {
        const video = videoRef.current;
        if (!video || video.videoWidth === 0) return;
        source = video;
      } else {
        const img = imgRef.current;
        if (!img || img.width === 0) return;
        source = img;
      }

      const canvas = document.createElement("canvas");
      canvas.width = source.videoWidth || source.width;
      canvas.height = source.videoHeight || source.height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(source, 0, 0);

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg")
      );

      const formData = new FormData();
      formData.append("frame", blob);

      const res = await fetch("http://localhost:5001/api/recognize", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (data.results) {
        setDetections(data.results);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false); // ✅ mở lại
    }
  };

  // ===== START CAMERA =====
  const startCamera = async () => {

    // ===== WEBCAM =====
    if (cameraSource === "webcam") {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 }
        });

        setIsRunning(true); // 👈 render video TRƯỚC

        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;

            videoRef.current.onloadedmetadata = () => {
              videoRef.current.play();
            };
          }
        }, 100); // 👈 đợi React render

        setStream(mediaStream);

      } catch (err) {
        console.error(err);
        alert("Không mở được webcam");
      }
    }
  

    // ===== IP CAMERA =====
    else if (cameraSource === "ip") {
      if (!ipUrl) {
        alert("Nhập IP camera");
        return;
      }

      // test kết nối nhanh
      const img = new Image();
      img.src = `${ipUrl}/video`;

      img.onload = () => {
        setIsRunning(true);
      };

      img.onerror = () => {
        alert("Không kết nối được IP Camera");
      };
    }
  };

  // ===== STOP CAMERA =====
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setStream(null);
    setIsRunning(false);
    setDetections([]);
    setAttendanceList([]);
  };

  const saveAttendance = async (d) => {
    try {
      await fetch("http://localhost:5001/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          studentId: d.id,
          studentName: d.name,
          classId: selectedClass
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white p-6 rounded-2xl shadow">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FaCamera /> Hệ thống Điểm danh AI
          </h1>
          <p className="opacity-90 mt-1">
            Nhận diện khuôn mặt và ghi nhận điểm danh tự động
          </p>
        </div>

        {/* CONTROL PANEL */}
        <div className="bg-white p-6 rounded-2xl shadow border grid md:grid-cols-3 gap-6 items-end">

          {/* CHỌN LỚP */}
          <div>
            <label className="block text-sm mb-2 font-medium">
              🎯 Chọn lớp
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.id})
                </option>
              ))}
            </select>
          </div>

          {/* CAMERA SOURCE */}
          <div>
            <label className="block text-sm mb-2 font-medium">
              📷 Nguồn Camera
            </label>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg cursor-pointer">
                <input
                  type="radio"
                  checked={cameraSource === "webcam"}
                  onChange={() => setCameraSource("webcam")}
                />
                Webcam
              </label>

              <label className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg cursor-pointer">
                <input
                  type="radio"
                  checked={cameraSource === "ip"}
                  onChange={() => {
                    setCameraSource("ip")
                    setShowIpModal(true) // 👈 mở popup
                  }}
                />
                IP Camera
              </label>
            </div>
          </div>

          {/* BUTTON */}
          <div className="flex gap-3">
            {!isRunning ? (
              <button
                onClick={startCamera}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white p-3 rounded-xl flex items-center justify-center gap-2"
              >
                <FaPlay /> Bắt đầu
              </button>
            ) : (
              <button
                onClick={stopCamera}
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

              {/* WEBCAM */}
              {cameraSource === "webcam" && isRunning && (
                <div className="relative w-full h-full">

                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full"
                  />

                </div>
              )}

              {/* IP CAMERA */}
              {cameraSource === "ip" && isRunning && (
                <div className="relative w-full h-full">

                  <img
                    ref={imgRef}
                    src={`${ipUrl}/video`}
                    className="w-full h-full object-cover"
                    alt="IP Camera"
                  />

                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full"
                  />

                </div>
              )}

              {!isRunning && <span>Camera Stream</span>}

            </div>
          </div>

          {/* LIST */}
          <div className="bg-white p-5 rounded-2xl shadow border">
            <h3 className="font-semibold mb-4 flex justify-between">
              📝 Danh sách vừa quét
              <span className="text-sm text-gray-400">
                {attendanceList.length} bản ghi
              </span>
            </h3>

            <div className="max-h-[380px] overflow-y-auto">
             <table className="w-full text-sm border rounded-xl overflow-hidden">
              <thead className="bg-blue-500 text-white">
                <tr>
                  <th className="p-2">MSSV</th>
                  <th className="p-2">Tên</th>
                  <th className="p-2">Thời gian</th>
                </tr>
              </thead>

              <tbody>
                {attendanceList.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{item.id}</td>
                    <td className="p-2">{item.name}</td>
                    <td className="p-2 text-gray-500">{item.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

          </div>

        </div>

      </div>
      {showIpModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

          {/* BOX */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 w-[380px] shadow-2xl 
                          transform transition-all scale-100 animate-fadeIn">

            {/* HEADER */}
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 text-blue-500 p-3 rounded-xl text-xl">
                📡
              </div>
              <div>
                <h2 className="text-lg font-semibold">Kết nối IP Camera</h2>
                <p className="text-sm text-gray-500">
                  Nhập địa chỉ camera từ điện thoại
                </p>
              </div>
            </div>

            {/* INPUT */}
            <div className="mb-4">
              <label className="text-sm text-gray-600 mb-1 block">
                Địa chỉ IP
              </label>

              <input
                autoFocus
                value={ipUrl}
                onChange={(e) => setIpUrl(e.target.value)}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition"
                placeholder="http://192.168.xxx.xxx:8080"
              />

              {/* hint */}
              <p className="text-xs text-gray-400 mt-1">
                Ví dụ: http://192.168.1.5:8080
              </p>
            </div>

            {/* BUTTON */}
            <div className="flex gap-3">

              {/* CANCEL */}
              <button
                onClick={() => {
                  setShowIpModal(false)
                  setCameraSource("webcam")
                }}
                className="flex-1 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 transition"
              >
                Hủy
              </button>

              {/* OK */}
              <button
                onClick={() => setShowIpModal(false)}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 
                          text-white hover:opacity-90 transition shadow-md"
              >
                Kết nối
              </button>

            </div>

          </div>
        </div>
      )}
    </MainLayout>
  );
}
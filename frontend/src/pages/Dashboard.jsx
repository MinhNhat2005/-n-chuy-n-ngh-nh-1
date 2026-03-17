import MainLayout from "../layout/MainLayout"

export default function Dashboard() {
  return (
    <MainLayout>

      <h1 className="text-3xl font-bold mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-4 gap-6">

        <div className="bg-white shadow rounded-xl p-6">
          <h3 className="text-gray-500">Total Students</h3>
          <p className="text-3xl font-bold">120</p>
        </div>

        <div className="bg-white shadow rounded-xl p-6">
          <h3 className="text-gray-500">Total Classes</h3>
          <p className="text-3xl font-bold">6</p>
        </div>

        <div className="bg-white shadow rounded-xl p-6">
          <h3 className="text-gray-500">Attendance Today</h3>
          <p className="text-3xl font-bold">85</p>
        </div>

        <div className="bg-white shadow rounded-xl p-6">
          <h3 className="text-gray-500">Unknown Faces</h3>
          <p className="text-3xl font-bold">3</p>
        </div>

      </div>

    </MainLayout>
  )
}
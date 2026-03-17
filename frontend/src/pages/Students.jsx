import MainLayout from "../layout/MainLayout"

export default function Students(){

return(

<MainLayout>

<h1 className="text-2xl font-bold mb-5">
Student Management
</h1>

<div className="bg-white p-5 rounded shadow">

<input
className="border p-2 w-full"
placeholder="Student ID"
/>

<input
className="border p-2 w-full mt-2"
placeholder="Student Name"
/>

<select className="border p-2 w-full mt-2">

<option>Select Class</option>

</select>

<button className="bg-green-500 text-white px-4 py-2 mt-3 rounded">
Open Camera
</button>

<button className="bg-blue-500 text-white px-4 py-2 mt-3 rounded ml-3">
Save Student
</button>

</div>

</MainLayout>

)

}
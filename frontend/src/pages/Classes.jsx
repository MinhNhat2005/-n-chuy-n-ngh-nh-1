import MainLayout from "../layout/MainLayout"

export default function Classes(){

return(

<MainLayout>

<h1 className="text-2xl font-bold mb-4">
Class Management
</h1>

<div className="bg-white p-5 rounded shadow mb-5">

<h3>Add Class</h3>

<input
className="border p-2 w-full mt-2"
placeholder="Class ID"
/>

<input
className="border p-2 w-full mt-2"
placeholder="Class Name"
/>

<button className="bg-blue-500 text-white px-4 py-2 mt-3 rounded">
Save Class
</button>

</div>

<div className="bg-white p-5 rounded shadow">

<h3>Class List</h3>

<ul className="mt-3">

<li className="flex justify-between border-b py-2">
LTCB
<button className="text-red-500">
Delete
</button>
</li>

</ul>

</div>

</MainLayout>

)

}
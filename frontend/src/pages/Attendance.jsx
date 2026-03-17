import MainLayout from "../layout/MainLayout"

export default function Attendance(){

return(

<MainLayout>

<h1 className="text-2xl font-bold mb-4">
Camera Attendance
</h1>

<select className="border p-2">

<option>Select Class</option>

</select>

<div className="mt-5 bg-black h-96 flex items-center justify-center text-white">

Camera Stream

</div>

<div className="bg-white p-4 mt-4 rounded shadow">

<h3>Recent Attendance</h3>

<table className="w-full mt-2">

<thead>

<tr>
<th>ID</th>
<th>Name</th>
<th>Time</th>
</tr>

</thead>

<tbody>

<tr>
<td>SV001</td>
<td>Nguyen Van A</td>
<td>08:21</td>
</tr>

</tbody>

</table>

</div>

</MainLayout>

)

}
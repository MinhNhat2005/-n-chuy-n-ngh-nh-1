import MainLayout from "../layout/MainLayout"

export default function History(){

return(

<MainLayout>

<h1 className="text-2xl font-bold mb-4">
Attendance History
</h1>

<input
className="border p-2"
placeholder="Search Student"
/>

<table className="w-full bg-white mt-4 rounded shadow">

<thead>

<tr>
<th>ID</th>
<th>Name</th>
<th>Class</th>
<th>Time</th>
</tr>

</thead>

<tbody>

<tr>
<td>SV001</td>
<td>Nguyen Van A</td>
<td>LTCB</td>
<td>08:21</td>
</tr>

</tbody>

</table>

</MainLayout>

)

}
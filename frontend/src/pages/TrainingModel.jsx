import MainLayout from "../layout/MainLayout"

export default function Training(){

return(

<MainLayout>

<h1 className="text-2xl font-bold mb-4">
Training Model
</h1>

<div className="bg-white p-6 rounded shadow">

<button className="bg-purple-600 text-white px-4 py-2 rounded">
Start Training
</button>

</div>

</MainLayout>

)

}
const API = "http://localhost:5000"

// GET ALL CLASSES
export const getClasses = async () => {
  const res = await fetch(`${API}/classes`)
  return await res.json()
}

// ADD CLASS
export const addClass = async (data) => {
  const res = await fetch(`${API}/classes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })

  return await res.json()
}

// DELETE CLASS
export const deleteClass = async (id) => {
  const res = await fetch(`${API}/classes/${id}`, {
    method: "DELETE"
  })

  return await res.json()
}
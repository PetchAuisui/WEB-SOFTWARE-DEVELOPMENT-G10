import React, { useEffect, useState } from 'react'

function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // 🔑 ดึง token จาก localStorage
        let token =
          localStorage.getItem('token') ||
          localStorage.getItem('accessToken')

        if (!token) {
          throw new Error('No token found, please login')
        }

        // ✅ ถ้า token มี Bearer ติดมาแล้ว ไม่ต้องเติมซ้ำ
        if (token.startsWith('Bearer ')) {
          token = token.replace('Bearer ', '')
        }

        const res = await fetch('http://localhost:3001/api/users', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          throw new Error(`Unauthorized (${res.status})`)
        }

        const data = await res.json()
        setUsers(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        Loading users...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: 24, color: 'red' }}>
        {error}
      </div>
    )
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Users Page</h1>

      {users.length === 0 ? (
        <p>No users found</p>
      ) : (
        <table
          border="1"
          cellPadding="8"
          cellSpacing="0"
          style={{ marginTop: 16 }}
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>User Level</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id || user.id}>
                <td>{user._id || user.id}</td>
                <td>{user.userName || user.username}</td>
                <td>{user.userLevel}</td>
                <td>{user.userState}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Users

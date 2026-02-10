import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'

function Users() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  function getAuth() {
    const item = localStorage.getItem('base-shell:auth')
    return item ? JSON.parse(item) : null
  }

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const auth = getAuth()
        if (!auth?.token) {
          throw new Error('No token found, please login')
        }

        const resp = await fetch('/api/preferences/readDocument', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: auth.token,
          },
          body: JSON.stringify({
            collection: 'User',
            query: {},
          }),
        })

        if (!resp.ok) {
          throw new Error(`Error: ${resp.status}`)
        }

        const json = await resp.json()
        setUsers(json)
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
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
        <Typography mt={2}>Loading users...</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', p: 4 }}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f4f6f8',
        p: 4,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          User Management
        </Typography>

        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/users/create')}
        >
          + Add User
        </Button>
      </Box>

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          boxShadow: 3,
        }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: '#fafafa' }}>
            <TableRow>
              <TableCell><b>Username</b></TableCell>
              <TableCell><b>Full Name</b></TableCell>
              <TableCell><b>Email</b></TableCell>
              <TableCell><b>Level</b></TableCell>
              <TableCell><b>Status</b></TableCell>
              <TableCell align="center"><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map(user => (
                <TableRow key={user._id} hover>
                  <TableCell>{user.userName}</TableCell>
                  <TableCell>{user.fullName || '-'}</TableCell>
                  <TableCell>{user.email || '-'}</TableCell>

                  <TableCell>
                    <Chip
                      label={user.userLevel}
                      size="small"
                      color={user.userLevel === 'admin' ? 'primary' : 'default'}
                    />
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={user.userState}
                      size="small"
                      color={user.userState === 'enable' ? 'success' : 'warning'}
                    />
                  </TableCell>

                  <TableCell align="center">
                    <Button
                      size="small"
                      onClick={() => navigate(`/users/edit/${user._id}`)}
                    >
                      Edit
                    </Button>

                    <Button
                      size="small"
                      color="secondary"
                      sx={{ ml: 1 }}
                      onClick={() =>
                        navigate(`/users/password/${user._id}`)
                      }
                    >
                      Change Password
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default Users

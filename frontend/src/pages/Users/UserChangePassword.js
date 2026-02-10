import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
} from '@mui/material'

function ChangePassword() {
  const { id } = useParams() // user id
  const navigate = useNavigate()

  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function getAuth() {
    const item = localStorage.getItem('base-shell:auth')
    return item ? JSON.parse(item) : null
  }

  const handleSubmit = async () => {
    try {
      setError(null)

      // ✅ frontend validation
      if (!newPassword || !confirmNewPassword) {
        return setError('Please fill all fields')
      }

      if (newPassword !== confirmNewPassword) {
        return setError('Passwords do not match')
      }

      if (newPassword.length < 8) {
        return setError('Password must be at least 8 characters')
      }

      setLoading(true)

      const auth = getAuth()
      if (!auth?.token) {
        throw new Error('Please login again')
      }

      const resp = await fetch(
        `/api/users/admin/reset-password/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            authorization: auth.token,
          },
          body: JSON.stringify({
            newPassword,
            confirmNewPassword,
          }),
        }
      )

      const json = await resp.json()

      if (!resp.ok || json.text !== 'Admin reset password successfully!') {
        throw new Error(json.text || 'Reset password failed')
      }

      // ✅ success
      navigate('/users')

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f4f6f8',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Paper sx={{ p: 4, width: 420 }}>
        <Typography variant="h5" mb={2} fontWeight="bold">
          Reset Password
        </Typography>

        <TextField
          label="New Password"
          type="password"
          fullWidth
          margin="normal"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
        />

        <TextField
          label="Confirm New Password"
          type="password"
          fullWidth
          margin="normal"
          value={confirmNewPassword}
          onChange={e => setConfirmNewPassword(e.target.value)}
        />

        {error && (
          <Typography color="error" mt={1}>
            {error}
          </Typography>
        )}

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 3 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </Paper>
    </Box>
  )
}

export default ChangePassword

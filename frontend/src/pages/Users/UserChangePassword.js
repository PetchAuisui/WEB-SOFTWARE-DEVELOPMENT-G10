import React, { useState } from 'react'
import Page from '../../containers/Page/Page'
import { useParams, useNavigate } from 'react-router-dom'
import { useIntl } from 'react-intl'
import Grid from '@mui/material/Unstable_Grid2'
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Stack,
  CircularProgress,
  Divider,
  alpha,
} from '@mui/material'
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined'

// ── helpers ───────────────────────────────────────────────────────────────────

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    fontSize: 14,
    transition: 'box-shadow .2s',
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: alpha('#6366f1', 0.5),
    },
    '&.Mui-focused': {
      boxShadow: `0 0 0 3px ${alpha('#6366f1', 0.1)}`,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#6366f1',
      borderWidth: 1.5,
    },
    '&.Mui-disabled': {
      bgcolor: alpha('#64748b', 0.04),
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#6366f1',
  },
}

// ── section title ─────────────────────────────────────────────────────────────
function SectionLabel({ children, mt = 0 }) {
  return (
    <Typography
      sx={{
        fontSize: 11, fontWeight: 700, letterSpacing: '2px',
        textTransform: 'uppercase', color: 'text.secondary',
        mt, mb: 0.5,
      }}
    >
      {children}
    </Typography>
  )
}

function ChangePassword() {
  const intl = useIntl()
  const { id } = useParams() // user id
  const navigate = useNavigate()

  const [userData, setUserData] = useState(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  function getAuth() {
    const item = localStorage.getItem('base-shell:auth')
    return item ? JSON.parse(item) : null
  }

  React.useEffect(() => {
    async function fetchUser() {
      try {
        const auth = getAuth()
        if (!auth?.token) throw new Error('No token found, please login')

        const resp = await fetch('/api/preferences/readDocument', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: auth.token,
          },
          body: JSON.stringify({ collection: 'User', query: { _id: id } }),
        })
        const json = await resp.json()
        if (!json.length) throw new Error('User not found')
        setUserData(json[0])
      } catch (err) {
        setError(err.message)
      } finally {
        setInitialLoading(false)
      }
    }
    fetchUser()
  }, [id])

  const handleSubmit = async () => {
    try {
      setError(null)
      setSuccess(null)

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
      setSuccess('Password changed successfully!')
      setTimeout(() => navigate('/users'), 1500)

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <Page pageTitle={intl.formatMessage({ id: 'Change Password' })}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 2 }}>
          <CircularProgress size={28} sx={{ color: '#6366f1' }} />
          <Typography color="text.secondary" fontSize={14}>Loading...</Typography>
        </Box>
      </Page>
    )
  }

  return (
    <Page pageTitle={intl.formatMessage({ id: 'change_password' })}>
      <Box sx={{ p: { xs: 3, md: 4 }, width: '100%' }}>

        {/* ── Header ── */}
        <Stack direction="row" alignItems="center" spacing={1.5} mb={4}>
          <Button
            size="small"
            onClick={() => navigate('/users')}
            sx={{
              textTransform: 'none', fontWeight: 600, fontSize: 13,
              color: 'text.secondary', borderRadius: 2, minWidth: 0, px: 1.5,
              '&:hover': { bgcolor: alpha('#6366f1', 0.06), color: '#6366f1' },
            }}
          >
            ← Back
          </Button>
          <Divider orientation="vertical" flexItem />
          <Box>
            <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'primary.main' }}>
              User Management
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.3px' }}>
              Change Password
            </Typography>
          </Box>
        </Stack>

        {/* ── Body grid — form centered ── */}
        <Grid container spacing={3} justifyContent="center">

          {/* Form Card */}
          <Grid xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 3, 
                border: '1px solid', 
                borderColor: 'divider',
                background: `linear-gradient(135deg, ${alpha('#6366f1', 0.02)}, ${alpha('#818cf8', 0.02)})`,
              }}
            >

              {/* Info Box */}
              <Box
                sx={{
                  p: 2.5, mb: 3, borderRadius: 2.5,
                  bgcolor: alpha('#0ea5e9', 0.08),
                  border: `1px solid ${alpha('#0ea5e9', 0.2)}`,
                  display: 'flex', gap: 1.5, alignItems: 'flex-start',
                }}
              >
                <LockResetOutlinedIcon sx={{ color: '#0284c7', mt: 0.3, flexShrink: 0 }} />
                <Typography sx={{ fontSize: 13, color: '#0c4a6e' }}>
                  Reset password for user: <strong>{userData?.userName || 'unknown'}</strong>
                </Typography>
              </Box>

              {/* Password Fields */}
              <SectionLabel>New Password</SectionLabel>
              <Divider sx={{ mb: 2 }} />

              <TextField
                label="Password"
                type="password"
                fullWidth
                size="small"
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                disabled={loading}
                sx={{ ...fieldSx, mb: 2 }}
              />

              <TextField
                label="Confirm Password"
                type="password"
                fullWidth
                size="small"
                placeholder="Re-enter password"
                value={confirmNewPassword}
                onChange={e => setConfirmNewPassword(e.target.value)}
                disabled={loading}
                sx={{ ...fieldSx, mb: 2 }}
              />

              {/* Error/Success Messages */}
              {error && (
                <Box
                  sx={{
                    p: 2, mb: 2, borderRadius: 2,
                    bgcolor: alpha('#ef4444', 0.1),
                    border: `1px solid ${alpha('#ef4444', 0.2)}`,
                  }}
                >
                  <Typography sx={{ fontSize: 13, color: '#dc2626', fontWeight: 500 }}>
                    {error}
                  </Typography>
                </Box>
              )}

              {success && (
                <Box
                  sx={{
                    p: 2, mb: 2, borderRadius: 2,
                    bgcolor: alpha('#10b981', 0.1),
                    border: `1px solid ${alpha('#10b981', 0.2)}`,
                  }}
                >
                  <Typography sx={{ fontSize: 13, color: '#059669', fontWeight: 500 }}>
                    {success}
                  </Typography>
                </Box>
              )}

              {/* Action Buttons */}
              <Stack direction="row" spacing={2} mt={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/users')}
                  disabled={loading}
                  sx={{
                    textTransform: 'none', fontWeight: 600, fontSize: 13,
                    borderColor: 'divider', color: 'text.secondary',
                    borderRadius: 2,
                    '&:hover': { borderColor: 'primary.main', bgcolor: alpha('#6366f1', 0.04) },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading || !newPassword || !confirmNewPassword}
                  sx={{
                    textTransform: 'none', fontWeight: 700,
                    px: 3, py: 1.3, borderRadius: 2,
                    background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
                    boxShadow: `0 4px 14px ${alpha('#6366f1', 0.4)}`,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                      boxShadow: `0 6px 20px ${alpha('#6366f1', 0.5)}`,
                      transform: 'translateY(-1px)',
                    },
                    '&:disabled': {
                      opacity: 0.5,
                      cursor: 'not-allowed',
                    },
                    transition: 'all .2s ease',
                  }}
                >
                  {loading ? 'Saving...' : 'Save Password'}
                </Button>
              </Stack>

            </Paper>
          </Grid>

        </Grid>

      </Box>
    </Page>
  )
}

export default ChangePassword

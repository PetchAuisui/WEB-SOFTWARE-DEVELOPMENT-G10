import React, { useState } from 'react'
import Page from '../../containers/Page/Page'
import { useNavigate } from 'react-router-dom'
import { useIntl } from 'react-intl'
import Grid from '@mui/material/Unstable_Grid2'
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Stack,
  Divider,
  MenuItem,
  CircularProgress,
  alpha,
} from '@mui/material'
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined'

// ── shared TextField sx ───────────────────────────────────────────────────────
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

// ── main ──────────────────────────────────────────────────────────────────────
const AddUser = () => {
  const intl = useIntl()
  const navigate = useNavigate()

  const collection = 'User'
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState({
    userName: '', fullName: '', email: '',
    password: '', confirmPassword: '',
    userLevel: 'user', userState: 'enable', dateExpire: '',
  })

  function getAuth() {
    const item = localStorage.getItem('base-shell:auth')
    return item ? JSON.parse(item) : null
  }

  async function handleSave() {
    // Validation
    if (!data.userName?.trim()) {
      return setError('Username is required')
    }
    if (!data.password?.trim()) {
      return setError('Password is required')
    }
    if (data.password !== data.confirmPassword) {
      return setError('Passwords do not match')
    }
    if (data.password.length < 8) {
      return setError('Password must be at least 8 characters')
    }
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return setError('Invalid email format')
    }

    setSaving(true)
    try {
      const auth = getAuth()
      const payload = {
        ...data,
        dateCreate: new Date().toISOString(),
      }
      delete payload.confirmPassword

      const resp = await fetch('/api/preferences/createDocument', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authorization: auth.token },
        body: JSON.stringify({ collection, data: payload }),
      })

      if (!resp.ok) {
        const errorData = await resp.json()
        throw new Error(errorData.message || 'Failed to create user')
      }

      alert('New user created successfully')
      navigate('/users')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Page pageTitle={intl.formatMessage({ id: 'Add Users' })}>
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
          <PersonAddAltOutlinedIcon sx={{ color: '#6366f1', fontSize: 24 }} />
          <Box>
            <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'primary.main' }}>
              Administration
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.3px' }}>
              Add New User
            </Typography>
          </Box>
        </Stack>

        {/* ── Body grid — form(6) centered ── */}
        <Grid container spacing={3} justifyContent="center">

          {/* Form */}
          <Grid xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}
            >

              {/* Identity */}
              <SectionLabel>Identity</SectionLabel>
              <Divider sx={{ mb: 2.5 }} />
              <Grid container spacing={2}>

                <Grid xs={12}>
                  <TextField
                    label="Username"
                    value={data.userName}
                    onChange={e => setData({ ...data, userName: e.target.value })}
                    fullWidth size="small" sx={fieldSx} disabled={saving}
                  />
                </Grid>

                <Grid xs={12}>
                  <TextField
                    label="Full Name"
                    value={data.fullName}
                    onChange={e => setData({ ...data, fullName: e.target.value })}
                    fullWidth size="small" sx={fieldSx} disabled={saving}
                  />
                </Grid>

                <Grid xs={12}>
                  <TextField
                    label="Email"
                    type="email"
                    value={data.email}
                    onChange={e => setData({ ...data, email: e.target.value })}
                    fullWidth size="small" sx={fieldSx} disabled={saving}
                  />
                </Grid>

              </Grid>

              {/* Authentication */}
              <SectionLabel mt={3}>Authentication</SectionLabel>
              <Divider sx={{ mb: 2.5 }} />
              <Grid container spacing={2}>

                <Grid xs={12}>
                  <TextField
                    label="Password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={data.password}
                    onChange={e => setData({ ...data, password: e.target.value })}
                    fullWidth size="small" sx={fieldSx} disabled={saving}
                  />
                </Grid>

                <Grid xs={12}>
                  <TextField
                    label="Confirm Password"
                    type="password"
                    value={data.confirmPassword}
                    onChange={e => setData({ ...data, confirmPassword: e.target.value })}
                    fullWidth size="small" sx={fieldSx} disabled={saving}
                  />
                </Grid>

              </Grid>

              {/* Permissions */}
              <SectionLabel mt={3}>Permissions</SectionLabel>
              <Divider sx={{ mb: 2.5 }} />
              <Grid container spacing={2}>

                <Grid xs={12} sm={6}>
                  <TextField
                    select
                    label="User Level"
                    value={data.userLevel}
                    onChange={e => setData({ ...data, userLevel: e.target.value })}
                    fullWidth size="small" sx={fieldSx} disabled={saving}
                  >
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </TextField>
                </Grid>

                <Grid xs={12} sm={6}>
                  <TextField
                    select
                    label="User State"
                    value={data.userState}
                    onChange={e => setData({ ...data, userState: e.target.value })}
                    fullWidth size="small" sx={fieldSx} disabled={saving}
                  >
                    <MenuItem value="enable">Enable</MenuItem>
                    <MenuItem value="disable">Disable</MenuItem>
                  </TextField>
                </Grid>

              </Grid>

              {/* Expiration */}
              <SectionLabel mt={3}>Expiration</SectionLabel>
              <Divider sx={{ mb: 2.5 }} />
              <Grid container spacing={2}>

                <Grid xs={12}>
                  <TextField
                    label="Expiration Date (Optional)"
                    type="date"
                    value={data.dateExpire}
                    onChange={e => setData({ ...data, dateExpire: e.target.value })}
                    fullWidth size="small" sx={fieldSx} disabled={saving}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

              </Grid>

              {/* Error Message */}
              {error && (
                <Box
                  sx={{
                    p: 2, mt: 3, borderRadius: 2,
                    bgcolor: alpha('#ef4444', 0.1),
                    border: `1px solid ${alpha('#ef4444', 0.2)}`,
                  }}
                >
                  <Typography sx={{ fontSize: 13, color: '#dc2626', fontWeight: 500 }}>
                    {error}
                  </Typography>
                </Box>
              )}

              {/* Action Buttons */}
              <Stack direction="row" spacing={2} mt={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/users')}
                  disabled={saving}
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
                  onClick={handleSave}
                  disabled={saving || !data.userName || !data.password}
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
                  {saving ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                  {saving ? 'Creating...' : 'Create User'}
                </Button>
              </Stack>

            </Paper>
          </Grid>

        </Grid>

      </Box>
    </Page>
  )
}

export default AddUser

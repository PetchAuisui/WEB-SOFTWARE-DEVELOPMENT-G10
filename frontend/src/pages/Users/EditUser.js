import React, { useEffect, useState } from 'react'
import Page from '../../containers/Page/Page'
import { useIntl } from 'react-intl'
import { useParams, useNavigate } from 'react-router-dom'
import Grid from '@mui/material/Unstable_Grid2'
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Stack,
  Avatar,
  Divider,
  Chip,
  MenuItem,
  CircularProgress,
  alpha,
} from '@mui/material'

// ── helpers ───────────────────────────────────────────────────────────────────
function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
}

const AVATAR_PALETTES = [
  ['#6366f1', '#818cf8'],
  ['#0ea5e9', '#38bdf8'],
  ['#10b981', '#34d399'],
  ['#f59e0b', '#fbbf24'],
  ['#ec4899', '#f472b6'],
  ['#8b5cf6', '#a78bfa'],
]

function userGradient(name = '') {
  let h = 0
  for (let i = 0; i < name.length; i++) h += name.charCodeAt(i)
  const [a, b] = AVATAR_PALETTES[h % AVATAR_PALETTES.length]
  return `linear-gradient(135deg, ${a}, ${b})`
}

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
const EditUser = () => {
  const intl     = useIntl()
  const navigate = useNavigate()
  const { id }   = useParams()

  const collection = 'User'
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [data, setData] = useState({
    _id: '', userName: '', fullName: '',
    userLevel: '', userState: '', email: '', dateExpire: '',
  })

  function getAuth() {
    const item = localStorage.getItem('base-shell:auth')
    return item ? JSON.parse(item) : null
  }

  useEffect(() => {
    async function readUser() {
      try {
        const auth = getAuth()
        const resp = await fetch('/api/preferences/readDocument', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', authorization: auth.token },
          body: JSON.stringify({ collection, query: { _id: id } }),
        })
        const json = await resp.json()
        if (!json.length) { alert('ไม่พบข้อมูลผู้ใช้'); navigate('/users'); return }
        setData(json[0])
      } finally {
        setLoading(false)
      }
    }
    readUser()
  }, [id, navigate])

  async function handleSave() {
    setSaving(true)
    try {
      const auth = getAuth()
      await fetch('/api/preferences/updateDocument', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authorization: auth.token },
        body: JSON.stringify({ collection, data }),
      })
      alert('แก้ไขข้อมูลเรียบร้อย')
      navigate('/users')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 2 }}>
        <CircularProgress size={28} sx={{ color: '#6366f1' }} />
        <Typography color="text.secondary" fontSize={14}>Loading...</Typography>
      </Box>
    )
  }

  return (
    <Page pageTitle={intl.formatMessage({ id: 'Edit User' })}>
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
              Administration
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.3px' }}>
              Edit User
            </Typography>
          </Box>
        </Stack>

        {/* ── Body grid — avatar(2) + form(6) = 8 cols → center ── */}
        <Grid container spacing={3} justifyContent="center">

          {/* Avatar card */}
          <Grid xs={12} md={2}>
            <Paper
              elevation={0}
              sx={{
                p: 3, borderRadius: 3,
                border: '1px solid', borderColor: 'divider',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 1.5, textAlign: 'center',
              }}
            >
              <Avatar
                sx={{
                  width: 72, height: 72, borderRadius: '18px',
                  background: userGradient(data.userName),
                  fontSize: 24, fontWeight: 800,
                  boxShadow: `0 4px 20px ${alpha('#6366f1', 0.2)}`,
                }}
              >
                {getInitials(data.userName)}
              </Avatar>

              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 15, color: 'text.primary' }}>
                  {data.userName || '—'}
                </Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.2 }}>
                  {data.email || 'No email'}
                </Typography>
              </Box>

              <Stack direction="row" spacing={0.8} flexWrap="wrap" justifyContent="center">
                <Chip
                  label={data.userLevel || 'user'}
                  size="small"
                  sx={{
                    height: 22, fontSize: 10, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                    bgcolor: data.userLevel === 'admin' ? alpha('#6366f1', 0.1) : alpha('#64748b', 0.08),
                    color: data.userLevel === 'admin' ? '#4f46e5' : '#64748b',
                    border: `1px solid ${data.userLevel === 'admin' ? alpha('#6366f1', 0.25) : alpha('#64748b', 0.2)}`,
                  }}
                />
                <Chip
                  label={data.userState || 'enable'}
                  size="small"
                  sx={{
                    height: 22, fontSize: 10, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                    bgcolor: data.userState === 'enable' ? alpha('#10b981', 0.08) : alpha('#ef4444', 0.08),
                    color: data.userState === 'enable' ? '#059669' : '#dc2626',
                    border: `1px solid ${data.userState === 'enable' ? alpha('#10b981', 0.2) : alpha('#ef4444', 0.2)}`,
                  }}
                />
              </Stack>

              <Divider flexItem />

              <Typography sx={{ fontSize: 10, color: 'text.disabled', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                {data._id || '—'}
              </Typography>
            </Paper>
          </Grid>

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

                <Grid xs={12} sm={6}>
                  <TextField
                    label="User ID" value={data._id}
                    disabled fullWidth size="small" sx={fieldSx}
                  />
                </Grid>

                <Grid xs={12} sm={6}>
                  <TextField
                    label="Username" value={data.userName}
                    disabled fullWidth size="small" sx={fieldSx}
                  />
                </Grid>

                <Grid xs={12}>
                  <TextField
                    label="Full Name"
                    value={data.fullName || ''}
                    placeholder="Enter full name"
                    fullWidth size="small" sx={fieldSx}
                    onChange={e => setData({ ...data, fullName: e.target.value })}
                  />
                </Grid>

                <Grid xs={12}>
                  <TextField
                    label="Email"
                    value={data.email || ''}
                    placeholder="Enter email address"
                    fullWidth size="small" sx={fieldSx}
                    onChange={e => setData({ ...data, email: e.target.value })}
                  />
                </Grid>

              </Grid>

              {/* Permissions */}
              <SectionLabel mt={3.5}>Permissions</SectionLabel>
              <Divider sx={{ mb: 2.5 }} />
              <Grid container spacing={2}>

                <Grid xs={12} sm={6}>
                  <TextField
                    select label="User Level"
                    value={data.userLevel || ''}
                    fullWidth size="small" sx={fieldSx}
                    onChange={e => setData({ ...data, userLevel: e.target.value })}
                  >
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="user">User</MenuItem>
                  </TextField>
                </Grid>

                <Grid xs={12} sm={6}>
                  <TextField
                    select label="Status"
                    value={data.userState || ''}
                    fullWidth size="small" sx={fieldSx}
                    onChange={e => setData({ ...data, userState: e.target.value })}
                  >
                    <MenuItem value="enable">Enable</MenuItem>
                    <MenuItem value="disable">Disable</MenuItem>
                  </TextField>
                </Grid>

                <Grid xs={12} sm={6}>
                  <TextField
                    type="date" label="Expire Date"
                    InputLabelProps={{ shrink: true }}
                    value={data.dateExpire ? data.dateExpire.slice(0, 10) : ''}
                    fullWidth size="small" sx={fieldSx}
                    onChange={e => setData({ ...data, dateExpire: e.target.value })}
                  />
                </Grid>

              </Grid>

              {/* Actions */}
              <Divider sx={{ mt: 3.5, mb: 2.5 }} />
              <Stack direction="row" spacing={1.5} justifyContent="flex-end">

                <Button
                  variant="outlined"
                  onClick={() => navigate('/users')}
                  disabled={saving}
                  sx={{
                    textTransform: 'none', fontWeight: 600,
                    borderRadius: 2, px: 2.5,
                    borderColor: 'divider', color: 'text.secondary',
                    '&:hover': {
                      borderColor: alpha('#64748b', 0.4),
                      bgcolor: alpha('#64748b', 0.04),
                    },
                  }}
                >
                  Cancel
                </Button>

                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving}
                  sx={{
                    textTransform: 'none', fontWeight: 700,
                    borderRadius: 2, px: 3, minWidth: 130,
                    background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
                    boxShadow: `0 4px 14px ${alpha('#6366f1', 0.35)}`,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                      boxShadow: `0 6px 20px ${alpha('#6366f1', 0.45)}`,
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all .2s ease',
                  }}
                >
                  {saving
                    ? <><CircularProgress size={14} color="inherit" sx={{ mr: 1 }} />Saving…</>
                    : 'Save Changes'
                  }
                </Button>

              </Stack>
            </Paper>
          </Grid>

        </Grid>
      </Box>
    </Page>
  )
}

export default EditUser
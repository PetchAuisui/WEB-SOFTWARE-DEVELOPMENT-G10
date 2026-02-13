import React, { useEffect, useState } from 'react'
import Page from '../../containers/Page/Page'
import { useNavigate } from 'react-router-dom'
import { useIntl } from 'react-intl'
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined'
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined'
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'

// ─── Helpers ─────────────────────────────────────────────────────────────────


function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('th-TH', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

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

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, iconColor }) {
  return (
    
    <Paper 
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'box-shadow .2s, border-color .2s',
        '&:hover': {
          boxShadow: `0 0 0 2px ${alpha(iconColor, 0.25)}`,
          borderColor: alpha(iconColor, 0.4),
        },
      }}
    >
      <Box
        sx={{
          width: 48, height: 48, borderRadius: 2.5,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: alpha(iconColor, 0.1),
          color: iconColor, flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          sx={{
            fontSize: 11, fontWeight: 700, letterSpacing: '1.2px',
            textTransform: 'uppercase', color: 'text.secondary', mb: 0.3,
          }}
        >
          {label}
        </Typography>
        <Typography sx={{ fontSize: 30, fontWeight: 800, lineHeight: 1, color: 'text.primary' }}>
          {value}
        </Typography>
      </Box>
    </Paper>
  )
}

// ─── LevelChip ────────────────────────────────────────────────────────────────
function LevelChip({ level }) {
  const isAdmin = level === 'admin'
  return (
    <Chip
      label={level}
      size="small"
      sx={{
        height: 24, borderRadius: '6px',
        fontSize: 11, fontWeight: 700,
        letterSpacing: '0.5px', textTransform: 'uppercase',
        bgcolor: isAdmin ? alpha('#6366f1', 0.1) : alpha('#64748b', 0.08),
        color: isAdmin ? '#4f46e5' : '#64748b',
        border: `1px solid ${isAdmin ? alpha('#6366f1', 0.25) : alpha('#64748b', 0.2)}`,
      }}
    />
  )
}

// ─── StatusChip ───────────────────────────────────────────────────────────────
function StatusChip({ isExpired, userState }) {
  if (isExpired) {
    return (
      <Chip
        label="expired"
        size="small"
        sx={{
          height: 24, borderRadius: '6px',
          fontSize: 11, fontWeight: 700,
          letterSpacing: '0.5px', textTransform: 'uppercase',
          bgcolor: alpha('#ef4444', 0.08),
          color: '#dc2626',
          border: `1px solid ${alpha('#ef4444', 0.2)}`,
        }}
      />
    )
  }
  const active = userState === 'enable'
  return (
    <Chip
      label={userState}
      size="small"
      sx={{
        height: 24, borderRadius: '6px',
        fontSize: 11, fontWeight: 700,
        letterSpacing: '0.5px', textTransform: 'uppercase',
        bgcolor: active ? alpha('#10b981', 0.08) : alpha('#f59e0b', 0.08),
        color: active ? '#059669' : '#d97706',
        border: `1px solid ${active ? alpha('#10b981', 0.2) : alpha('#f59e0b', 0.2)}`,
      }}
    />
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function Users() {
  const intl = useIntl()
  const navigate = useNavigate()
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  function getAuth() {
    const item = localStorage.getItem('base-shell:auth')
    return item ? JSON.parse(item) : null
  }

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const auth = getAuth()
        if (!auth?.token) throw new Error('No token found, please login')

        const resp = await fetch('/api/preferences/readDocument', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: auth.token,
          },
          body: JSON.stringify({ collection: 'User', query: {} }),
        })

        if (!resp.ok) throw new Error(`Error: ${resp.status}`)
        setUsers(await resp.json())
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const total   = users.length
  const active  = users.filter(u => !u.dateExpire || new Date(u.dateExpire) >= new Date()).length
  const expired = total - active

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 2 }}>
        <CircularProgress color="primary" />
        <Typography color="text.secondary" fontSize={14}>Loading users…</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    )
  }

  return (
    <Page pageTitle={intl.formatMessage({ id: 'Users' })}>
      <Box sx={{ p: { xs: 3, md: 4 }, width: '100%' }}>

        {/* ── Header ── */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={4} flexWrap="wrap" gap={2}>
          <Box>
            <Typography
              sx={{
                fontSize: 11, fontWeight: 700, letterSpacing: '2.5px',
                textTransform: 'uppercase', color: 'primary.main', mb: 0.5,
              }}
            >
              Administration
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.5px' }}>
              User Management
            </Typography>
            <Typography color="text.secondary" fontSize={14} mt={0.5}>
              Manage accounts, roles and access
            </Typography>
          </Box>

        <Button
          variant="contained"
          startIcon={<PersonAddAltOutlinedIcon />}
          onClick={() => navigate('/users/create')}
          sx={{
            textTransform: 'none', fontWeight: 700,
            px: 3, py: 1.3, borderRadius: 2.5,
            background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
            boxShadow: `0 4px 14px ${alpha('#6366f1', 0.4)}`,
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              boxShadow: `0 6px 20px ${alpha('#6366f1', 0.5)}`,
              transform: 'translateY(-1px)',
            },
            transition: 'all .2s ease',
          }}
        >
          Add User
        </Button>
      </Stack>

      {/* ── Stats ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 2,
          mb: 4,
        }}
      >
        <StatCard icon={<GroupOutlinedIcon />}         label="Total Users" value={total}   iconColor="#6366f1" />
        <StatCard icon={<CheckCircleOutlineIcon />}    label="Active"      value={active}  iconColor="#10b981" />
        <StatCard icon={<ErrorOutlineIcon />}          label="Expired"     value={expired} iconColor="#ef4444" />
      </Box>

      {/* ── Table ── */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: alpha('#64748b', 0.04) }}>
              {['User', 'Email', 'Level', 'Status', 'Created At', 'Expired At', 'Actions'].map((col, i) => (
                <TableCell
                  key={col}
                  align={col === 'Actions' ? 'center' : 'left'}
                  sx={{
                    fontSize: 11, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '1.5px',
                    color: 'text.secondary',
                    borderBottom: '1px solid', borderColor: 'divider',
                    py: 1.5, px: 2.5,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8, color: 'text.secondary', border: 'none' }}>
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const isExpired = user.expiredAt && new Date(user.expiredAt) < new Date()

                return (
                  <TableRow
                    key={user._id}
                    hover
                    sx={{
                      '&:last-child td': { border: 'none' },
                      '&:hover': { bgcolor: alpha('#6366f1', 0.02) },
                      transition: 'background .15s',
                    }}
                  >
                    {/* User */}
                    <TableCell sx={{ py: 1.5, px: 2.5, borderColor: 'divider' }}>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar
                          sx={{
                            width: 36, height: 36, borderRadius: '10px',
                            background: userGradient(user.userName),
                            fontSize: 13, fontWeight: 800,
                          }}
                        >
                          {getInitials(user.userName)}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 700, fontSize: 14, color: 'text.primary', lineHeight: 1.3 }}>
                            {user.userName}
                          </Typography>
                          {user.fullName && user.fullName !== user.userName && (
                            <Typography sx={{ fontSize: 12, color: 'text.secondary', lineHeight: 1.3 }}>
                              {user.fullName}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </TableCell>

                    {/* Email */}
                    <TableCell sx={{ py: 1.5, px: 2.5, borderColor: 'divider' }}>
                      <Typography sx={{ fontSize: 13, color: 'text.secondary', fontFamily: 'monospace' }}>
                        {user.email || '—'}
                      </Typography>
                    </TableCell>

                    {/* Level */}
                    <TableCell sx={{ py: 1.5, px: 2.5, borderColor: 'divider' }}>
                      <LevelChip level={user.userLevel} />
                    </TableCell>

                    {/* Status */}
                    <TableCell sx={{ py: 1.5, px: 2.5, borderColor: 'divider' }}>
                      <StatusChip isExpired={isExpired} userState={user.userState} />
                    </TableCell>

                    {/* Created At */}
                    <TableCell sx={{ py: 1.5, px: 2.5, borderColor: 'divider' }}>
                      <Typography sx={{ fontSize: 13, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                        {formatDate(user.dateCreate)}
                      </Typography>
                    </TableCell>

                    {/* Expired At */}
                    <TableCell sx={{ py: 1.5, px: 2.5, borderColor: 'divider' }}>
                      <Typography sx={{ fontSize: 13, whiteSpace: 'nowrap', color: isExpired ? 'error.main' : 'text.secondary' }}>
                        {formatDate(user.dateExpire || user.expiredAt)}
                      </Typography>
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="center" sx={{ py: 1.5, px: 2.5, borderColor: 'divider' }}>
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Edit user" arrow>
                          <Button
                            size="small"
                            startIcon={<EditOutlinedIcon sx={{ fontSize: '13px !important' }} />}
                            onClick={() => navigate(`/users/edit/${user._id}`)}
                            sx={{
                              textTransform: 'none', fontWeight: 600, fontSize: 12,
                              px: 1.5, py: 0.5, borderRadius: '8px',
                              color: '#4f46e5',
                              bgcolor: alpha('#6366f1', 0.08),
                              border: `1px solid ${alpha('#6366f1', 0.2)}`,
                              '&:hover': {
                                bgcolor: alpha('#6366f1', 0.15),
                                borderColor: alpha('#6366f1', 0.4),
                              },
                            }}
                          >
                            Edit
                          </Button>
                        </Tooltip>

                        <Tooltip title="Change password" arrow>
                          <Button
                            size="small"
                            startIcon={<LockResetOutlinedIcon sx={{ fontSize: '13px !important' }} />}
                            onClick={() => navigate(`/users/password/${user._id}`)}
                            sx={{
                              textTransform: 'none', fontWeight: 600, fontSize: 12,
                              px: 1.5, py: 0.5, borderRadius: '8px',
                              color: '#0284c7',
                              bgcolor: alpha('#0ea5e9', 0.08),
                              border: `1px solid ${alpha('#0ea5e9', 0.2)}`,
                              '&:hover': {
                                bgcolor: alpha('#0ea5e9', 0.15),
                                borderColor: alpha('#0ea5e9', 0.4),
                              },
                            }}
                          >
                            Password
                          </Button>
                        </Tooltip>
                      </Stack>
                    </TableCell>

                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      </Box>
    </Page>
  )
}

export default Users
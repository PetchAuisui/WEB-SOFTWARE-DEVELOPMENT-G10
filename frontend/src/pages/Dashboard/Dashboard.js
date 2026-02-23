import React, { useState, useEffect } from 'react'
import Page from '../../containers/Page/Page'
import { useIntl } from 'react-intl'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Checkbox,
  Paper,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import SpeedIcon from '@mui/icons-material/Speed'
import DeleteIcon from '@mui/icons-material/Delete'
import SearchIcon from '@mui/icons-material/Search'

const runScript = (script) => {
  try {
    if (!script || !script.trim()) return null
    // eslint-disable-next-line no-new-func
    const func = new Function(`"use strict"; return (${script})`)
    return func()
  } catch (err) {
    return 'Error'
  }
}

const Dashboard = () => {
  const intl = useIntl()
  const navigate = useNavigate()
  const location = useLocation()

  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState([])
  const [tick, setTick] = useState(0)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')   // ✅ filter status
  const [filterType, setFilterType] = useState('All')       // ✅ filter type

  function getAuth() {
    let auth = null
    const item = localStorage.getItem('base-shell:auth')
    if (item) auth = JSON.parse(item)
    return auth
  }

  async function fetchDevices() {
    try {
      setLoading(true)
      const auth = getAuth()
      if (!auth) return

      const resp = await fetch('/api/preferences/readDocument', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'authorization': auth.token },
        body: JSON.stringify({
          collection: 'Device',
          query: {},
        })
      })

      const json = await resp.json()
      if (Array.isArray(json)) {
        setDevices(json)
        setSelected([])
      } else {
        setDevices([])
      }
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDevices()
  }, [location])

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(prev => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // ✅ ดึง type ที่มีอยู่จริงในข้อมูล (dynamic)
  const typeOptions = ['All', ...new Set(devices.map(d => d.type).filter(Boolean))]

  // ✅ filter ทั้ง search + status + type
  const filteredDevices = devices.filter(device => {
    const keyword = search.toLowerCase()
    const matchSearch =
      (device.name || '').toLowerCase().includes(keyword) ||
      (device.type || '').toLowerCase().includes(keyword) ||
      (device.status || '').toLowerCase().includes(keyword) ||
      (device._id || '').toLowerCase().includes(keyword)

    const matchStatus = filterStatus === 'All' || device.status === filterStatus
    const matchType = filterType === 'All' || device.type === filterType

    return matchSearch && matchStatus && matchType
  })

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(filteredDevices.map((n) => n._id))
      return
    }
    setSelected([])
  }

  const handleSelectOne = (event, id) => {
    event.stopPropagation()
    const selectedIndex = selected.indexOf(id)
    let newSelected = []
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      )
    }
    setSelected(newSelected)
  }

  const handleDeleteSelected = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selected.length} devices?`)) return
    const auth = getAuth()
    try {
      for (let id of selected) {
        await fetch('/api/preferences/deleteDocument', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'authorization': auth.token },
          body: JSON.stringify({
            collection: 'Device',
            query: { _id: id },
          })
        })
      }
      fetchDevices()
      alert('Deleted successfully')
    } catch (error) {
      console.error(error)
      alert('Delete failed')
    }
  }

  const handleClearFilter = () => {
    setSearch('')
    setFilterStatus('All')
    setFilterType('All')
  }

  const isFiltering = search || filterStatus !== 'All' || filterType !== 'All'

  return (
    <Page pageTitle={intl.formatMessage({ id: 'dashboard', defaultMessage: 'Dashboard' })}>
      <Box sx={{ padding: 3 }}>

        {/* Header & Toolbar */}
        <Paper
          elevation={1}
          sx={{
            mb: 3,
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: selected.length > 0 ? '#e3f2fd' : '#fff'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Checkbox
              color="primary"
              indeterminate={selected.length > 0 && selected.length < filteredDevices.length}
              checked={filteredDevices.length > 0 && selected.length === filteredDevices.length}
              onChange={handleSelectAll}
              disabled={filteredDevices.length === 0}
            />
            <Typography variant="h6" fontWeight="bold" sx={{ ml: 1 }}>
              {selected.length > 0
                ? `${selected.length} Selected`
                : `Connected Devices (${devices.length})`
              }
            </Typography>
          </Box>

          <Box>
            {selected.length > 0 ? (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteSelected}
                sx={{ mr: 2 }}
              >
                Delete Selected
              </Button>
            ) : (
              <Button
                variant="contained"
                color="success"
                size="large"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() => navigate('/dashboard/create')}
              >
                Add Device
              </Button>
            )}
          </Box>
        </Paper>

        {/* ✅ Search + Filter Bar */}
        <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">

            {/* Search */}
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search name, type, status, ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Filter Status */}
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="All">All Status</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                  <MenuItem value="Maintenance">Maintenance</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Filter Type */}
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={filterType}
                  label="Type"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  {typeOptions.map(t => (
                    <MenuItem key={t} value={t}>{t === 'All' ? 'All Types' : t}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Clear Button */}
            <Grid item xs={12} md={1}>
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                size="small"
                onClick={handleClearFilter}
                disabled={!isFiltering}
              >
                Clear
              </Button>
            </Grid>

          </Grid>

          {/* ✅ แสดงผลการค้นหา */}
          {isFiltering && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Showing {filteredDevices.length} of {devices.length} devices
            </Typography>
          )}
        </Paper>

        <Divider sx={{ mb: 4 }} />

        {/* Device Cards */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredDevices.map((device) => {
              const isSelected = selected.indexOf(device._id) !== -1
              const scriptResult = runScript(device.script)

              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={device._id}>
                  <Card
                    elevation={isSelected ? 4 : 2}
                    sx={{
                      height: '100%',
                      position: 'relative',
                      transition: '0.3s',
                      cursor: 'pointer',
                      '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 },
                      border: isSelected ? '2px solid #1976d2' : '1px solid #eee',
                      bgcolor: isSelected ? '#f5f9ff' : '#fff'
                    }}
                    onClick={() => navigate(`/dashboard/${device._id}`)}
                  >
                    <Box sx={{ position: 'absolute', top: 5, right: 5, zIndex: 10 }}>
                      <Checkbox
                        checked={isSelected}
                        onClick={(e) => handleSelectOne(e, device._id)}
                      />
                    </Box>

                    <CardContent sx={{ textAlign: 'center', p: 3, pt: 4 }}>
                      <SpeedIcon
                        sx={{
                          fontSize: 60,
                          color: device.status === 'Active' ? 'primary.main' : 'text.disabled',
                          mb: 2
                        }}
                      />
                      <Typography variant="h6" gutterBottom noWrap>
                        {device.name || 'Unnamed Device'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Type: {device.type || '-'}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          px: 1.5, py: 0.5,
                          borderRadius: 10,
                          fontWeight: 'bold',
                          bgcolor: device.status === 'Active' ? '#e8f5e9' : '#f5f5f5',
                          color: device.status === 'Active' ? '#2e7d32' : '#757575'
                        }}
                      >
                        {device.status || 'Unknown'}
                      </Typography>

                      <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          sx={{
                            color: scriptResult === 'Error' ? 'error.main' : 'primary.main'
                          }}
                        >
                          {scriptResult !== null ? String(scriptResult) : '-'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Current Value
                        </Typography>
                      </Box>

                    </CardContent>
                  </Card>
                </Grid>
              )
            })}

            {filteredDevices.length === 0 && (
              <Grid item xs={12}>
                <Box sx={{ p: 5, textAlign: 'center', border: '2px dashed #e0e0e0', borderRadius: 2, color: 'text.secondary' }}>
                  {isFiltering ? (
                    <>
                      <Typography variant="body1" gutterBottom>No devices match your search.</Typography>
                      <Button variant="outlined" onClick={handleClearFilter}>
                        Clear Filter
                      </Button>
                    </>
                  ) : (
                    <>
                      <Typography variant="body1" gutterBottom>No devices found.</Typography>
                      <Button variant="outlined" onClick={() => navigate('/dashboard/create')}>
                        Create your first device
                      </Button>
                    </>
                  )}
                </Box>
              </Grid>
            )}
          </Grid>
        )}
      </Box>
    </Page>
  )
}

export default Dashboard
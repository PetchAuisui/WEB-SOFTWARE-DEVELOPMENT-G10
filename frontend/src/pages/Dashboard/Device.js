import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Page from '../../containers/Page/Page'
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  Grid,
  MenuItem,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import StopIcon from '@mui/icons-material/Stop'
import DeleteIcon from '@mui/icons-material/Delete'

const jsexe = (code) => {
  try {
    // eslint-disable-next-line no-new-func
    const func = new Function(`"use strict"; return (${code})`)
    return func()
  } catch (error) {
    throw error
  }
}

const DevicePage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const isCreateMode = id === 'create'
  const collectionName = 'Device'

  const [loading, setLoading] = useState(!isCreateMode)
  const [saving, setSaving] = useState(false)

  const [device, setDevice] = useState({
    _id: '',
    name: '',
    type: 'Sensor',
    status: 'Active',
    script: '10 + 20 // ตัวอย่าง Script'
  })

  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [autoRun, setAutoRun] = useState(false) // ✅ เพิ่ม

  function getAuth() {
    let auth = null
    const item = localStorage.getItem('base-shell:auth')
    if (item) auth = JSON.parse(item)
    return auth
  }

  // --- 1. Fetch Data ---
  useEffect(() => {
    if (isCreateMode) return

    async function fetchData() {
      try {
        const auth = getAuth()
        if (!auth) return

        const resp = await fetch('/api/preferences/readDocument', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'authorization': auth.token },
          body: JSON.stringify({
            collection: collectionName,
            query: { _id: id },
          })
        })
        const json = await resp.json()

        if (json && json.length > 0) {
          setDevice(json[0])
        } else {
          alert('Device not found')
          navigate('/dashboard')
        }
      } catch (error) {
        console.error('Fetch error:', error)
        alert('Error fetching device data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, navigate, isCreateMode])

  // ✅ Auto Run interval
  useEffect(() => {
    if (!autoRun) return

    const interval = setInterval(() => {
      try {
        if (!device.script.trim()) return
        const output = jsexe(device.script)
        setResult(output)
        setError(null)
      } catch (err) {
        setError(err.message)
        setResult(null)
      }
    }, 1000) // รันทุก 1 วินาที

    return () => clearInterval(interval) // cleanup เมื่อหยุด
  }, [autoRun, device.script])

  // --- 2. Handle Change ---
  const handleChange = (e) => {
    const { name, value } = e.target
    setDevice(prev => ({ ...prev, [name]: value }))
  }

  // --- 3. Run Script ---
  const handleRunScript = () => {
    setError(null)
    setResult(null)
    try {
      if (!device.script.trim()) return
      const output = jsexe(device.script)
      setResult(output)
    } catch (err) {
      setError(err.message)
    }
  }

  // --- 4. Save Data ---
  const handleSave = async () => {
    try {
      if (!device._id || !device._id.trim()) {
        alert('Please enter Device ID')
        return
      }
      if (!device.name || !device.name.trim()) {
        alert('Please enter Device Name')
        return
      }

      setSaving(true)
      const auth = getAuth()

      const url = isCreateMode
        ? '/api/preferences/createDocument'
        : '/api/preferences/updateDocument'

      const body = {
        collection: collectionName,
        data: device,
      }

      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'authorization': auth.token },
        body: JSON.stringify(body)
      })

      const json = await resp.json()
      console.log('Save result:', json)

      if (json.error) throw new Error(json.error)

      alert('Saved successfully!')
      navigate('/dashboard')

    } catch (error) {
      console.error('Save error:', error)
      alert('Error saving data: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  // --- 5. Delete Data ---
  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${device.name}"?`)) return

    try {
      setSaving(true)
      const auth = getAuth()
      await fetch('/api/preferences/deleteDocument', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'authorization': auth.token },
        body: JSON.stringify({
          collection: collectionName,
          query: { _id: device._id }
        })
      })
      alert('Deleted successfully')
      navigate('/dashboard')
    } catch (error) {
      console.error('Delete error:', error)
      alert('Delete failed')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Page pageTitle="Loading...">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress />
        </Box>
      </Page>
    )
  }

  return (
    <Page pageTitle={isCreateMode ? 'Add New Device' : `Edit Device : ${device.name}`}>
      <Box sx={{ padding: 2, maxWidth: 1000, margin: '0 auto', pb: 10 }}>

        {/* Toolbar */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="text"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{ color: 'text.secondary' }}
          >
            Back to Dashboard
          </Button>

          {!isCreateMode && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
            >
              Delete Device
            </Button>
          )}
        </Box>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>

          {/* Section 1: Device Information */}
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3, color: 'primary.main' }}>
            Device Information
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Device ID"
                name="_id"
                value={device._id}
                onChange={handleChange}
                disabled={!isCreateMode}
                variant={isCreateMode ? 'outlined' : 'filled'}
                helperText={isCreateMode ? 'Must be unique' : 'ID cannot be changed'}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Status"
                name="status"
                value={device.status || 'Active'}
                onChange={handleChange}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Device Name"
                name="name"
                value={device.name || ''}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Type"
                name="type"
                value={device.type || ''}
                onChange={handleChange}
                placeholder="e.g. Sensor, Gateway, Relay"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Section 2: Script Editor */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ color: 'primary.main', mr: 1 }}>
              Script Editor
            </Typography>
            <Typography variant="caption" color="text.secondary">
              (JavaScript Execution Engine)
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Paper variant="outlined" sx={{ p: 0, overflow: 'hidden' }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={8}
                  maxRows={12}
                  variant="standard"
                  name="script"
                  value={device.script || ''}
                  onChange={handleChange}
                  placeholder="// Enter JavaScript code here..."
                  sx={{
                    p: 2,
                    bgcolor: '#fafafa',
                    fontFamily: 'monospace',
                    '& .MuiInputBase-input': { fontFamily: 'monospace', fontSize: '14px', lineHeight: 1.6 }
                  }}
                  InputProps={{ disableUnderline: true }}
                />
              </Paper>

              {/* ✅ ปุ่ม Run Script และ Auto Run */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, gap: 1 }}>
                <Button
                  variant={autoRun ? 'contained' : 'outlined'}
                  color={autoRun ? 'error' : 'success'}
                  size="small"
                  startIcon={autoRun ? <StopIcon /> : <PlayArrowIcon />}
                  onClick={() => setAutoRun(prev => !prev)}
                >
                  {autoRun ? 'Stop' : 'Auto Run'}
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  height: '100%',
                  bgcolor: '#282c34',
                  color: '#fff',
                  minHeight: '200px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, borderBottom: '1px solid #3e4451', pb: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: '#abb2bf' }}>
                    Console Output:
                  </Typography>
                  {/* ✅ แสดงสถานะ Auto Run */}
                  {autoRun && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#98c379', animation: 'pulse 1s infinite' }} />
                      <Typography variant="caption" sx={{ color: '#98c379' }}>Live</Typography>
                    </Box>
                  )}
                </Box>

                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {error ? (
                    <Alert severity="error" variant="filled" sx={{ width: '100%' }}>
                      {error}
                    </Alert>
                  ) : result !== null ? (
                    <Typography variant="h4" sx={{ color: '#98c379', fontWeight: 'bold', wordBreak: 'break-all' }}>
                      {String(result)}
                    </Typography>
                  ) : (
                    <Typography variant="body2" sx={{ color: '#5c6370', fontStyle: 'italic' }}>
                      Waiting for execution...
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/dashboard')}
              sx={{ px: 4 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving}
              sx={{ px: 5 }}
            >
              {saving ? 'Saving...' : 'Save Device'}
            </Button>
          </Box>

        </Paper>
      </Box>
    </Page>
  )
}

export default DevicePage
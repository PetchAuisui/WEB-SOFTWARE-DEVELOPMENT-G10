import React, { useState, useEffect, useRef } from 'react'
import Page from '../../containers/Page/Page'
import { useIntl } from 'react-intl'
import {
  Box, Button, Typography, Divider, CircularProgress, Checkbox,
  Paper, Chip, IconButton, Tooltip, Alert, Snackbar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Select, MenuItem, FormControl, InputLabel,
  FormControlLabel, Grid, alpha,
  Accordion, AccordionSummary, AccordionDetails,
  Tabs, Tab,
} from '@mui/material'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import DeleteIcon            from '@mui/icons-material/Delete'
import ArrowBackIcon         from '@mui/icons-material/ArrowBack'
import RefreshIcon           from '@mui/icons-material/Refresh'
import SaveIcon              from '@mui/icons-material/Save'
import EditIcon              from '@mui/icons-material/Edit'
import ExpandMoreIcon        from '@mui/icons-material/ExpandMore'
import PlayArrowIcon         from '@mui/icons-material/PlayArrow'
import CheckCircleIcon       from '@mui/icons-material/CheckCircle'
import AddIcon               from '@mui/icons-material/Add'
import RouterIcon            from '@mui/icons-material/Router'
import DashboardIcon         from '@mui/icons-material/Dashboard'
import DevicesIcon           from '@mui/icons-material/Devices'
import {
  ComposedChart, Line, Bar, Area,
  XAxis, YAxis, CartesianGrid, Tooltip as ReTip,
  Legend, ResponsiveContainer,
} from 'recharts'

// ─── constants & helpers ──────────────────────────────────────────────────────
const COLLECTION = 'Device'
const COLORS = ['#1976d2','#29b6f6','#43a047','#fb8c00','#8e24aa','#e53935','#00897b','#f4511e']

function getAuth() {
  const item = localStorage.getItem('base-shell:auth')
  return item ? JSON.parse(item) : null
}
async function jsexe(code) {
  const fn = new Function(`return (${code})`)
  const r  = fn()
  return r instanceof Promise ? await r : r
}
function statusColor(s) {
  if (s === 'Active')      return { bgcolor: '#e8f5e9', color: '#2e7d32' }
  if (s === 'Maintenance') return { bgcolor: '#fff3e0', color: '#e65100' }
  return { bgcolor: '#f5f5f5', color: '#757575' }
}

const newTag = (n = 1) => ({
  label: `tag${n}`,
  script: `(async () => { return Math.floor(Math.random() * 100) })()`,
  updateInterval: '1min',
  record: true, sync: false, api: false, line: false, email: false,
  alarm: 'Off', spLow: '25', spHigh: '75', critical: 'Low',
  title: '', alert: '', description: '',
  x: 80 + n * 20, y: 80 + n * 20,
})
const newDevice = () => ({
  _id: '', code: '0', connection: 'Virtual', model: 'Virtual',
  ipAddr: '', name: '', remark: '', apiCode: '',
  lineChannel: '', lineId: '', emailFrom: '', emailPwd: '', emailTo: '',
  status: 'Active', revision: 1, tags: [newTag(1)],
})
const fsx = {
  size: 'small', fullWidth: true,
  InputLabelProps: { shrink: true },
  sx: {
    '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 13, bgcolor: '#f9f9f9' },
    '& .MuiInputLabel-root': { fontSize: 13 },
  },
}

// ════════════════════════════════════════════════════════════════════════════
// TAG ROW (accordion)
// ════════════════════════════════════════════════════════════════════════════
const TagRow = ({ tag, index, result, error, onChange, onDelete, onRun }) => {
  const val     = result?.value
  const history = result?.history || []
  const sf  = f => e => onChange(index, f, e.target.value)
  const scb = f => e => onChange(index, f, e.target.checked)

  return (
    <Accordion disableGutters elevation={0}
      sx={{ border: '1px solid #e8e8e8', mb: 1, borderRadius: '8px !important', '&:before': { display: 'none' } }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}
        sx={{ px: 2, minHeight: 48, '&.Mui-expanded': { minHeight: 48 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
          <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50', flexShrink: 0 }} />
          <Typography fontWeight={700} fontSize={13} sx={{ minWidth: 80 }}>
            {tag.label || `tag${index + 1}`}
          </Typography>
          <Typography sx={{ color: '#1976d2', fontWeight: 800, fontSize: 15, minWidth: 80 }}>
            {val != null ? val : <span style={{ color: '#ccc' }}>—</span>}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          {['record','sync','api'].map(f => (
            <FormControlLabel key={f} onClick={e => e.stopPropagation()} sx={{ mr: 0 }}
              control={<Checkbox size="small" checked={!!tag[f]} onChange={scb(f)} sx={{ p: 0.3 }}
                color={f === 'record' ? 'success' : f === 'sync' ? 'primary' : 'default'} />}
              label={<Typography sx={{ fontSize: 10, textTransform: 'uppercase', color: '#888' }}>{f}</Typography>}
            />
          ))}
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 2.5, pt: 1.5, borderTop: '1px solid #f0f0f0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
          <Button size="small" color="error" variant="outlined" onClick={() => onDelete(index)}>Delete Tag</Button>
        </Box>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={3}><TextField {...fsx} label="Label" value={tag.label || ''} onChange={sf('label')} /></Grid>
          <Grid item xs={3}>
            <TextField select {...fsx} label="Update Interval" value={tag.updateInterval || '1min'} onChange={sf('updateInterval')}>
              {['1min','daily','week','month','year'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            {['record','sync','api','line','email'].map(f => (
              <FormControlLabel key={f}
                control={<Checkbox size="small" checked={!!tag[f]} onChange={scb(f)} />}
                label={<Typography variant="caption" sx={{ textTransform: 'uppercase' }}>{f}</Typography>}
              />
            ))}
          </Grid>
        </Grid>
        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Script Engine</Typography>
        <TextField fullWidth multiline minRows={3} size="small" value={tag.script || ''} onChange={sf('script')}
          sx={{ mb: 1, '& .MuiOutlinedInput-root': { bgcolor: '#1e1e2e', borderRadius: 2 }, '& textarea': { fontFamily: 'monospace', fontSize: 13, color: '#cdd6f4' } }}
        />
        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Console Output</Typography>
        <Box sx={{ p: 1.5, bgcolor: '#1e1e2e', borderRadius: 2, minHeight: 48, mb: 2, display: 'flex', alignItems: 'center' }}>
          {error
            ? <Typography sx={{ fontFamily: 'monospace', fontSize: 13, color: '#f38ba8' }}>{error}</Typography>
            : val != null
              ? <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 16, color: '#a6e3a1' }}>{val}</Typography>
              : <Typography sx={{ fontFamily: 'monospace', fontSize: 12, color: '#585b70' }}>Waiting...</Typography>
          }
        </Box>
        <Divider sx={{ mb: 2 }}><Typography variant="caption" color="text.secondary">Alarm Settings</Typography></Divider>
        <Grid container spacing={2}>
          <Grid item xs={2}><TextField select {...fsx} label="Alarm" value={tag.alarm||'Off'} onChange={sf('alarm')}><MenuItem value="Off">Off</MenuItem><MenuItem value="On">On</MenuItem></TextField></Grid>
          <Grid item xs={2}><TextField {...fsx} label="SP Low"  value={tag.spLow  ||''} onChange={sf('spLow')} /></Grid>
          <Grid item xs={2}><TextField {...fsx} label="SP High" value={tag.spHigh ||''} onChange={sf('spHigh')} /></Grid>
          <Grid item xs={2}><TextField select {...fsx} label="Critical" value={tag.critical||'Low'} onChange={sf('critical')}><MenuItem value="Low">Low</MenuItem><MenuItem value="High">High</MenuItem></TextField></Grid>
          <Grid item xs={4}><TextField {...fsx} label="Title"       value={tag.title      ||''} onChange={sf('title')} /></Grid>
          <Grid item xs={6}><TextField {...fsx} label="Alert"       value={tag.alert      ||''} onChange={sf('alert')} /></Grid>
          <Grid item xs={6}><TextField {...fsx} label="Description" value={tag.description||''} onChange={sf('description')} /></Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// EDIT PANEL
// ════════════════════════════════════════════════════════════════════════════
const EditPanel = ({ initDevice, isCreate, onBack, onSaved }) => {
  const [dev,        setDev]        = useState({ ...newDevice(), ...initDevice, tags: initDevice?.tags?.length ? initDevice.tags : [newTag(1)] })
  const [tagResults, setTagResults] = useState({})
  const [tagErrors,  setTagErrors]  = useState({})
  const [saving,     setSaving]     = useState(false)
  const [err,        setErr]        = useState('')
  const devRef = useRef(dev)
  useEffect(() => { devRef.current = dev }, [dev])

  useEffect(() => {
    let alive = true
    const tick = async () => {
      const tags = devRef.current.tags || []
      await Promise.all(tags.map(async (tag, i) => {
        if (!tag.script?.trim()) return
        try {
          const raw = await jsexe(tag.script)
          const value = String(raw)
          if (!alive) return
          const pt = { time: new Date().toLocaleTimeString(), value: parseFloat(value) || 0 }
          setTagResults(prev => { const old = prev[i] || { value: null, history: [] }; return { ...prev, [i]: { value, history: [...old.history, pt].slice(-30) } } })
          setTagErrors(prev => ({ ...prev, [i]: null }))
        } catch (e) { if (!alive) return; setTagErrors(prev => ({ ...prev, [i]: e.message })) }
      }))
    }
    const t = setInterval(tick, 1000); tick()
    return () => { alive = false; clearInterval(t) }
  }, [])

  const sf = f => e => setDev(d => ({ ...d, [f]: e.target.value }))
  const onTagChange = (idx, field, val) => setDev(d => { const tags = [...d.tags]; tags[idx] = { ...tags[idx], [field]: val }; return { ...d, tags } })
  const onTagDelete = (idx) => {
    if (!window.confirm(`ลบ Tag ${idx + 1}?`)) return
    setDev(d => ({ ...d, tags: d.tags.filter((_, i) => i !== idx) }))
    setTagResults(p => { const n = { ...p }; delete n[idx]; return n })
    setTagErrors(p =>  { const n = { ...p }; delete n[idx]; return n })
  }
  const onTagRun = async (idx) => {
    const code = devRef.current.tags[idx]?.script
    if (!code?.trim()) return
    setTagErrors(p => ({ ...p, [idx]: null }))
    try {
      const raw = await jsexe(code); const value = String(raw)
      const pt = { time: new Date().toLocaleTimeString(), value: parseFloat(value) || 0 }
      setTagResults(p => { const old = p[idx] || { value: null, history: [] }; return { ...p, [idx]: { value, history: [...old.history, pt].slice(-30) } } })
    } catch (e) { setTagErrors(p => ({ ...p, [idx]: e.message })) }
  }

  const handleSave = async () => {
    if (!dev._id?.trim())  { setErr('กรุณากรอก Device ID');   return }
    if (!dev.name?.trim()) { setErr('กรุณากรอก Device Name'); return }
    setErr(''); setSaving(true)
    try {
      const auth = getAuth()
      if (isCreate) {
        const r = await fetch('/api/preferences/readDocument', {
          method: 'POST', headers: { 'Content-Type': 'application/json', authorization: auth.token },
          body: JSON.stringify({ collection: COLLECTION, query: { _id: dev._id } }),
        })
        const j = await r.json()
        if (Array.isArray(j) && j.length > 0) { setErr(`Device ID "${dev._id}" มีอยู่แล้ว`); setSaving(false); return }
      }
      const url  = isCreate ? '/api/preferences/createDocument' : '/api/preferences/updateDocument'
      const data = { ...dev, revision: isCreate ? 1 : (Number(dev.revision) || 1) + 1 }
      const resp = await fetch(url, {
        method: 'POST', headers: { 'Content-Type': 'application/json', authorization: auth.token },
        body: JSON.stringify({ collection: COLLECTION, data }),
      })
      const text = await resp.text()
      console.log('[Dashboard] save →', resp.status, text)
      let json = {}; try { json = JSON.parse(text) } catch {}
      if (!resp.ok || json.error) throw new Error(json.error || json.message || `HTTP ${resp.status}`)
      onSaved(data)
    } catch (e) { setErr(e.message) }
    finally { setSaving(false) }
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5, gap: 1.5 }}>
        <IconButton size="small" onClick={onBack}><ArrowBackIcon /></IconButton>
        <Typography variant="h6" fontWeight={700}>{isCreate ? 'Add New Device' : `Edit Device — ${dev._id}`}</Typography>
        {!isCreate && <Chip size="small" label={`Rev #${dev.revision || 1}`} sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 700 }} />}
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="outlined" size="small" onClick={onBack} sx={{ mr: 1 }}>Cancel</Button>
        <Button variant="contained" size="small"
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />}
          onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'SAVE'}
        </Button>
      </Box>
      {err && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErr('')}>{err}</Alert>}

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #eee', mb: 3 }}>
        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ letterSpacing: 1, textTransform: 'uppercase', display: 'block', mb: 2 }}>Device Information</Typography>
        <Grid container spacing={2} sx={{ mb: 1.5 }}>
          <Grid item xs={2}><TextField {...fsx} label="Device ID *"  value={dev._id        ||''} onChange={sf('_id')}       disabled={!isCreate} /></Grid>
          <Grid item xs={2}><TextField {...fsx} label="Code"         value={dev.code       ||''} onChange={sf('code')} /></Grid>
          <Grid item xs={3}><TextField {...fsx} label="Connection"   value={dev.connection ||''} onChange={sf('connection')} /></Grid>
          <Grid item xs={3}><TextField {...fsx} label="Model"        value={dev.model      ||''} onChange={sf('model')} /></Grid>
          <Grid item xs={2}><TextField {...fsx} label="IP Addr/Port" value={dev.ipAddr     ||''} onChange={sf('ipAddr')} /></Grid>
        </Grid>
        <Grid container spacing={2} sx={{ mb: 1.5 }}>
          <Grid item xs={4}><TextField {...fsx} label="Device Name *" value={dev.name   ||''} onChange={sf('name')} /></Grid>
          <Grid item xs={6}><TextField {...fsx} label="Remark"        value={dev.remark ||''} onChange={sf('remark')} /></Grid>
          <Grid item xs={2}><TextField {...fsx} label="API Code"      value={dev.apiCode||''} onChange={sf('apiCode')} /></Grid>
        </Grid>
        <Grid container spacing={2} sx={{ mb: 1.5 }}>
          <Grid item xs={6}><TextField {...fsx} label="Line Channel" value={dev.lineChannel||''} onChange={sf('lineChannel')} /></Grid>
          <Grid item xs={6}><TextField {...fsx} label="Line ID"      value={dev.lineId     ||''} onChange={sf('lineId')} /></Grid>
        </Grid>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={4}><TextField {...fsx} label="Email From"     value={dev.emailFrom||''} onChange={sf('emailFrom')} /></Grid>
          <Grid item xs={4}><TextField {...fsx} label="Email Password" type="password" value={dev.emailPwd||''} onChange={sf('emailPwd')} /></Grid>
          <Grid item xs={4}><TextField {...fsx} label="Email To"       value={dev.emailTo  ||''} onChange={sf('emailTo')} /></Grid>
        </Grid>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={3}>
            <FormControl {...fsx}><InputLabel>Status</InputLabel>
              <Select value={dev.status||'Active'} label="Status" onChange={sf('status')}>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={9} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {['Stop','Record','Sync','API'].map(lbl => (
              <FormControlLabel key={lbl} control={<Checkbox size="small" defaultChecked={lbl==='Record'} />} label={<Typography variant="body2">{lbl}</Typography>} />
            ))}
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="subtitle1" fontWeight={700}>Tags Configuration</Typography>
        <Chip size="small" label={`${dev.tags.length} tags`} sx={{ ml: 1 }} />
        <Box sx={{ flexGrow: 1 }} />
        <Button size="small" variant="outlined" startIcon={<AddIcon />}
          onClick={() => setDev(d => ({ ...d, tags: [...d.tags, newTag(d.tags.length + 1)] }))}>Add Tag</Button>
      </Box>
      {dev.tags.map((tag, i) => (
        <TagRow key={i} tag={tag} index={i} result={tagResults[i]} error={tagErrors[i]}
          onChange={onTagChange} onDelete={onTagDelete} onRun={onTagRun} />
      ))}
    </Box>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// DASHBOARD TAB — live widgets + mixed chart
// ════════════════════════════════════════════════════════════════════════════
const DashboardView = ({ devices }) => {
  // ── charts management ────────────────────────────────────────────────────
  const [charts,   setCharts]   = useState([])   // [{ id, name, series[], chartType, chartData[] }]
  const [widgets,  setWidgets]  = useState([])   // [{ key, label, color }]
  const [liveVals, setLiveVals] = useState({})   // { 'deviceId/tagLabel': { value, history } }

  // ── add series dialog state ───────────────────────────────────────────────
  const [selDevice,  setSelDevice]  = useState('')
  const [selTag,     setSelTag]     = useState('')
  const [chartType,  setChartType]  = useState('line')  // line | bar | area
  const [chartName,  setChartName]  = useState('')
  
  // ── add series to chart state (separate from chart creation) ──────────────
  const [addSeriesDevice, setAddSeriesDevice] = useState('')
  const [addSeriesTag,    setAddSeriesTag]    = useState('')
  
  // ── editing state ─────────────────────────────────────────────────────────
  const [editingChartName, setEditingChartName] = useState(null)
  const [editingSeries,    setEditingSeries]    = useState(null)
  const [editChartName,    setEditChartName]    = useState('')
  const [editSeriesDevice, setEditSeriesDevice] = useState('')
  const [editSeriesTag,    setEditSeriesTag]    = useState('')

  const availableTags = selDevice
    ? (devices.find(d => d._id === selDevice)?.tags || []).map(t => t.label).filter(Boolean)
    : []
  
  const availableTagsForSeries = addSeriesDevice
    ? (devices.find(d => d._id === addSeriesDevice)?.tags || []).map(t => t.label).filter(Boolean)
    : []
  
  const availableTagsForEdit = editSeriesDevice
    ? (devices.find(d => d._id === editSeriesDevice)?.tags || []).map(t => t.label).filter(Boolean)
    : []

  // ── Load charts from localStorage on mount ────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem('dashboard:charts')
      if (saved) {
        const parsed = JSON.parse(saved)
        setCharts(parsed)
        const allWidgets = parsed.flatMap(c => 
          c.series.map(s => ({ key: s.key, label: s.label, color: s.color }))
        )
        setWidgets(allWidgets)
      }
    } catch (err) {
      console.error('Failed to load charts:', err)
    }
  }, [])

  // ── Save charts to localStorage whenever they change ─────────────────────
  useEffect(() => {
    try {
      if (charts.length > 0) {
        localStorage.setItem('dashboard:charts', JSON.stringify(charts))
      }
    } catch (err) {
      console.error('Failed to save charts:', err)
    }
  }, [charts])

  const createNewChart = () => {
    if (!selDevice || !selTag || !chartName.trim()) return
    const key = `${selDevice}/${selTag}`
    const dev   = devices.find(d => d._id === selDevice)
    const color = COLORS[charts.length % COLORS.length]
    const label = `${dev?.name || selDevice} / ${selTag}`
    
    const newChart = {
      id: Date.now() + Math.random(),
      name: chartName,
      chartType,
      series: [{ key, deviceId: selDevice, tagLabel: selTag, label, color }],
      chartData: [],
    }
    setCharts(p => [...p, newChart])
    setWidgets(p => [...p, { key, label, color }])
    
    // Reset form
    setChartName('')
    setSelDevice('')
    setSelTag('')
    setChartType('line')
  }

  const addSeriesToChart = (chartId) => {
    if (!addSeriesDevice || !addSeriesTag) return
    const key = `${addSeriesDevice}/${addSeriesTag}`
    
    setCharts(prev => prev.map(c => {
      if (c.id !== chartId) return c
      if (c.series.find(s => s.key === key)) return c
      
      const dev   = devices.find(d => d._id === addSeriesDevice)
      const color = COLORS[c.series.length % COLORS.length]
      const label = `${dev?.name || addSeriesDevice} / ${addSeriesTag}`
      
      const newSeries = { key, deviceId: addSeriesDevice, tagLabel: addSeriesTag, label, color }
      setWidgets(p => [...p, { key, label, color }])
      
      return { ...c, series: [...c.series, newSeries] }
    }))
    setAddSeriesDevice('')
    setAddSeriesTag('')
  }

  const removeSeries = (chartId, seriesKey) => {
    setCharts(prev => prev.map(c => {
      if (c.id !== chartId) return c
      return { ...c, series: c.series.filter(s => s.key !== seriesKey) }
    }))
    setWidgets(p => p.filter(w => w.key !== seriesKey))
  }

  const deleteChart = (chartId) => {
    const chart = charts.find(c => c.id === chartId)
    if (!chart) return
    setCharts(prev => prev.filter(c => c.id !== chartId))
    chart.series.forEach(s => {
      setWidgets(p => p.filter(w => w.key !== s.key))
    })
  }

  const changeSeriesColor = (chartId, seriesKey, newColor) => {
    setCharts(prev => prev.map(c => {
      if (c.id !== chartId) return c
      return {
        ...c,
        series: c.series.map(s => 
          s.key === seriesKey ? { ...s, color: newColor } : s
        )
      }
    }))
    setWidgets(p => p.map(w => 
      w.key === seriesKey ? { ...w, color: newColor } : w
    ))
  }

  const startEditChartName = (chartId, currentName) => {
    setEditingChartName(chartId)
    setEditChartName(currentName)
  }

  const saveChartName = (chartId) => {
    if (!editChartName.trim()) return
    setCharts(prev => prev.map(c => 
      c.id === chartId ? { ...c, name: editChartName.trim() } : c
    ))
    setEditingChartName(null)
    setEditChartName('')
  }

  const cancelEditChartName = () => {
    setEditingChartName(null)
    setEditChartName('')
  }

  const startEditSeries = (chartId, seriesKey, deviceId, tagLabel) => {
    setEditingSeries(seriesKey)
    setEditSeriesDevice(deviceId)
    setEditSeriesTag(tagLabel)
  }

  const saveSeriesEdit = (chartId, seriesKey) => {
    if (!editSeriesDevice || !editSeriesTag) return
    
    const newKey = `${editSeriesDevice}/${editSeriesTag}`
    const dev = devices.find(d => d._id === editSeriesDevice)
    const newLabel = `${dev?.name || editSeriesDevice} / ${editSeriesTag}`
    
    setCharts(prev => prev.map(c => {
      if (c.id !== chartId) return c
      return {
        ...c,
        series: c.series.map(s => 
          s.key === seriesKey ? { ...s, key: newKey, deviceId: editSeriesDevice, tagLabel: editSeriesTag, label: newLabel } : s
        )
      }
    }))
    
    // Update widgets
    setWidgets(p => p.map(w => 
      w.key === seriesKey ? { ...w, key: newKey, label: newLabel } : w
    ))
    
    setEditingSeries(null)
    setEditSeriesDevice('')
    setEditSeriesTag('')
  }

  const cancelSeriesEdit = () => {
    setEditingSeries(null)
    setEditSeriesDevice('')
    setEditSeriesTag('')
  }

  const changeChartType = (chartId, newType) => {
    setCharts(prev => prev.map(c => 
      c.id === chartId ? { ...c, chartType: newType } : c
    ))
  }

  // ── run scripts for all selected tags every 1s ───────────────────────────
  const chartsRef = useRef(charts)
  useEffect(() => { chartsRef.current = charts }, [charts])

  useEffect(() => {
    if (!devices.length) return
    let alive = true
    const tick = async () => {
      const curCharts = chartsRef.current
      if (!curCharts.length) return
      
      const updates = {}
      await Promise.all(curCharts.flatMap(c => 
        c.series.map(async (s) => {
          const dev = devices.find(d => d._id === s.deviceId)
          const tag = dev?.tags?.find(t => t.label === s.tagLabel)
          if (!tag?.script) return
          try {
            const raw   = await jsexe(tag.script)
            const value = parseFloat(String(raw)) || 0
            if (!alive) return
            updates[s.key] = value
            setLiveVals(prev => {
              const old = prev[s.key] || { value: null, history: [] }
              const pt  = { time: new Date().toLocaleTimeString(), value }
              return { ...prev, [s.key]: { value: String(value), history: [...old.history, pt].slice(-60) } }
            })
          } catch {}
        })
      ))
      
      if (!alive || !Object.keys(updates).length) return
      
      // Update chart data for each chart
      setCharts(prev => prev.map(c => {
        const pt = { time: new Date().toLocaleTimeString() }
        c.series.forEach(s => { if (updates[s.key] != null) pt[s.label] = updates[s.key] })
        return { ...c, chartData: [...c.chartData, pt].slice(-60) }
      }))
    }
    const t = setInterval(tick, 1000); tick()
    return () => { alive = false; clearInterval(t) }
  }, [devices]) // eslint-disable-line

  // ── value card color ──────────────────────────────────────────────────────
  const valCardSx = (color) => ({
    p: 2.5, borderRadius: 3, border: `2px solid ${color}`,
    background: `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, #fff 100%)`,
    minWidth: 160,
  })

  return (
    <Box sx={{ p: 3 }}>
      {/* ── Create Chart Form ── */}
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #eee', bgcolor: '#f9f9f9', mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={700} color="text.secondary"
          sx={{ letterSpacing: 1, textTransform: 'uppercase', mb: 2 }}>
          สร้างกราฟใหม่
        </Typography>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={2}>
            <TextField 
              fullWidth size="small" label="Chart Name *" placeholder="e.g. Temperature"
              value={chartName} onChange={e => setChartName(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff' } }}
            />
          </Grid>
          <Grid item xs={12} sm={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Device</InputLabel>
              <Select value={selDevice} label="Device" onChange={e => { setSelDevice(e.target.value); setSelTag('') }}
                sx={{ borderRadius: 2, bgcolor: '#fff' }}>
                {devices.map(d => <MenuItem key={d._id} value={d._id}>{d.name || d._id}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small" disabled={!selDevice}>
              <InputLabel>Tag</InputLabel>
              <Select value={selTag} label="Tag" onChange={e => setSelTag(e.target.value)}
                sx={{ borderRadius: 2, bgcolor: '#fff' }}>
                {availableTags.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select value={chartType} label="Type" onChange={e => setChartType(e.target.value)}
                sx={{ borderRadius: 2, bgcolor: '#fff' }}>
                <MenuItem value="line">Line</MenuItem>
                <MenuItem value="bar">Bar</MenuItem>
                <MenuItem value="area">Area</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button fullWidth variant="contained" color="success" startIcon={<AddIcon />}
              onClick={createNewChart} disabled={!selDevice || !selTag || !chartName.trim()}>
              Create Chart
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* ── Value Widgets ── */}
      {widgets.length > 0 && (
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
          {widgets.map(w => {
            const live = liveVals[w.key]
            const history = live?.history || []
            const val  = live?.value
            const nums = history.map(h => h.value).filter(v => !isNaN(v))
            const max  = nums.length ? Math.max(...nums).toFixed(1) : '—'
            const min  = nums.length ? Math.min(...nums).toFixed(1) : '—'
            const avg  = nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1) : '—'
            return (
              <Paper key={w.key} elevation={0} sx={{
                p: 2.5, borderRadius: 3, border: `2px solid ${w.color}`,
                background: `linear-gradient(135deg, ${alpha(w.color, 0.08)} 0%, #fff 100%)`,
                minWidth: 160,
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" noWrap sx={{ maxWidth: 140 }}>
                    {w.label}
                  </Typography>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: w.color, mt: 0.3, flexShrink: 0 }} />
                </Box>
                <Typography sx={{ fontSize: 36, fontWeight: 800, color: w.color, lineHeight: 1.1, my: 0.5 }}>
                  {val != null ? val : <CircularProgress size={24} sx={{ color: w.color }} />}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                  {[['Max', max], ['Min', min], ['Avg', avg]].map(([l, v]) => (
                    <Box key={l}>
                      <Typography variant="caption" color="text.secondary">{l}</Typography>
                      <Typography variant="body2" fontWeight={700}>{v}</Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            )
          })}
        </Box>
      )}

      {/* ── Charts ── */}
      {charts.length === 0 ? (
        <Box sx={{ p: 8, textAlign: 'center', border: '2px dashed #e0e0e0', borderRadius: 3, color: 'text.secondary' }}>
          <DashboardIcon sx={{ fontSize: 56, mb: 2, opacity: 0.2 }} />
          <Typography fontWeight={600} sx={{ mb: 1 }}>ยังไม่มีกราฟ</Typography>
          <Typography variant="caption">สร้างกราฟจากฟอร์มด้านบน</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
          {charts.map(chart => (
            <Paper key={chart.id} elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #eee' }}>
              {/* Chart header */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 200 }}>
                  {editingChartName === chart.id ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                      <TextField
                        size="small"
                        value={editChartName}
                        onChange={e => setEditChartName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') saveChartName(chart.id)
                          if (e.key === 'Escape') cancelEditChartName()
                        }}
                        sx={{ flex: 1, '& .MuiOutlinedInput-root': { fontSize: 16, fontWeight: 700 } }}
                        autoFocus
                      />
                      <IconButton size="small" onClick={() => saveChartName(chart.id)} sx={{ color: '#2e7d32' }}>
                        <CheckCircleIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={cancelEditChartName} sx={{ color: '#d32f2f' }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : (
                    <>
                      <Typography variant="subtitle1" fontWeight={700} sx={{ cursor: 'pointer' }} onClick={() => startEditChartName(chart.id, chart.name)}>
                        {chart.name}
                      </Typography>
                      <EditIcon sx={{ fontSize: 16, color: 'text.secondary', cursor: 'pointer', ml: 0.5 }} onClick={() => startEditChartName(chart.id, chart.name)} />
                    </>
                  )}
                  <Chip size="small" label={`${chart.series.length} series`} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <InputLabel>Chart Type</InputLabel>
                    <Select value={chart.chartType || 'line'} label="Chart Type" onChange={e => changeChartType(chart.id, e.target.value)}>
                      <MenuItem value="line">Line</MenuItem>
                      <MenuItem value="bar">Bar</MenuItem>
                      <MenuItem value="area">Area</MenuItem>
                    </Select>
                  </FormControl>
                  <Tooltip title="Delete Chart">
                    <IconButton size="small" onClick={() => deleteChart(chart.id)} sx={{ color: '#d32f2f' }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Series management */}
              <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="caption" fontWeight={700} sx={{ display: 'block', mb: 1 }}>Series</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5, alignItems: 'center' }}>
                  {chart.series.map(s => (
                    editingSeries === s.key ? (
                      <Box key={s.key} sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#fff', p: 1, borderRadius: 1, border: '1px solid #ddd', minWidth: 300 }}>
                        <Box component="input" type="color" value={s.color} onChange={e => changeSeriesColor(chart.id, s.key, e.target.value)} 
                          sx={{ width: 28, height: 28, border: 'none', borderRadius: '4px', cursor: 'pointer', p: 0 }} />
                        <FormControl size="small" sx={{ minWidth: 100, flex: 1 }}>
                          <InputLabel>Device</InputLabel>
                          <Select value={editSeriesDevice} label="Device" onChange={e => { setEditSeriesDevice(e.target.value); setEditSeriesTag('') }}>
                            {devices.map(d => <MenuItem key={d._id} value={d._id}>{d.name || d._id}</MenuItem>)}
                          </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 100, flex: 1 }} disabled={!editSeriesDevice}>
                          <InputLabel>Tag</InputLabel>
                          <Select value={editSeriesTag} label="Tag" onChange={e => setEditSeriesTag(e.target.value)}>
                            {availableTagsForEdit.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                          </Select>
                        </FormControl>
                        <IconButton size="small" onClick={() => saveSeriesEdit(chart.id, s.key)} sx={{ color: '#2e7d32' }}>
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={cancelSeriesEdit} sx={{ color: '#d32f2f' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ) : (
                      <Box key={s.key} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#fff', p: 0.5, borderRadius: 1, border: '1px solid #ddd' }}>
                        <Box component="input" type="color" value={s.color} onChange={e => changeSeriesColor(chart.id, s.key, e.target.value)} 
                          sx={{ width: 28, height: 28, border: 'none', borderRadius: '4px', cursor: 'pointer', p: 0 }} />
                        <Typography variant="caption" sx={{ fontSize: 12, fontWeight: 600, maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {s.label}
                        </Typography>
                        <IconButton size="small" onClick={() => startEditSeries(chart.id, s.key, s.deviceId, s.tagLabel)} sx={{ p: 0.3, color: '#1976d2', '&:hover': { bgcolor: alpha('#1976d2', 0.1) } }}>
                          <EditIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                        <IconButton size="small" onClick={() => removeSeries(chart.id, s.key)} sx={{ p: 0.3, color: '#d32f2f', '&:hover': { bgcolor: alpha('#d32f2f', 0.1) } }}>
                          <DeleteIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Box>
                    )
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                  <FormControl size="small" sx={{ minWidth: 100, flex: 0.5 }}>
                    <InputLabel>Device</InputLabel>
                    <Select 
                      value={addSeriesDevice} 
                      label="Device" 
                      onChange={e => { setAddSeriesDevice(e.target.value); setAddSeriesTag('') }}
                    >
                      {devices.map(d => <MenuItem key={d._id} value={d._id}>{d.name || d._id}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 100, flex: 1 }} disabled={!addSeriesDevice}>
                    <InputLabel>Tag</InputLabel>
                    <Select 
                      value={addSeriesTag} 
                      label="Tag" 
                      onChange={e => setAddSeriesTag(e.target.value)}
                    >
                      {availableTagsForSeries.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <Button 
                    size="small" 
                    variant="outlined"
                    onClick={() => addSeriesToChart(chart.id)}
                    disabled={!addSeriesTag}
                  >
                    Add
                  </Button>
                </Box>
              </Box>

              {/* Chart */}
              {chart.series.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250, color: 'text.secondary' }}>
                  <Typography variant="body2">No series selected</Typography>
                </Box>
              ) : chart.chartData.length < 2 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <ComposedChart data={chart.chartData} margin={{ top: 4, right: 15, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="time" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10 }} width={32} />
                    <ReTip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    {chart.series.map((s) => {
                      if (chart.chartType === 'bar')  return <Bar  key={s.key} dataKey={s.label} fill={s.color} radius={[4,4,0,0]} />
                      if (chart.chartType === 'area') return <Area key={s.key} type="monotone" dataKey={s.label} stroke={s.color} fill={s.color} fillOpacity={0.15} strokeWidth={2} dot={false} connectNulls />
                      return <Line key={s.key} type="monotone" dataKey={s.label} stroke={s.color} strokeWidth={2} dot={false} connectNulls activeDot={{ r: 4 }} isAnimationActive={false} />
                    })}
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// DEVICES TAB — table list
// ════════════════════════════════════════════════════════════════════════════
const DevicesTab = ({ devices, onAdd, onEdit, onDelete, onRefresh, loading }) => {
  const [selected, setSelected] = useState([])

  const selectAll = e => setSelected(e.target.checked ? devices.map(d => d._id) : [])
  const selectOne = (e, id) => { e.stopPropagation(); setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]) }

  const handleDelete = async () => {
    if (!window.confirm(`ลบ ${selected.length} device?`)) return
    await onDelete(selected)
    setSelected([])
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* toolbar */}
      <Paper elevation={0} sx={{
        mb: 2, px: 2, py: 1.5, borderRadius: 3, border: '1px solid #eee',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1,
        bgcolor: selected.length > 0 ? '#e3f2fd' : '#fff',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Checkbox size="small" color="primary"
            indeterminate={selected.length > 0 && selected.length < devices.length}
            checked={devices.length > 0 && selected.length === devices.length}
            onChange={selectAll} disabled={!devices.length} />
          <Typography fontWeight={700} sx={{ ml: 1, fontSize: 15 }}>
            {selected.length > 0 ? `${selected.length} Selected` : `Connected Devices (${devices.length})`}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {selected.length > 0 ? (
            <Button variant="outlined" color="error" size="small" startIcon={<DeleteIcon />} onClick={handleDelete}>Delete Selected</Button>
          ) : (
            <>
              <Tooltip title="Refresh"><IconButton size="small" onClick={onRefresh}><RefreshIcon /></IconButton></Tooltip>
              <Button variant="contained" color="success" size="small" startIcon={<AddCircleOutlineIcon />} onClick={onAdd}>Add Device</Button>
            </>
          )}
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>
      ) : devices.length === 0 ? (
        <Box sx={{ p: 8, textAlign: 'center', border: '2px dashed #e0e0e0', borderRadius: 3, color: 'text.secondary' }}>
          <Typography gutterBottom>ยังไม่มี Device</Typography>
          <Button variant="outlined" startIcon={<AddCircleOutlineIcon />} onClick={onAdd}>เพิ่ม Device แรก</Button>
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid #eee', overflow: 'hidden' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: alpha('#1976d2', 0.05) }}>
                <TableCell padding="checkbox">
                  <Checkbox size="small"
                    indeterminate={selected.length > 0 && selected.length < devices.length}
                    checked={devices.length > 0 && selected.length === devices.length}
                    onChange={selectAll} />
                </TableCell>
                {['Device ID','Name','Connection','Model','IP Addr','Tags','Rev','Status',''].map(col => (
                  <TableCell key={col} sx={{ fontWeight: 700, fontSize: 11, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'text.secondary', whiteSpace: 'nowrap' }}>{col}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {devices.map(dev => {
                const isSel    = selected.includes(dev._id)
                const tagCount = (dev.tags || []).length
                const recCount = (dev.tags || []).filter(t => t.record).length
                return (
                  <TableRow key={dev._id} hover
                    sx={{ cursor: 'pointer', bgcolor: isSel ? alpha('#1976d2', 0.04) : 'inherit', '&:last-child td': { border: 0 } }}
                    onClick={() => onEdit(dev)}>
                    <TableCell padding="checkbox" onClick={e => e.stopPropagation()}>
                      <Checkbox size="small" checked={isSel} onChange={e => selectOne(e, dev._id)} />
                    </TableCell>
                    <TableCell><Typography sx={{ fontFamily: 'monospace', fontSize: 13, color: '#1976d2', fontWeight: 700 }}>{dev._id}</Typography></TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{dev.name || '-'}</Typography>
                      {dev.remark && <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 160, display: 'block' }}>{dev.remark}</Typography>}
                    </TableCell>
                    <TableCell><Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{dev.connection || 'Virtual'}</Typography></TableCell>
                    <TableCell><Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{dev.model || '-'}</Typography></TableCell>
                    <TableCell>
                      {dev.ipAddr
                        ? <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><RouterIcon sx={{ fontSize: 13, color: 'text.disabled' }} /><Typography sx={{ fontSize: 12, fontFamily: 'monospace' }}>{dev.ipAddr}</Typography></Box>
                        : <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>—</Typography>}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Chip label={tagCount} size="small" variant="outlined" sx={{ fontSize: 11, height: 20 }} />
                        {recCount > 0 && <Chip label={`${recCount} rec`} size="small" sx={{ fontSize: 11, height: 20, bgcolor: '#e8f5e9', color: '#2e7d32' }} />}
                      </Box>
                    </TableCell>
                    <TableCell><Typography sx={{ fontSize: 12, color: '#e65100', fontWeight: 700 }}>#{dev.revision || 1}</Typography></TableCell>
                    <TableCell><Chip size="small" label={dev.status || 'Unknown'} sx={{ fontWeight: 700, fontSize: 11, ...statusColor(dev.status) }} /></TableCell>
                    <TableCell onClick={e => e.stopPropagation()}>
                      <Tooltip title="Edit Device">
                        <IconButton size="small" onClick={() => onEdit(dev)} sx={{ color: '#1976d2', '&:hover': { bgcolor: alpha('#1976d2', 0.1) } }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ════════════════════════════════════════════════════════════════════════════
const Dashboard = () => {
  const intl   = useIntl()
  const [tab,      setTab]     = useState(0)   // 0 = Devices, 1 = Dashboard
  const [view,     setView]    = useState('list')   // list | add | edit
  const [editDev,  setEditDev] = useState(null)
  const [devices,  setDevices] = useState([])
  const [loading,  setLoading] = useState(true)
  const [snack,    setSnack]   = useState({ open: false, msg: '', sev: 'success' })

  const toast = (msg, sev = 'success') => setSnack({ open: true, msg, sev })

  const fetchDevices = async () => {
    setLoading(true)
    try {
      const auth = getAuth()
      if (!auth) { setLoading(false); return }
      const resp = await fetch('/api/preferences/readDocument', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authorization: auth.token },
        body: JSON.stringify({ collection: COLLECTION, query: {} }),
      })
      const json = await resp.json()
      setDevices(Array.isArray(json) ? json : [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchDevices() }, [])

  const handleDelete = async (ids) => {
    const auth = getAuth()
    try {
      for (const id of ids) {
        await fetch('/api/preferences/deleteDocument', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', authorization: auth.token },
          body: JSON.stringify({ collection: COLLECTION, query: { _id: id } }),
        })
      }
      toast(`ลบ ${ids.length} device เรียบร้อย`)
      fetchDevices()
    } catch { toast('ลบไม่สำเร็จ', 'error') }
  }

  // ── Edit/Add view (ซ้อนทับ tab) ─────────────────────────────────────────
  if (view === 'add' || view === 'edit') {
    return (
      <Page pageTitle={view === 'add' ? 'Add Device' : 'Edit Device'}>
        <Box sx={{ p: 3 }}>
          <EditPanel
            initDevice={view === 'edit' ? editDev : newDevice()}
            isCreate={view === 'add'}
            onBack={() => { setView('list'); setEditDev(null) }}
            onSaved={async (saved) => {
              toast(view === 'add' ? `สร้าง "${saved.name}" เรียบร้อย` : `บันทึก "${saved.name}" เรียบร้อย`)
              setView('list')
              setEditDev(null)
              await fetchDevices()
              setTimeout(() => fetchDevices(), 800)
            }}
          />
        </Box>
      </Page>
    )
  }

  // ── Main view with tabs ──────────────────────────────────────────────────
  return (
    <Page pageTitle={intl.formatMessage({ id: 'dashboard', defaultMessage: 'Dashboard' })}>
      <Snackbar open={snack.open} autoHideDuration={3000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={snack.sev} onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.msg}</Alert>
      </Snackbar>

      {/* tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#fff', px: 3, pt: 1 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab icon={<DevicesIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Devices" sx={{ fontSize: 13, fontWeight: 700, minHeight: 48 }} />
          <Tab icon={<DashboardIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Dashboard" sx={{ fontSize: 13, fontWeight: 700, minHeight: 48 }} />
        </Tabs>
      </Box>

      {tab === 0 && (
        <DevicesTab
          devices={devices}
          loading={loading}
          onAdd={() => setView('add')}
          onEdit={(dev) => { setEditDev(dev); setView('edit') }}
          onDelete={handleDelete}
          onRefresh={fetchDevices}
        />
      )}
      {tab === 1 && (
        <DashboardView devices={devices} />
      )}
    </Page>
  )
}

export default Dashboard
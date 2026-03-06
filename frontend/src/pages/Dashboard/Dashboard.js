import React, { useState, useEffect, useRef } from 'react'
import Page from '../../containers/Page/Page'
import { useIntl } from 'react-intl'
import {
  Box, Button, Typography, Divider, CircularProgress, Checkbox,
  Paper, Chip, IconButton, Tooltip, Alert, Snackbar, Tab, Tabs,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Select, MenuItem, FormControl, InputLabel,
  FormControlLabel, Grid, alpha,
  Accordion, AccordionSummary, AccordionDetails,
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
        <Box sx={{ textAlign: 'right', mb: 2 }}>
          <Button variant="contained" color="secondary" size="small" startIcon={<PlayArrowIcon />} onClick={() => onRun(index)}>TEST SCRIPT</Button>
        </Box>
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
  // ── เลือก series สำหรับกราฟ ──────────────────────────────────────────────
  const [series,    setSeries]    = useState([])   // [{ deviceId, tagLabel, color }]
  const [chartData, setChartData] = useState([])   // [{ time, 'DevName/tag': val }]
  const [widgets,   setWidgets]   = useState([])   // [{ deviceId, tagLabel }]
  const [liveVals,  setLiveVals]  = useState({})   // { 'deviceId/tagLabel': { value, history } }

  // ── add series dialog state ───────────────────────────────────────────────
  const [selDevice, setSelDevice] = useState('')
  const [selTag,    setSelTag]    = useState('')
  const [chartType, setChartType] = useState('line')  // line | bar | area

  const availableTags = selDevice
    ? (devices.find(d => d._id === selDevice)?.tags || []).map(t => t.label).filter(Boolean)
    : []

  const addSeries = () => {
    if (!selDevice || !selTag) return
    const key = `${selDevice}/${selTag}`
    if (series.find(s => s.key === key)) return
    const dev   = devices.find(d => d._id === selDevice)
    const color = COLORS[series.length % COLORS.length]
    const label = `${dev?.name || selDevice} / ${selTag}`
    setSeries(p => [...p, { key, deviceId: selDevice, tagLabel: selTag, label, color }])
    setWidgets(p => [...p, { key, deviceId: selDevice, tagLabel: selTag, label, color }])
    setSelTag('')
  }

  const removeSeries = (key) => {
    setSeries(p => p.filter(s => s.key !== key))
    setWidgets(p => p.filter(w => w.key !== key))
  }

  // ── run scripts for all selected tags every 1s ───────────────────────────
  const seriesRef = useRef(series)
  useEffect(() => { seriesRef.current = series }, [series])

  useEffect(() => {
    if (!devices.length) return
    let alive = true
    const tick = async () => {
      const cur = seriesRef.current
      if (!cur.length) return
      const updates = {}
      await Promise.all(cur.map(async (s) => {
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
      }))
      if (!alive || !Object.keys(updates).length) return
      // append chart point
      const pt = { time: new Date().toLocaleTimeString() }
      cur.forEach(s => { if (updates[s.key] != null) pt[s.label] = updates[s.key] })
      setChartData(prev => [...prev, pt].slice(-60))
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

      {/* ── selector ── */}
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #eee', mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={700} color="text.secondary"
          sx={{ letterSpacing: 1, textTransform: 'uppercase', mb: 2 }}>
          เลือก Device / Tag ที่ต้องการแสดงผล
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Device</InputLabel>
            <Select value={selDevice} label="Device" onChange={e => { setSelDevice(e.target.value); setSelTag('') }}>
              {devices.map(d => <MenuItem key={d._id} value={d._id}>{d.name || d._id}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }} disabled={!selDevice}>
            <InputLabel>Tag</InputLabel>
            <Select value={selTag} label="Tag" onChange={e => setSelTag(e.target.value)}>
              {availableTags.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Chart Type</InputLabel>
            <Select value={chartType} label="Chart Type" onChange={e => setChartType(e.target.value)}>
              <MenuItem value="line">Line</MenuItem>
              <MenuItem value="bar">Bar</MenuItem>
              <MenuItem value="area">Area</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" onClick={addSeries} disabled={!selDevice || !selTag}
            startIcon={<AddIcon />}>
            Add to Chart
          </Button>
        </Box>

        {/* selected series chips */}
        {series.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
            {series.map(s => (
              <Chip key={s.key} label={s.label} onDelete={() => removeSeries(s.key)} size="small"
                sx={{ bgcolor: alpha(s.color, 0.12), color: s.color, fontWeight: 700,
                  '& .MuiChip-deleteIcon': { color: s.color } }} />
            ))}
          </Box>
        )}
      </Paper>

      {/* ── value widgets ── */}
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
              <Paper key={w.key} elevation={0} sx={valCardSx(w.color)}>
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

      {/* ── mixed chart ── */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #eee', minHeight: 380 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={700}>Mixed Chart</Typography>
          <Chip size="small" label={`${series.length} series`} sx={{ ml: 1 }} />
        </Box>

        {series.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, color: 'text.secondary' }}>
            <DashboardIcon sx={{ fontSize: 56, mb: 1.5, opacity: 0.15 }} />
            <Typography fontWeight={600}>เลือก Device / Tag ด้านบน</Typography>
            <Typography variant="caption">แล้วกด "Add to Chart" เพื่อเริ่มแสดงกราฟ real-time</Typography>
          </Box>
        ) : chartData.length < 2 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress />
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={chartData} margin={{ top: 4, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} width={38} />
              <ReTip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
              <Legend />
              {series.map((s, i) => {
                if (chartType === 'bar')  return <Bar  key={s.key} dataKey={s.label} fill={s.color} radius={[4,4,0,0]} />
                if (chartType === 'area') return <Area key={s.key} type="monotone" dataKey={s.label} stroke={s.color} fill={s.color} fillOpacity={0.15} strokeWidth={2} dot={false} connectNulls />
                return <Line key={s.key} type="monotone" dataKey={s.label} stroke={s.color} strokeWidth={2.5} dot={false} connectNulls activeDot={{ r: 5 }} isAnimationActive={false} />
              })}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </Paper>
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
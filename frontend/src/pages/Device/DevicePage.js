import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import Page from '../../containers/Page/Page'
import DeviceHeader from './DeviceHeader'
import DeviceForm from './DeviceForm'
import DashboardCanvas from './DashboardCanvas'

const jsexe = async (code) => {
  const func = new Function(`return (${code})`)
  const result = func()
  return result instanceof Promise ? await result : result
}

function getAuth() {
  const item = localStorage.getItem('base-shell:auth')
  return item ? JSON.parse(item) : null
}

const COLLECTION = 'Device'

const DEFAULT_DEVICE = {
  _id: '', code: '0', connection: 'Virtual', model: 'Virtual', ipAddr: '',
  name: 'Virtual', remark: 'Virtual Device', apiCode: '',
  lineChannel: '', lineId: '', emailFrom: '', emailPwd: '', emailTo: '',
  status: 'Active', revision: 1, tags: []
}

const DevicePage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isCreateMode = id === 'create'

  const [loading, setLoading]     = useState(!isCreateMode)
  const [saving, setSaving]       = useState(false)
  const [activeTab, setActiveTab] = useState('devices')

  const [device, setDevice]                 = useState(DEFAULT_DEVICE)
  const [originalDevice, setOriginalDevice] = useState(null)

  // tagResults: { [index]: { value: string, history: [{time, value}] } }
  const [tagResults, setTagResults] = useState({})
  const [tagErrors, setTagErrors]   = useState({})

  // chart widgets บน dashboard
  const [chartWidgets, setChartWidgets] = useState([])

  // tag indexes ที่โชว์เป็น value box บน canvas
  // (default = ทุก tag ที่มี script, ลบออกได้โดยกด ✕)
  const [visibleTags, setVisibleTags] = useState([])

  // drag state (unified สำหรับทั้ง tag box และ chart widget)
  const [draggingIdx, setDraggingIdx]   = useState(null) // { type: 'tag'|'chart', index }
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 })

  const deviceRef = useRef(device)
  useEffect(() => { deviceRef.current = device }, [device])

  // sync visibleTags เมื่อ tags เปลี่ยน (เพิ่ม tag ใหม่ → โชว์อัตโนมัติ)
  useEffect(() => {
    const scriptIndexes = device.tags
      .map((t, i) => ({ t, i }))
      .filter(({ t }) => t.script?.trim())
      .map(({ i }) => i)
    setVisibleTags(prev => {
      const next = [...new Set([...prev, ...scriptIndexes])]
      return next.filter(i => scriptIndexes.includes(i))
    })
  }, [device.tags])

  // ─── Fetch ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isCreateMode) { setLoading(false); return }
    ;(async () => {
      try {
        const auth = getAuth()
        if (!auth) return
        const resp = await fetch('/api/preferences/readDocument', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', authorization: auth.token },
          body: JSON.stringify({ collection: COLLECTION, query: { _id: id } })
        })
        const json = await resp.json()
        if (json?.length > 0) {
          const loaded = { ...json[0], tags: json[0].tags || [] }
          setDevice(loaded)
          setOriginalDevice(JSON.parse(JSON.stringify(loaded)))
          if (json[0].chartWidgets) setChartWidgets(json[0].chartWidgets)
          if (json[0].visibleTags)  setVisibleTags(json[0].visibleTags)
        } else {
          alert('Device not found')
          navigate('/dashboard')
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    })()
  }, [id, navigate, isCreateMode])

  // ─── Auto-run script ทุก 1 วินาที ────────────────────────────────────
  useEffect(() => {
    let alive = true
    const tick = async () => {
      const tags = deviceRef.current.tags
      if (!tags?.length) return
      await Promise.all(tags.map(async (tag, index) => {
        if (!tag.script?.trim()) return
        try {
          const raw   = await jsexe(tag.script)
          const value = String(raw)
          if (!alive) return
          const point = { time: new Date().toLocaleTimeString(), value: parseFloat(value) || 0 }
          setTagResults(prev => {
            const old     = prev[index] || { value: null, history: [] }
            const history = [...old.history, point].slice(-30)
            return { ...prev, [index]: { value, history } }
          })
          setTagErrors(prev => ({ ...prev, [index]: null }))
        } catch (err) {
          if (!alive) return
          setTagErrors(prev => ({ ...prev, [index]: err.message }))
        }
      }))
    }
    const timer = setInterval(tick, 1000)
    tick()
    return () => { alive = false; clearInterval(timer) }
  }, [])

  // ─── Manual TEST SCRIPT ──────────────────────────────────────────────
  const runTagScript = async (index, e) => {
    if (e) e.stopPropagation()
    const code = deviceRef.current.tags[index]?.script
    if (!code?.trim()) return
    setTagErrors(prev => ({ ...prev, [index]: null }))
    try {
      const raw   = await jsexe(code)
      const value = String(raw)
      const point = { time: new Date().toLocaleTimeString(), value: parseFloat(value) || 0 }
      setTagResults(prev => {
        const old = prev[index] || { value: null, history: [] }
        return { ...prev, [index]: { value, history: [...old.history, point].slice(-30) } }
      })
    } catch (err) {
      setTagErrors(prev => ({ ...prev, [index]: err.message }))
    }
  }

  // ─── Save (รวม chartWidgets + visibleTags) ───────────────────────────
  const handleSave = async () => {
    try {
      if (!device._id || !device.name) { alert('Please fill ID and Name'); return }
      const isChanged = !originalDevice || JSON.stringify(device) !== JSON.stringify(originalDevice)
      let data = { ...device, chartWidgets, visibleTags }

      if (activeTab === 'dashboard') {
        if (!isChanged) { alert('No layout changes to save.'); return }
        data.revision = (Number(data.revision) || 1) + 1
      } else {
        if (!isChanged && !isCreateMode) {
          if (!window.confirm('ข้อมูลไม่มีการเปลี่ยนแปลง\nต้องการสร้าง Tag ใหม่เพิ่ม 1 อัน ใช่หรือไม่?')) return
        }
        data.revision = isCreateMode ? 1 : (Number(data.revision) || 1) + 1
        const n = data.tags.length + 1
        data.tags = [...data.tags, {
          label: `tag${n}`, script: '', updateInterval: '1min',
          record: true, sync: true, api: false, line: false, email: false,
          alarm: 'Off', spLow: '25', spHigh: '35', critical: 'Low',
          title: '', alert: '', description: '',
          x: 100 + n * 20, y: 100 + n * 20
        }]
      }

      setSaving(true)
      const auth = getAuth()
      const url  = isCreateMode ? '/api/preferences/createDocument' : '/api/preferences/updateDocument'
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authorization: auth.token },
        body: JSON.stringify({ collection: COLLECTION, data })
      })
      const json = await resp.json()
      if (json.error) throw new Error(json.error)

      setDevice(data)
      setOriginalDevice(JSON.parse(JSON.stringify(data)))

      if (activeTab === 'dashboard') {
        alert('Dashboard layout saved!')
      } else if (isCreateMode) {
        navigate(`/dashboard/${data._id}`, { replace: true })
        alert('Device created!')
      } else {
        alert('Saved & generated new Tag!')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // ─── Delete device ───────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!window.confirm(`Delete ${device.name}?`)) return
    try {
      setSaving(true)
      const auth = getAuth()
      await fetch('/api/preferences/deleteDocument', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authorization: auth.token },
        body: JSON.stringify({ collection: COLLECTION, query: { _id: device._id } })
      })
      navigate('/dashboard')
    } catch {
      alert('Delete failed')
      setSaving(false)
    }
  }

  // ─── Delete tag ──────────────────────────────────────────────────────
  const deleteTag = async (idx) => {
    if (!window.confirm(`Delete Tag ${idx + 1}?`)) return
    try {
      setSaving(true)
      const remaining = device.tags
        .filter((_, i) => i !== idx)
        .map((t, i) => ({ ...t, label: `tag${i + 1}` }))

      if (isCreateMode) {
        setDevice(prev => ({ ...prev, tags: remaining }))
        setTagResults({}); setSaving(false); return
      }

      const data = { ...device, tags: remaining, revision: (Number(device.revision) || 1) + 1 }
      const auth = getAuth()
      const resp = await fetch('/api/preferences/updateDocument', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authorization: auth.token },
        body: JSON.stringify({ collection: COLLECTION, data })
      })
      const json = await resp.json()
      if (json.error) throw new Error(json.error)
      setDevice(data)
      setOriginalDevice(JSON.parse(JSON.stringify(data)))
      setTagResults({}); setTagErrors({})
      alert('Tag deleted!')
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <Page>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    </Page>
  )

  return (
    <Page pageTitle={`Sites - ${device._id || 'New'}`}>
      <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>

        <DeviceHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleSave={handleSave}
          handleDelete={handleDelete}
          saving={saving}
          isCreateMode={isCreateMode}
        />

        {activeTab === 'devices' && (
          <DeviceForm
            device={device}
            setDevice={setDevice}
            tagResults={tagResults}
            tagErrors={tagErrors}
            runTagScript={runTagScript}
            deleteTag={deleteTag}
            isCreateMode={isCreateMode}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardCanvas
            device={device}
            setDevice={setDevice}
            tagResults={tagResults}
            draggingIdx={draggingIdx}
            setDraggingIdx={setDraggingIdx}
            dragStartPos={dragStartPos}
            setDragStartPos={setDragStartPos}
            chartWidgets={chartWidgets}
            setChartWidgets={setChartWidgets}
            visibleTags={visibleTags}
            setVisibleTags={setVisibleTags}
          />
        )}

      </Box>
    </Page>
  )
}

export default DevicePage
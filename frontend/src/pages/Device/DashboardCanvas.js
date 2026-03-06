import React, { useState } from 'react'
import {
  Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Checkbox, FormControlLabel, Chip, IconButton, Tooltip
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as ChartTooltip, Legend, ResponsiveContainer
} from 'recharts'
import ToolsSidebar from './ToolsSidebar'

// สีสำหรับแต่ละ line ใน chart
const LINE_COLORS = ['#1976d2', '#ff9800', '#4caf50', '#e91e63', '#9c27b0', '#00bcd4']

// ─── Tag Value Box ─────────────────────────────────────────────────────────
const TagBox = ({ tag, index, tagResults, draggingIdx, handleMouseDown, onDelete }) => {
  const val = tagResults[index]?.value
  const isDragging = draggingIdx?.type === 'tag' && draggingIdx.index === index

  return (
    <Box
      onMouseDown={e => handleMouseDown(e, 'tag', index)}
      sx={{
        position: 'absolute',
        left: tag.x ?? 50 + index * 20,
        top:  tag.y ?? 50 + index * 20,
        width: 140, height: 80,
        bgcolor: '#fff',
        border: isDragging ? '2px solid #1976d2' : '1px solid #ccc',
        boxShadow: isDragging ? 6 : 1,
        borderRadius: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        zIndex: isDragging ? 10 : 1
      }}
    >
      {/* ปุ่มลบ */}
      <IconButton
        size="small"
        onMouseDown={e => e.stopPropagation()}
        onClick={e => { e.stopPropagation(); onDelete() }}
        sx={{
          position: 'absolute', top: 2, right: 2,
          width: 18, height: 18,
          bgcolor: 'rgba(0,0,0,0.08)',
          '&:hover': { bgcolor: '#f44336', color: '#fff' },
          zIndex: 20
        }}
      >
        <CloseIcon sx={{ fontSize: 12 }} />
      </IconButton>

      <Typography sx={{ color: '#1976d2', fontWeight: 'bold', fontSize: '1.2rem' }}>
        {val !== null && val !== undefined ? val : '...'}
      </Typography>
      <Typography variant="caption" sx={{ color: '#888', mt: 0.5 }}>
        {tag.label || `Tag ${index + 1}`}
      </Typography>
    </Box>
  )
}

// ─── Chart Widget ──────────────────────────────────────────────────────────
const ChartWidget = ({ widget, widgetIndex, tagResults, device, draggingIdx, handleMouseDown, onDelete }) => {
  const { tagIndexes } = widget  // array ของ tag indexes ที่เลือก
  const isDragging = draggingIdx?.type === 'chart' && draggingIdx.index === widgetIndex

  // Merge history ของทุก tag เข้าด้วยกัน โดยใช้ time เป็น key
  const mergedData = (() => {
    const map = {}
    tagIndexes.forEach(tagIdx => {
      const history = tagResults[tagIdx]?.history || []
      history.forEach(({ time, value }) => {
        if (!map[time]) map[time] = { time }
        map[time][`tag_${tagIdx}`] = value
      })
    })
    return Object.values(map).slice(-30)
  })()

  return (
    <Box
      onMouseDown={e => handleMouseDown(e, 'chart', widgetIndex)}
      sx={{
        position: 'absolute',
        left: widget.x ?? 200 + widgetIndex * 30,
        top:  widget.y ?? 150 + widgetIndex * 30,
        width: 380, height: 240,
        bgcolor: '#fff',
        border: isDragging ? '2px solid #ff9800' : '1px solid #ddd',
        boxShadow: isDragging ? 6 : 2,
        borderRadius: 2,
        p: 1.5,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        zIndex: isDragging ? 10 : 1
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {tagIndexes.map((tagIdx, i) => {
            const tag = device.tags[tagIdx]
            return (
              <Chip
                key={tagIdx}
                label={tag?.label || `Tag ${tagIdx + 1}`}
                size="small"
                sx={{ fontSize: 10, height: 20, bgcolor: LINE_COLORS[i % LINE_COLORS.length] + '20', color: LINE_COLORS[i % LINE_COLORS.length], fontWeight: 'bold' }}
              />
            )
          })}
        </Box>

        {/* ปุ่มลบ */}
        <IconButton
          size="small"
          onMouseDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onDelete() }}
          sx={{
            width: 20, height: 20,
            bgcolor: 'rgba(0,0,0,0.08)',
            '&:hover': { bgcolor: '#f44336', color: '#fff' }
          }}
        >
          <CloseIcon sx={{ fontSize: 13 }} />
        </IconButton>
      </Box>

      {/* Chart */}
      {mergedData.length < 2 ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 185, color: '#bbb' }}>
          <Typography variant="caption">รอข้อมูล...</Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={185}>
          <LineChart data={mergedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis dataKey="time" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 9 }} width={32} />
            <ChartTooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            {tagIndexes.map((tagIdx, i) => {
              const tag = device.tags[tagIdx]
              return (
                <Line
                  key={tagIdx}
                  type="monotone"
                  dataKey={`tag_${tagIdx}`}
                  name={tag?.label || `Tag ${tagIdx + 1}`}
                  stroke={LINE_COLORS[i % LINE_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              )
            })}
          </LineChart>
        </ResponsiveContainer>
      )}
    </Box>
  )
}

// ─── Main DashboardCanvas ──────────────────────────────────────────────────
const DashboardCanvas = ({
  device, setDevice,
  tagResults,
  draggingIdx, setDraggingIdx,
  dragStartPos, setDragStartPos,
  chartWidgets, setChartWidgets,
  // tagBoxVisible: array ของ tag ที่โชว์บน canvas (แยกจาก tag accordion)
  visibleTags, setVisibleTags
}) => {
  const [showTagPicker, setShowTagPicker]   = useState(false)
  const [selectedTagIdxs, setSelectedTagIdxs] = useState([])

  const handleMouseDown = (e, type, index) => {
    e.preventDefault()
    e.stopPropagation()
    setDraggingIdx({ type, index })
    setDragStartPos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e) => {
    if (!draggingIdx) return
    const dx = e.clientX - dragStartPos.x
    const dy = e.clientY - dragStartPos.y
    setDragStartPos({ x: e.clientX, y: e.clientY })

    if (draggingIdx.type === 'tag') {
      setDevice(prev => {
        const tags = [...prev.tags]
        tags[draggingIdx.index] = {
          ...tags[draggingIdx.index],
          x: (tags[draggingIdx.index].x || 50) + dx,
          y: (tags[draggingIdx.index].y || 50) + dy
        }
        return { ...prev, tags }
      })
    } else if (draggingIdx.type === 'chart') {
      setChartWidgets(prev => {
        const w = [...prev]
        w[draggingIdx.index] = {
          ...w[draggingIdx.index],
          x: (w[draggingIdx.index].x || 200) + dx,
          y: (w[draggingIdx.index].y || 150) + dy
        }
        return w
      })
    }
  }

  const handleMouseUp = () => setDraggingIdx(null)

  // Toggle tag selection ใน popup
  const toggleTag = (idx) => {
    setSelectedTagIdxs(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    )
  }

  // เพิ่ม chart widget
  const handleAddChart = () => {
    if (selectedTagIdxs.length === 0) return
    setChartWidgets(prev => [
      ...prev,
      { tagIndexes: [...selectedTagIdxs], x: 200 + prev.length * 30, y: 150 + prev.length * 30 }
    ])
    setSelectedTagIdxs([])
    setShowTagPicker(false)
  }

  // ลบ chart widget
  const deleteChartWidget = (widgetIndex) => {
    setChartWidgets(prev => prev.filter((_, i) => i !== widgetIndex))
  }

  // ลบ tag box บน canvas (ซ่อน ไม่ได้ลบ tag จริง)
  const deleteTagBox = (tagIndex) => {
    setVisibleTags(prev => prev.filter(i => i !== tagIndex))
  }

  const tagsWithScript = device.tags
    .map((t, i) => ({ tag: t, index: i }))
    .filter(({ tag }) => tag.script?.trim())

  return (
    <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

      {/* Canvas */}
      <Box
        sx={{
          flex: 1, position: 'relative',
          bgcolor: '#f4f6f8',
          backgroundImage: 'radial-gradient(#ddd 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Tag Value Boxes */}
        {visibleTags.map(tagIndex => {
          const tag = device.tags[tagIndex]
          if (!tag?.script?.trim()) return null
          return (
            <TagBox
              key={`tag-${tagIndex}`}
              tag={tag}
              index={tagIndex}
              tagResults={tagResults}
              draggingIdx={draggingIdx}
              handleMouseDown={handleMouseDown}
              onDelete={() => deleteTagBox(tagIndex)}
            />
          )
        })}

        {/* Chart Widgets */}
        {chartWidgets.map((widget, widgetIndex) => (
          <ChartWidget
            key={`chart-${widgetIndex}`}
            widget={widget}
            widgetIndex={widgetIndex}
            tagResults={tagResults}
            device={device}
            draggingIdx={draggingIdx}
            handleMouseDown={handleMouseDown}
            onDelete={() => deleteChartWidget(widgetIndex)}
          />
        ))}
      </Box>

      {/* Sidebar */}
      <ToolsSidebar onAddChart={() => { setSelectedTagIdxs([]); setShowTagPicker(true) }} />

      {/* Tag Picker Dialog */}
      <Dialog open={showTagPicker} onClose={() => setShowTagPicker(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1rem', pb: 1 }}>
          📈 เลือก Tag สำหรับ Chart
          <Typography variant="caption" display="block" color="text.secondary">
            เลือกได้หลาย tag เพื่อเปรียบเทียบในกราฟเดียวกัน
          </Typography>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 2 }}>
          {tagsWithScript.length === 0 ? (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
              ยังไม่มี Tag ที่มี Script
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {tagsWithScript.map(({ tag, index }, i) => {
                const val      = tagResults[index]?.value
                const selected = selectedTagIdxs.includes(index)
                const color    = LINE_COLORS[selectedTagIdxs.indexOf(index) % LINE_COLORS.length]

                return (
                  <Box
                    key={index}
                    onClick={() => toggleTag(index)}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5,
                      p: 1.5, borderRadius: 2, cursor: 'pointer',
                      border: selected ? `2px solid ${color}` : '2px solid #eee',
                      bgcolor: selected ? color + '10' : '#fafafa',
                      transition: '0.15s'
                    }}
                  >
                    <Checkbox
                      checked={selected}
                      size="small"
                      onMouseDown={e => e.stopPropagation()}
                      onChange={() => toggleTag(index)}
                      sx={{ p: 0, color: selected ? color : undefined }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography fontWeight="bold" fontSize={14}>{tag.label || `Tag ${index + 1}`}</Typography>
                      <Typography variant="caption" color={val ? 'primary' : 'text.secondary'}>
                        {val !== undefined && val !== null ? `ค่าปัจจุบัน: ${val}` : 'รอข้อมูล...'}
                      </Typography>
                    </Box>
                    {selected && (
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: color }} />
                    )}
                  </Box>
                )
              })}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button onClick={() => setShowTagPicker(false)} color="inherit">ยกเลิก</Button>
          <Button
            onClick={handleAddChart}
            variant="contained"
            disabled={selectedTagIdxs.length === 0}
          >
            เพิ่ม Chart ({selectedTagIdxs.length} tag)
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  )
}

export default DashboardCanvas
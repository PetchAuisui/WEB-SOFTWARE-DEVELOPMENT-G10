import React, { useState } from 'react'
import {
  Accordion, AccordionSummary, AccordionDetails,
  Box, Button, Checkbox, FormControlLabel,
  Grid, MenuItem, TextField, Typography
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'

const inputSx = {
  variant: 'outlined', size: 'small', fullWidth: true,
  sx: {
    mb: 1,
    '& .MuiOutlinedInput-root': { backgroundColor: '#f9f9f9', borderRadius: '6px' },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e0e0' }
  },
  InputProps: { style: { fontSize: '0.875rem' } },
  InputLabelProps: { shrink: true, style: { fontSize: '0.85rem', color: '#555', fontWeight: 'bold' } }
}

const TagAccordion = ({
  tag, index,
  tagResult,   // { value, history: [{time, value}] }
  tagError,
  handleTagChange,
  runTagScript,
  deleteTag
}) => {
  const [expanded, setExpanded] = useState(false)

  const currentValue = tagResult?.value
  const history      = tagResult?.history || []

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, v) => setExpanded(v)}
      disableGutters elevation={1}
      sx={{ border: '1px solid #e0e0e0', mb: 1, borderRadius: '4px !important', '&:before': { display: 'none' } }}
    >
      {/* ── Header row ──────────────────────────────────────────────────── */}
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2, bgcolor: expanded ? '#f5f9ff' : '#fff' }}>
        <Grid container alignItems="center">
          <Grid item xs={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 18 }} />
            <Typography fontWeight="bold" sx={{ color: '#333' }}>
              {tag.label || `Tag ${index + 1}`}
            </Typography>
          </Grid>

          {/* ค่าปัจจุบัน */}
          <Grid item xs={4} sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 'bold', fontSize: '1rem' }}>
              {currentValue !== null && currentValue !== undefined ? currentValue : ''}
            </Typography>
          </Grid>

          <Grid item xs={5} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            {['record','sync','api'].map(f => (
              <FormControlLabel key={f}
                onClick={e => e.stopPropagation()}
                control={<Checkbox size="small" checked={!!tag[f]} color={f === 'api' ? 'default' : 'success'}
                  onChange={e => handleTagChange(index, f, e.target.checked)} />}
                label={<Typography variant="caption" sx={{ textTransform: 'uppercase' }}>{f}</Typography>}
              />
            ))}
          </Grid>
        </Grid>
      </AccordionSummary>

      {/* ── Details ─────────────────────────────────────────────────────── */}
      <AccordionDetails sx={{ p: 3, borderTop: '1px solid #eee' }}>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button color="error" variant="outlined" size="small" onClick={() => deleteTag(index)}>
            Delete Tag
          </Button>
        </Box>

        {/* Label / Interval / Checkboxes */}
        <Grid container spacing={3} alignItems="flex-start" sx={{ mb: 2 }}>
          <Grid item xs={3}>
            <TextField {...inputSx} label="Label" value={tag.label || ''}
              onChange={e => handleTagChange(index, 'label', e.target.value)} />
          </Grid>
          <Grid item xs={3}>
            <TextField select {...inputSx} label="Update Interval" value={tag.updateInterval || '1min'}
              onChange={e => handleTagChange(index, 'updateInterval', e.target.value)}>
              <MenuItem value="1min">1 min</MenuItem>
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="week">Weekly</MenuItem>
              <MenuItem value="month">Monthly</MenuItem>
              <MenuItem value="year">Yearly</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={6} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            {['record','sync','api','line','email'].map(f => (
              <FormControlLabel key={f}
                control={<Checkbox size="small" checked={!!tag[f]}
                  onChange={e => handleTagChange(index, f, e.target.checked)} />}
                label={<Typography variant="body2" sx={{ textTransform: 'uppercase' }}>{f}</Typography>}
              />
            ))}
          </Grid>
        </Grid>

        {/* Script Engine */}
        <Typography variant="subtitle2" sx={{ color: '#555', mb: 1 }}>Script Engine</Typography>
        <TextField
          fullWidth multiline minRows={4} variant="outlined"
          value={tag.script || ''}
          onChange={e => handleTagChange(index, 'script', e.target.value)}
          sx={{ bgcolor: '#f5f5f5', mb: 1, '& textarea': { fontSize: '0.875rem', fontFamily: 'monospace', color: '#333' } }}
        />
        <Box sx={{ textAlign: 'right', mb: 2 }}>
          <Button variant="contained" color="secondary" size="small"
            startIcon={<PlayArrowIcon />}
            onClick={e => runTagScript(index, e)}>
            TEST SCRIPT
          </Button>
        </Box>

        {/* Console Output */}
        <Typography variant="subtitle2" sx={{ color: '#555', mb: 1 }}>Console Output (Real-time)</Typography>
        <Box sx={{
          p: 2, bgcolor: '#282c34', borderRadius: '4px',
          minHeight: 64, mb: 3, fontFamily: 'monospace',
          display: 'flex', alignItems: 'center'
        }}>
          {tagError
            ? <Typography color="error" sx={{ fontFamily: 'monospace' }}>{tagError}</Typography>
            : currentValue !== null && currentValue !== undefined
              ? <Typography sx={{ color: '#98c379', fontWeight: 'bold', fontSize: '1.1rem' }}>{currentValue}</Typography>
              : <Typography variant="caption" sx={{ color: '#5c6370' }}>Waiting for execution...</Typography>
          }
        </Box>

        {/* Chart — แสดงเมื่อมีข้อมูล history */}
        {history.length > 0 && (
          <>
            <Typography variant="subtitle2" sx={{ color: '#555', mb: 1 }}>Chart</Typography>
            <Box sx={{ bgcolor: '#fff', border: '1px solid #eee', borderRadius: 2, p: 2, mb: 2 }}>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10 }} width={40} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 6 }}
                    formatter={(v) => [v, tag.label || `Tag ${index + 1}`]}
                  />
                  <Line
                    type="monotone" dataKey="value"
                    stroke="#1976d2" strokeWidth={2}
                    dot={false} isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </>
        )}

      </AccordionDetails>
    </Accordion>
  )
}

export default TagAccordion
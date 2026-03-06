import React from 'react'
import {
  Box, Grid, TextField, Typography, MenuItem,
  FormControlLabel, Checkbox
} from '@mui/material'
import FileCopy from '@mui/icons-material/FileCopy'
import TagAccordion from './TagAccordion'

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

const DeviceForm = ({
  device, setDevice,
  tagResults, tagErrors,
  runTagScript, deleteTag,
  isCreateMode
}) => {

  const handleChange = (e) => {
    const { name, value } = e.target
    setDevice(prev => ({ ...prev, [name]: value }))
  }

  const handleTagChange = (index, field, value) => {
    const tags = [...device.tags]
    tags[index] = { ...tags[index], [field]: value }
    setDevice(prev => ({ ...prev, tags }))
  }

  return (
    <Box sx={{ p: 4, overflowY: 'auto', flex: 1 }}>
      <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
        {isCreateMode ? 'Add New Device' : 'Edit Device Info'}
      </Typography>

      {/* Device Info */}
      <Box sx={{ mb: 4, p: 3, border: '1px solid #f0f0f0', borderRadius: '8px', bgcolor: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <Grid container spacing={3} sx={{ mb: 1 }}>
          <Grid item xs={2}><TextField {...inputSx} label="Device ID"      name="_id"        value={device._id || ''}        onChange={handleChange} disabled={!isCreateMode} /></Grid>
          <Grid item xs={2}><TextField {...inputSx} label="Code"           name="code"       value={device.code || ''}       onChange={handleChange} /></Grid>
          <Grid item xs={3}><TextField {...inputSx} label="Connection"     name="connection" value={device.connection || ''} onChange={handleChange} /></Grid>
          <Grid item xs={3}><TextField {...inputSx} label="Model"          name="model"      value={device.model || ''}      onChange={handleChange} /></Grid>
          <Grid item xs={2}><TextField {...inputSx} label="IP Addr / Port" name="ipAddr"     value={device.ipAddr || ''}     onChange={handleChange} /></Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 1 }}>
          <Grid item xs={4}><TextField {...inputSx} label="Device Name" name="name"    value={device.name || ''}    onChange={handleChange} /></Grid>
          <Grid item xs={6}><TextField {...inputSx} label="Remark"      name="remark"  value={device.remark || ''}  onChange={handleChange} /></Grid>
          <Grid item xs={2}><TextField {...inputSx} label="API-Code"    name="apiCode" value={device.apiCode || ''} onChange={handleChange} /></Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 1 }}>
          <Grid item xs={6}><TextField {...inputSx} label="Line Channel" name="lineChannel" value={device.lineChannel || ''} onChange={handleChange} /></Grid>
          <Grid item xs={6}><TextField {...inputSx} label="Line ID"      name="lineId"      value={device.lineId || ''}      onChange={handleChange} /></Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 2 }}>
          <Grid item xs={4}><TextField {...inputSx} label="Email From"     name="emailFrom" value={device.emailFrom || ''} onChange={handleChange} /></Grid>
          <Grid item xs={4}><TextField {...inputSx} label="Email Password" name="emailPwd"  value={device.emailPwd || ''}  onChange={handleChange} type="password" /></Grid>
          <Grid item xs={4}><TextField {...inputSx} label="Email To"       name="emailTo"   value={device.emailTo || ''}   onChange={handleChange} /></Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 3, pt: 2, borderTop: '1px solid #eee' }}>
          <FileCopy sx={{ color: '#888', cursor: 'pointer', fontSize: 20 }} />
          <FormControlLabel control={<Checkbox size="small" />}         label={<Typography variant="caption">Stop</Typography>} />
          <FormControlLabel control={<Checkbox size="small" defaultChecked />} label={<Typography variant="caption">Record</Typography>} />
          <FormControlLabel control={<Checkbox size="small" />}         label={<Typography variant="caption">Sync</Typography>} />
          <FormControlLabel control={<Checkbox size="small" />}         label={<Typography variant="caption">API</Typography>} />
        </Box>
      </Box>

      {/* Tags */}
      <Typography variant="h6" fontWeight="bold" sx={{ color: '#444', mb: 2 }}>
        Tags Configuration
      </Typography>

      {device.tags.map((tag, index) => (
        <TagAccordion
          key={index}
          tag={tag}
          index={index}
          tagResult={tagResults[index]}
          tagError={tagErrors[index]}
          handleTagChange={handleTagChange}
          runTagScript={runTagScript}
          deleteTag={deleteTag}
        />
      ))}
    </Box>
  )
}

export default DeviceForm
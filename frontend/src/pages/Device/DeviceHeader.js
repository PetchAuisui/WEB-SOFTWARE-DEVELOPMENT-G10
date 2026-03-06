import React from 'react'
import { Box, Button, IconButton, Typography } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useNavigate } from 'react-router-dom'

const DeviceHeader = ({ activeTab, setActiveTab, handleSave, handleDelete, saving, isCreateMode }) => {
  const navigate = useNavigate()
  return (
    <Box sx={{ px: 4, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <IconButton onClick={() => navigate('/dashboard')} size="small" sx={{ mr: -2 }}>
          <ArrowBackIcon />
        </IconButton>
        {['devices', 'dashboard'].map(tab => (
          <Typography key={tab} onClick={() => setActiveTab(tab)} variant="subtitle1" sx={{
            cursor: 'pointer', fontWeight: 'bold', textTransform: 'uppercase',
            color: activeTab === tab ? '#1976d2' : '#999',
            borderBottom: activeTab === tab ? '3px solid #1976d2' : '3px solid transparent',
            pb: 0.5, transition: '0.2s'
          }}>
            {tab}
          </Typography>
        ))}
      </Box>
      <Box sx={{ display: 'flex', gap: 2 }}>
        {!isCreateMode && <Button color="error" onClick={handleDelete} size="small">DELETE</Button>}
        <Button onClick={handleSave} disabled={saving} size="small" variant="contained" sx={{ fontWeight: 'bold' }}>
          {saving ? 'SAVING...' : 'SAVE'}
        </Button>
      </Box>
    </Box>
  )
}

export default DeviceHeader
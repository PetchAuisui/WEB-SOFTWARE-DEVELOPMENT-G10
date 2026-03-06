import React from 'react'
import { Box, Divider, Typography } from '@mui/material'
import TextFieldsIcon from '@mui/icons-material/TextFields'
import InsertChartIcon from '@mui/icons-material/InsertChart'
import SpeedIcon from '@mui/icons-material/Speed'
import MapIcon from '@mui/icons-material/Map'

const ToolsSidebar = ({ onAddChart }) => {
  const tools = [
    { label: 'Textbox', Icon: TextFieldsIcon, color: '#f44336', onClick: () => {} },
    { label: 'Chart',   Icon: InsertChartIcon, color: '#ff9800', onClick: onAddChart },
    { label: 'Gauge',   Icon: SpeedIcon,       color: '#9c27b0', onClick: () => {} },
    { label: 'Map',     Icon: MapIcon,         color: '#4caf50', onClick: () => {} },
  ]

  return (
    <Box sx={{ width: 250, bgcolor: '#fff', borderLeft: '1px solid #ddd', overflowY: 'auto' }}>
      <Box sx={{ p: 2, bgcolor: '#1976d2', color: '#fff' }}>
        <Typography variant="subtitle2" fontWeight="bold">Tools</Typography>
      </Box>
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {tools.map(({ label, Icon, color, onClick }) => (
          <Box
            key={label}
            onClick={onClick}
            sx={{
              display: 'flex', alignItems: 'center', gap: 2,
              cursor: 'pointer', p: 1, borderRadius: 1,
              '&:hover': { bgcolor: '#f5f5f5' }
            }}
          >
            <Icon sx={{ color }} />
            <Typography variant="body2">{label}</Typography>
          </Box>
        ))}
        <Divider sx={{ my: 1 }} />
        <Typography variant="caption" color="text.secondary">
          * ลากกล่องบนหน้าจอเพื่อจัดวางตำแหน่งได้เลย
        </Typography>
        <Typography variant="caption" color="text.secondary">
          * กด ✕ บน widget เพื่อลบออกจาก canvas
        </Typography>
      </Box>
    </Box>
  )
}

export default ToolsSidebar
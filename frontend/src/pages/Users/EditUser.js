import React, { useEffect, useState } from 'react'
import Page from '../../containers/Page/Page'
import { useIntl } from 'react-intl'
import { useParams, useNavigate } from 'react-router-dom'

import Grid from '@mui/material/Unstable_Grid2'
import {
  TextField,
  Button,
  Box,
} from '@mui/material'

const EditUser = () => {
  const intl = useIntl()
  const navigate = useNavigate()
  const { id } = useParams()

  const collection = 'User'

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    _id: '',
    userName: '',
    fullName: '',
    userLevel: '',
    userState: '',
    email: '',
    dateExpire: '',
  })

  function getAuth () {
    let auth = null
    const item = localStorage.getItem('base-shell:auth')
    if (item) auth = JSON.parse(item)
    return auth
  }

  // 🔹 Read user by id
  useEffect(() => {
    async function readUser () {
      try {
        const auth = getAuth()

        const resp = await fetch('/api/preferences/readDocument', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'authorization': auth.token,
          },
          body: JSON.stringify({
            collection: collection,
            query: { _id: id },
          }),
        })

        const json = await resp.json()

        if (!json.length) {
          alert('ไม่พบข้อมูลผู้ใช้')
          navigate('/users')
          return
        }

        setData(json[0])
      } finally {
        setLoading(false)
      }
    }

    readUser()
  }, [id, navigate])

  // 🔹 update
  async function Update () {
    const auth = getAuth()

    const resp = await fetch('/api/preferences/updateDocument', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authorization': auth.token,
      },
      body: JSON.stringify({
        collection: collection,
        data: data,
      }),
    })

    const json = await resp.json()
    console.log(json)
    alert('แก้ไขข้อมูลเรียบร้อย')
    navigate('/users')
  }

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>

  return (
    <Page pageTitle={intl.formatMessage({ id: 'edit_user' })}>
      <Box sx={{ padding: 2 }}>
        <Grid container spacing={2} maxWidth={600}>

          <Grid xs={12}>
            <TextField
              label="User ID"
              value={data._id}
              disabled
              fullWidth
            />
          </Grid>

          <Grid xs={12}>
            <TextField
              label="Username"
              value={data.userName}
              disabled
              fullWidth
            />
          </Grid>

          <Grid xs={12}>
            <TextField
              label="Full Name"
              value={data.fullName || ''}
              fullWidth
              onChange={e =>
                setData({ ...data, fullName: e.target.value })
              }
            />
          </Grid>

          <Grid xs={12}>
            <TextField
              label="Email"
              value={data.email || ''}
              fullWidth
              onChange={e =>
                setData({ ...data, email: e.target.value })
              }
            />
          </Grid>

          <Grid xs={6}>
            <TextField
              label="User Level"
              value={data.userLevel || ''}
              fullWidth
              onChange={e =>
                setData({ ...data, userLevel: e.target.value })
              }
            />
          </Grid>

          <Grid xs={6}>
            <TextField
              label="Status"
              value={data.userState || ''}
              fullWidth
              onChange={e =>
                setData({ ...data, userState: e.target.value })
              }
            />
          </Grid>

          <Grid xs={12}>
            <TextField
              type="date"
              label="Expire Date"
              InputLabelProps={{ shrink: true }}
              value={
                data.dateExpire
                  ? data.dateExpire.slice(0, 10)
                  : ''
              }
              fullWidth
              onChange={e =>
                setData({ ...data, dateExpire: e.target.value })
              }
            />
          </Grid>

          <Grid xs={6}>
            <Button
              fullWidth
              variant="contained"
              onClick={Update}
            >
              Save
            </Button>
          </Grid>

          <Grid xs={6}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate('/users')}
            >
              Cancel
            </Button>
          </Grid>

        </Grid>
      </Box>
    </Page>
  )
}

export default EditUser

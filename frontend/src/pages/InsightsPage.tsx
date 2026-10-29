import { useState } from 'react'
import {
  Alert, Card, CardContent, MenuItem, Paper, Stack, Tab, Table, TableBody, TableCell, TableHead,
  TableRow, Tabs, TextField, Typography,
} from '@mui/material'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { api } from '../api/client'
import { formatCount, formatMoney, formatUsd } from '../lib/format'
import { useAsync } from '../lib/useAsync'

const DIMENSIONS = [
  { id: 'country', label: 'Country' },
  { id: 'department', label: 'Department' },
  { id: 'job_title', label: 'Job title' },
]

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card sx={{ flex: 1, minWidth: 150 }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>{value}</Typography>
      </CardContent>
    </Card>
  )
}

export default function InsightsPage() {
  const [filters, setFilters] = useState({ country: '', department: '' })
  const [by, setBy] = useState('country')
  const key = JSON.stringify(filters)
  const meta = useAsync(() => api.meta(), [])
  const summary = useAsync(() => api.summary(filters), [key])
  const groups = useAsync(() => api.groups(by, filters), [by, key])
  const dist = useAsync(() => api.distribution(filters), [key])
  const top = useAsync(() => api.top(filters, 10), [key])

  const failed = summary.error || groups.error || dist.error || top.error
  const s = summary.data
  const showLocal = by === 'country'

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} useFlexGap sx={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>How we pay people</Typography>
          <Typography variant="body2" color="text.secondary">
            All figures are annual salary converted to USD at static rates, so countries are comparable.
          </Typography>
        </div>
        <Stack direction="row" spacing={2}>
          <TextField select size="small" label="Country" sx={{ minWidth: 170 }} value={filters.country}
            onChange={(e) => setFilters((f) => ({ ...f, country: e.target.value }))}>
            <MenuItem value="">All countries</MenuItem>
            {meta.data?.countries.map((c) => <MenuItem key={c.code} value={c.code}>{c.name}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Department" sx={{ minWidth: 170 }} value={filters.department}
            onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))}>
            <MenuItem value="">All departments</MenuItem>
            {meta.data?.departments.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </TextField>
        </Stack>
      </Stack>

      {failed && <Alert severity="error">Could not load insights.</Alert>}

      <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: "wrap" }}>
        <StatCard label="Headcount" value={s ? formatCount(s.headcount) : '…'} />
        <StatCard label="Median salary" value={s ? formatUsd(s.median) : '…'} />
        <StatCard label="Average salary" value={s ? formatUsd(s.avg) : '…'} />
        <StatCard label="Lowest" value={s ? formatUsd(s.min) : '…'} />
        <StatCard label="Highest" value={s ? formatUsd(s.max) : '…'} />
      </Stack>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Salary distribution</Typography>
        <div style={{ height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={dist.data ?? []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" /><YAxis allowDecimals={false} />
              <Tooltip formatter={(v) => [formatCount(Number(v)), 'Employees']} />
              <Bar dataKey="count" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">Pay by group</Typography>
          <Tabs value={by} onChange={(_, v) => setBy(v)}>
            {DIMENSIONS.map((d) => <Tab key={d.id} value={d.id} label={d.label} />)}
          </Tabs>
        </Stack>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{DIMENSIONS.find((d) => d.id === by)?.label}</TableCell>
              <TableCell align="right">Headcount</TableCell>
              <TableCell align="right">Min</TableCell>
              <TableCell align="right">Median</TableCell>
              <TableCell align="right">Average</TableCell>
              <TableCell align="right">Max</TableCell>
              {showLocal && <TableCell align="right">Median (local)</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {groups.data?.map((g) => (
              <TableRow key={g.key} hover>
                <TableCell>{g.key}</TableCell>
                <TableCell align="right">{formatCount(g.headcount)}</TableCell>
                <TableCell align="right">{formatUsd(g.min)}</TableCell>
                <TableCell align="right">{formatUsd(g.median)}</TableCell>
                <TableCell align="right">{formatUsd(g.avg)}</TableCell>
                <TableCell align="right">{formatUsd(g.max)}</TableCell>
                {showLocal && <TableCell align="right">{g.local && formatMoney(g.local.median, g.local.currency)}</TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Top 10 earners</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell><TableCell>Job title</TableCell><TableCell>Country</TableCell>
              <TableCell align="right">Salary (local)</TableCell><TableCell align="right">Salary (USD)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {top.data?.map((t) => (
              <TableRow key={t.id} hover>
                <TableCell>{t.full_name}</TableCell><TableCell>{t.job_title}</TableCell><TableCell>{t.country}</TableCell>
                <TableCell align="right">{formatMoney(t.salary, t.currency)}</TableCell>
                <TableCell align="right">{formatUsd(t.salary_usd)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  )
}

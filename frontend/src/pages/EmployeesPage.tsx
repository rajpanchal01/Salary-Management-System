import { useState } from 'react'
import {
  Alert, Box, Button, IconButton, MenuItem, Paper, Snackbar, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, TextField, Typography,
} from '@mui/material'
import { api } from '../api/client'
import type { Employee, ListParams } from '../api/types'
import EmployeeForm from '../components/EmployeeForm'
import { formatCount, formatMoney } from '../lib/format'
import { useAsync } from '../lib/useAsync'
import { useDebounce } from '../lib/useDebounce'

const COLUMNS: { id: string; label: string; numeric?: boolean }[] = [
  { id: 'full_name', label: 'Name' }, { id: 'job_title', label: 'Job title' },
  { id: 'department', label: 'Department' }, { id: 'country', label: 'Country' },
  { id: 'salary', label: 'Salary (local)', numeric: true }, { id: 'hired_on', label: 'Hired' },
]

export default function EmployeesPage() {
  const [search, setSearch] = useState('')
  const q = useDebounce(search)
  const [filters, setFilters] = useState({ country: '', department: '', job_title: '' })
  const [sort, setSort] = useState<{ by: string; dir: 'asc' | 'desc' }>({ by: 'full_name', dir: 'asc' })
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(25)
  const [editing, setEditing] = useState<Employee | 'new' | null>(null)
  const [toast, setToast] = useState('')

  const meta = useAsync(() => api.meta(), [])
  const params: ListParams = { q, ...filters, sort: sort.by, dir: sort.dir, page: page + 1, per_page: perPage }
  const list = useAsync(() => api.listEmployees(params), [JSON.stringify(params)])

  const change = (patch: Partial<typeof filters>) => { setFilters((f) => ({ ...f, ...patch })); setPage(0) }

  async function remove(e: Employee) {
    if (!window.confirm(`Delete ${e.full_name}? This cannot be undone.`)) return
    await api.deleteEmployee(e.id)
    setToast(`Deleted ${e.full_name}`)
    list.reload(); meta.reload()
  }

  const select = (label: string, key: keyof typeof filters, options: { value: string; label: string }[]) => (
    <TextField select size="small" label={label} value={filters[key]} sx={{ minWidth: 170 }}
      onChange={(e) => change({ [key]: e.target.value })}>
      <MenuItem value="">All</MenuItem>
      {options.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
    </TextField>
  )

  return (
    <Stack spacing={2}>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Employees</Typography>
        <Button variant="contained" onClick={() => setEditing('new')} disabled={!meta.data}>Add employee</Button>
      </Stack>

      <Paper sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: "wrap" }}>
          <TextField size="small" label="Search name or email" value={search} sx={{ minWidth: 260 }}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }} />
          {select('Country', 'country', (meta.data?.countries ?? []).map((c) => ({ value: c.code, label: c.name })))}
          {select('Department', 'department', (meta.data?.departments ?? []).map((d) => ({ value: d, label: d })))}
          {select('Job title', 'job_title', (meta.data?.job_titles ?? []).map((t) => ({ value: t, label: t })))}
        </Stack>
      </Paper>

      {list.error && <Alert severity="error">Could not load employees. <Button onClick={list.reload}>Retry</Button></Alert>}

      <TableContainer component={Paper} sx={{ opacity: list.loading ? 0.6 : 1 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {COLUMNS.map((c) => (
                <TableCell key={c.id} align={c.numeric ? 'right' : 'left'} sortDirection={sort.by === c.id ? sort.dir : false}>
                  <TableSortLabel active={sort.by === c.id} direction={sort.by === c.id ? sort.dir : 'asc'}
                    onClick={() => setSort((s) => ({ by: c.id, dir: s.by === c.id && s.dir === 'asc' ? 'desc' : 'asc' }))}>
                    {c.label}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {list.data?.data.map((e) => (
              <TableRow key={e.id} hover>
                <TableCell>
                  <Box sx={{ fontWeight: 500 }}>{e.full_name}</Box>
                  <Box sx={{ fontSize: 12, color: "text.secondary" }}>{e.email}</Box>
                </TableCell>
                <TableCell>{e.job_title}</TableCell>
                <TableCell>{e.department}</TableCell>
                <TableCell>{e.country}</TableCell>
                <TableCell align="right">{formatMoney(e.salary, e.currency)}</TableCell>
                <TableCell>{e.hired_on}</TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  <IconButton size="small" aria-label={`Edit ${e.full_name}`} onClick={() => setEditing(e)}>✎</IconButton>
                  <IconButton size="small" aria-label={`Delete ${e.full_name}`} onClick={() => remove(e)}>🗑</IconButton>
                </TableCell>
              </TableRow>
            ))}
            {list.data?.data.length === 0 && (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                No employees match these filters.
              </TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination component="div" count={list.data?.meta.total ?? 0} page={page} rowsPerPage={perPage}
          rowsPerPageOptions={[10, 25, 50, 100]} onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setPerPage(Number(e.target.value)); setPage(0) }}
          labelDisplayedRows={({ from, to, count }) => `${formatCount(from)}–${formatCount(to)} of ${formatCount(count)}`} />
      </TableContainer>

      {editing && meta.data && (
        <EmployeeForm open meta={meta.data} employee={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setToast(editing === 'new' ? 'Employee added' : 'Employee updated'); setEditing(null); list.reload(); meta.reload() }} />
      )}
      <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast('')} message={toast} />
    </Stack>
  )
}

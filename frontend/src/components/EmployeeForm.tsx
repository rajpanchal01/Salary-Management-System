import { useState } from 'react'
import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField,
} from '@mui/material'
import { api, ApiError } from '../api/client'
import type { Employee, EmployeeInput, FieldErrors, Meta } from '../api/types'
import { validateEmployee } from '../lib/validate'

const EMPTY: EmployeeInput = {
  full_name: '', email: '', job_title: '', department: '', country: '', salary: '', hired_on: '',
}

interface Props {
  open: boolean
  employee?: Employee
  meta: Meta
  onClose: () => void
  onSaved: () => void
}

export default function EmployeeForm({ open, employee, meta, onClose, onSaved }: Props) {
  const [form, setForm] = useState<EmployeeInput>(employee ?? EMPTY)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState('')
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof EmployeeInput>(k: K, v: EmployeeInput[K]) => setForm((f) => ({ ...f, [k]: v }))
  const currency = meta.countries.find((c) => c.code === form.country)?.currency

  const field = (name: keyof EmployeeInput, label: string, extra: object = {}) => (
    <TextField
      label={label} size="small" fullWidth required value={form[name]}
      onChange={(e) => set(name, e.target.value as never)}
      error={!!errors[name]} helperText={errors[name]?.join(', ')}
      slotProps={{ htmlInput: { 'aria-label': label } }} {...extra}
    />
  )

  async function submit() {
    const clientErrors = validateEmployee(form)
    setErrors(clientErrors)
    if (Object.keys(clientErrors).length) return
    setSaving(true); setServerError('')
    try {
      const payload = { ...form, salary: Number(form.salary) }
      if (employee) await api.updateEmployee(employee.id, payload)
      else await api.createEmployee(payload)
      onSaved()
    } catch (e) {
      if (e instanceof ApiError && Object.keys(e.fieldErrors).length) setErrors(e.fieldErrors)
      else setServerError('Could not save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{employee ? 'Edit employee' : 'Add employee'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {serverError && <Alert severity="error">{serverError}</Alert>}
          {errors.base && <Alert severity="error">{errors.base.join(', ')}</Alert>}
          {field('full_name', 'Full name')}
          {field('email', 'Email', { type: 'email' })}
          <Stack direction="row" spacing={2}>
            {field('job_title', 'Job title', { select: false, slotProps: { htmlInput: { list: 'titles', 'aria-label': 'Job title' } } })}
            {field('department', 'Department', { slotProps: { htmlInput: { list: 'depts', 'aria-label': 'Department' } } })}
          </Stack>
          <datalist id="titles">{meta.job_titles.map((t) => <option key={t} value={t} />)}</datalist>
          <datalist id="depts">{meta.departments.map((d) => <option key={d} value={d} />)}</datalist>
          <Stack direction="row" spacing={2}>
            {field('country', 'Country', { select: true, children: meta.countries.map((c) => (
              <MenuItem key={c.code} value={c.code}>{c.name}</MenuItem>
            )), slotProps: { htmlInput: { 'aria-label': 'Country' } } })}
            {field('salary', `Annual salary${currency ? ` (${currency})` : ''}`, { type: 'number' })}
          </Stack>
          {field('hired_on', 'Hire date', { type: 'date', slotProps: { inputLabel: { shrink: true }, htmlInput: { 'aria-label': 'Hire date' } } })}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
      </DialogActions>
    </Dialog>
  )
}

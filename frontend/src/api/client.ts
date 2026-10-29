import type {
  Band, Employee, EmployeeInput, FieldErrors, GroupStats, ListParams, Meta, Page, Stats, TopEarner,
} from './types'

const BASE = import.meta.env.VITE_API_URL ?? ''

export class ApiError extends Error {
  status: number
  fieldErrors: FieldErrors
  constructor(status: number, fieldErrors: FieldErrors) {
    super(Object.values(fieldErrors).flat().join(', ') || `Request failed (${status})`)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

export function toQuery(params: Record<string, string | number | undefined>): string {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') qs.set(k, String(v))
  }
  const s = qs.toString()
  return s ? `?${s}` : ''
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (res.status === 204) return undefined as T
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(res.status, body.errors ?? {})
  return body as T
}

export const api = {
  meta: () => request<Meta>('/meta'),
  listEmployees: (p: ListParams) => request<Page<Employee>>(`/employees${toQuery({ ...p })}`),
  createEmployee: (e: EmployeeInput) =>
    request<Employee>('/employees', { method: 'POST', body: JSON.stringify({ employee: e }) }),
  updateEmployee: (id: number, e: EmployeeInput) =>
    request<Employee>(`/employees/${id}`, { method: 'PATCH', body: JSON.stringify({ employee: e }) }),
  deleteEmployee: (id: number) => request<void>(`/employees/${id}`, { method: 'DELETE' }),
  summary: (f: Filters = {}) => request<Stats>(`/insights/summary${toQuery({ ...f })}`),
  groups: (by: string, f: Filters = {}) => request<GroupStats[]>(`/insights/groups${toQuery({ by, ...f })}`),
  distribution: (f: Filters = {}) => request<Band[]>(`/insights/distribution${toQuery({ ...f })}`),
  top: (f: Filters = {}, limit = 10) => request<TopEarner[]>(`/insights/top${toQuery({ limit, ...f })}`),
}

export interface Filters { country?: string; department?: string; job_title?: string }

export interface Employee {
  id: number
  full_name: string
  email: string
  job_title: string
  department: string
  country: string
  currency: string
  salary: number
  hired_on: string
}

export type EmployeeInput = Omit<Employee, 'id' | 'currency' | 'salary'> & { salary: number | '' }

export interface Page<T> {
  data: T[]
  meta: { page: number; per_page: number; total: number; total_pages: number }
}

export interface Meta {
  countries: { code: string; name: string; currency: string }[]
  departments: string[]
  job_titles: string[]
}

export interface Stats {
  headcount: number
  min: number | null
  avg: number | null
  median: number | null
  max: number | null
}

export interface GroupStats extends Stats {
  key: string
  local?: Stats & { currency: string }
}

export interface Band { label: string; count: number }

export interface TopEarner {
  id: number; full_name: string; job_title: string; country: string
  salary: number; currency: string; salary_usd: number
}

export interface ListParams {
  q?: string; country?: string; department?: string; job_title?: string
  sort?: string; dir?: 'asc' | 'desc'; page?: number; per_page?: number
}

export type FieldErrors = Record<string, string[]>

import type { EmployeeInput, FieldErrors } from '../api/types'

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

// Mirrors the server rules for instant feedback; the server remains the source of truth.
export function validateEmployee(e: EmployeeInput): FieldErrors {
  const errors: FieldErrors = {}
  const add = (field: string, msg: string) => (errors[field] ??= []).push(msg)

  if (!e.full_name.trim()) add('full_name', "can't be blank")
  if (!e.job_title.trim()) add('job_title', "can't be blank")
  if (!e.department.trim()) add('department', "can't be blank")
  if (!e.country) add('country', "can't be blank")
  if (!e.hired_on) add('hired_on', "can't be blank")
  if (!EMAIL.test(e.email.trim())) add('email', 'is invalid')
  if (e.salary === '' || !Number.isInteger(Number(e.salary)) || Number(e.salary) <= 0) {
    add('salary', 'must be a positive whole number')
  }
  return errors
}

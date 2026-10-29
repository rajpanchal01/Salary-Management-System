import { validateEmployee } from './validate'
import type { EmployeeInput } from '../api/types'

const valid: EmployeeInput = {
  full_name: 'Asha Rao', email: 'asha@acme.test', job_title: 'Engineer',
  department: 'Engineering', country: 'IN', salary: 1200000, hired_on: '2020-01-01',
}

describe('validateEmployee', () => {
  it('accepts a valid employee', () => {
    expect(validateEmployee(valid)).toEqual({})
  })
  it('flags blank required fields', () => {
    const errors = validateEmployee({ ...valid, full_name: ' ', country: '', hired_on: '' })
    expect(Object.keys(errors).sort()).toEqual(['country', 'full_name', 'hired_on'])
  })
  it('rejects malformed email', () => {
    expect(validateEmployee({ ...valid, email: 'nope' }).email).toBeDefined()
  })
  it.each<[number | '', string]>([['', 'blank'], [0, 'zero'], [-5, 'negative'], [10.5, 'fractional']])(
    'rejects salary %s (%s)', (salary) => {
      expect(validateEmployee({ ...valid, salary }).salary).toBeDefined()
    })
})

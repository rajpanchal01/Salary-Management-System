import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EmployeeForm from './EmployeeForm'
import { api } from '../api/client'
import type { Meta } from '../api/types'

const meta: Meta = {
  countries: [{ code: 'IN', name: 'India', currency: 'INR' }],
  departments: ['Engineering'],
  job_titles: ['Engineer'],
}

afterEach(() => vi.restoreAllMocks())

describe('EmployeeForm', () => {
  it('shows validation errors and does not call the API when empty', async () => {
    const create = vi.spyOn(api, 'createEmployee')
    render(<EmployeeForm open meta={meta} onClose={vi.fn()} onSaved={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getAllByText("can't be blank").length).toBeGreaterThan(0)
    expect(create).not.toHaveBeenCalled()
  })

  it('submits a valid employee with a numeric salary', async () => {
    const create = vi.spyOn(api, 'createEmployee').mockResolvedValue({} as never)
    const onSaved = vi.fn()
    render(<EmployeeForm open meta={meta} onClose={vi.fn()} onSaved={onSaved} />)
    const u = userEvent.setup()
    await u.type(screen.getByRole('textbox', { name: 'Full name' }), 'Asha Rao')
    await u.type(screen.getByRole('textbox', { name: 'Email' }), 'asha@acme.test')
    await u.type(screen.getByRole('combobox', { name: 'Job title' }), 'Engineer')
    await u.type(screen.getByRole('combobox', { name: 'Department' }), 'Engineering')
    await u.click(screen.getByRole('combobox', { name: 'Country' }))
    await u.click(await screen.findByRole('option', { name: 'India' }))
    await u.type(screen.getByRole('spinbutton'), '1200000')
    await u.type(screen.getByLabelText('Hire date'), '2020-01-01')
    await u.click(screen.getByRole('button', { name: 'Save' }))
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ salary: 1200000, country: 'IN' }))
    expect(onSaved).toHaveBeenCalled()
  })
})

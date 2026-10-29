import { api, ApiError, toQuery } from './client'

afterEach(() => vi.restoreAllMocks())

function mockFetch(status: number, body: unknown) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(status === 204 ? null : JSON.stringify(body), { status }),
  )
}

describe('toQuery', () => {
  it('drops empty values and encodes the rest', () => {
    expect(toQuery({ q: 'a b', country: '', page: 2, x: undefined })).toBe('?q=a+b&page=2')
    expect(toQuery({})).toBe('')
  })
})

describe('api client', () => {
  it('builds the list URL from params', async () => {
    const spy = mockFetch(200, { data: [], meta: {} })
    await api.listEmployees({ country: 'IN', page: 3 })
    expect(spy.mock.calls[0][0]).toBe('/api/employees?country=IN&page=3')
  })
  it('wraps the employee under the root key on create', async () => {
    const spy = mockFetch(201, {})
    await api.createEmployee({
      full_name: 'A', email: 'a@b.co', job_title: 'x', department: 'y',
      country: 'US', salary: 1, hired_on: '2020-01-01',
    })
    expect(JSON.parse(spy.mock.calls[0][1]!.body as string).employee.full_name).toBe('A')
  })
  it('throws ApiError carrying field errors on 422', async () => {
    mockFetch(422, { errors: { salary: ['must be greater than 0'] } })
    const err = await api.deleteEmployee(1).catch((e) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect(err.fieldErrors.salary).toEqual(['must be greater than 0'])
  })
  it('resolves undefined on 204', async () => {
    mockFetch(204, null)
    await expect(api.deleteEmployee(1)).resolves.toBeUndefined()
  })
})

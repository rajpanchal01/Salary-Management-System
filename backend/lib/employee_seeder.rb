require_relative "employee_generator"

# Bulk-inserts generated employees in batches (insert_all skips per-row validation
# and callbacks, which is what makes 10k rows take ~1s). Data comes from a generator
# that only produces valid values, and DB constraints still apply.
class EmployeeSeeder
  BATCH = 1_000

  def self.call(count: 10_000, seed: 42, reset: true)
    Employee.delete_all if reset
    gen = EmployeeGenerator.new(seed: seed)
    now = Time.current
    count.times.each_slice(BATCH) do |indexes|
      rows = indexes.map { |i| gen.build(i).merge(created_at: now, updated_at: now) }
      Employee.insert_all!(rows)
    end
    Employee.count
  end
end

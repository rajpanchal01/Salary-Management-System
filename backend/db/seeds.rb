require Rails.root.join("lib/employee_seeder")

count = ENV.fetch("COUNT", 10_000).to_i
started = Process.clock_gettime(Process::CLOCK_MONOTONIC)
total = EmployeeSeeder.call(count: count)
puts "Seeded #{total} employees in #{(Process.clock_gettime(Process::CLOCK_MONOTONIC) - started).round(2)}s"

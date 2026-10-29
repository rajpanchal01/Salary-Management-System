require "test_helper"
require Rails.root.join("lib/employee_seeder")

class EmployeeSeederTest < ActiveSupport::TestCase
  test "seeds the requested number of valid, unique employees" do
    assert_equal 300, EmployeeSeeder.call(count: 300)
    assert Employee.all.all?(&:valid?)
    assert_equal 300, Employee.distinct.count(:email)
  end

  test "is deterministic for the same seed" do
    EmployeeSeeder.call(count: 50, seed: 7)
    first = Employee.order(:email).pluck(:email, :salary, :country)
    EmployeeSeeder.call(count: 50, seed: 7)
    assert_equal first, Employee.order(:email).pluck(:email, :salary, :country)
  end

  test "reset replaces existing rows" do
    create_employee
    EmployeeSeeder.call(count: 10)
    assert_equal 10, Employee.count
  end
end

ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"

module EmployeeFactory
  def create_employee(attrs = {})
    @seq = (@seq || 0) + 1
    Employee.create!({ full_name: "Person #{@seq}", email: "p#{@seq}@acme.test", job_title: "Engineer",
                       department: "Engineering", country: "US", salary: 100_000,
                       hired_on: Date.new(2021, 1, 1) }.merge(attrs))
  end
end

class ActiveSupport::TestCase
  include EmployeeFactory
end

require "test_helper"

class EmployeeTest < ActiveSupport::TestCase
  def build(attrs = {})
    Employee.new({ full_name: "Asha Rao", email: "asha@acme.test", job_title: "Engineer",
                   department: "Engineering", country: "IN", salary: 1_200_000,
                   hired_on: Date.new(2020, 1, 1) }.merge(attrs))
  end

  test "valid with all attributes and derives currency from country" do
    e = build
    assert e.valid?
    assert_equal "INR", e.currency
  end

  test "requires core fields" do
    %i[full_name email job_title department country salary hired_on].each do |f|
      assert_not build(f => nil).valid?, "#{f} should be required"
    end
  end

  test "salary must be a positive integer" do
    assert_not build(salary: 0).valid?
    assert_not build(salary: -5).valid?
    assert_not build(salary: 10.5).valid?
  end

  test "email must be unique case-insensitively and well formed" do
    build.save!
    assert_not build(email: "ASHA@acme.test").valid?
    assert_not build(email: "nope").valid?
  end

  test "country must be supported" do
    assert_not build(country: "ZZ").valid?
  end

  test "salary_usd converts using the static rate table" do
    assert_in_delta 12_000, build(salary: 1_000_000, country: "IN").salary_usd, 0.01
    assert_equal 90_000, build(salary: 90_000, country: "US").salary_usd
  end
end

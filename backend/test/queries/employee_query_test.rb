require "test_helper"

class EmployeeQueryTest < ActiveSupport::TestCase
  setup do
    @alice = create_employee(full_name: "Alice Smith", email: "alice@acme.test", country: "US", salary: 150_000)
    @bob   = create_employee(full_name: "Bob Jones", email: "bob@acme.test", country: "IN", department: "Sales", salary: 900_000)
    @cara  = create_employee(full_name: "Cara 100%", email: "cara@acme.test", country: "IN", job_title: "Manager", salary: 2_000_000)
  end

  def run_query(params) = EmployeeQuery.new(ActionController::Parameters.new(params))

  test "defaults to name ascending" do
    assert_equal [@alice, @bob, @cara], run_query({}).records.to_a
  end

  test "filters by country, department and job title" do
    assert_equal [@bob, @cara], run_query(country: "IN").records.to_a
    assert_equal [@bob], run_query(country: "IN", department: "Sales").records.to_a
    assert_equal [@cara], run_query(job_title: "Manager").records.to_a
  end

  test "searches name and email case-insensitively" do
    assert_equal [@alice], run_query(q: "ALICE").records.to_a
    assert_equal [@bob], run_query(q: "bob@").records.to_a
  end

  test "escapes LIKE wildcards in search" do
    assert_equal [@cara], run_query(q: "100%").records.to_a
    assert_empty run_query(q: "%%%x").records.to_a
  end

  test "filters by salary range" do
    assert_equal [@bob], run_query(min_salary: 500_000, max_salary: 1_000_000).records.to_a
  end

  test "sorts by whitelisted column and direction, ignoring unknown columns" do
    assert_equal [@cara, @bob, @alice], run_query(sort: "salary", dir: "desc").records.to_a
    assert_equal [@alice, @bob, @cara], run_query(sort: "id; DROP TABLE employees").records.to_a
  end

  test "paginates and reports total" do
    q = run_query(per_page: 2, page: 2)
    assert_equal [@cara], q.records.to_a
    assert_equal 3, q.total
  end

  test "clamps page and per_page" do
    q = run_query(page: -4, per_page: 100_000)
    assert_equal 1, q.page
    assert_equal EmployeeQuery::MAX_PER_PAGE, q.per_page
  end
end

require "test_helper"

class InsightsTest < ActiveSupport::TestCase
  setup do
    # USD rate: IN 0.012 → 5,000,000 INR = 60,000 USD
    create_employee(country: "US", department: "Engineering", job_title: "Engineer", salary: 100_000)
    create_employee(country: "US", department: "Sales", job_title: "Rep", salary: 60_000)
    create_employee(country: "IN", department: "Engineering", job_title: "Engineer", salary: 5_000_000)
  end

  test "summary is in USD" do
    assert_equal({ headcount: 3, min: 60_000, avg: 73_333, median: 60_000, max: 100_000 }, Insights.new.summary)
  end

  test "by country reports USD and local-currency stats" do
    india = Insights.new.by("country").find { |g| g[:key] == "IN" }
    assert_equal 60_000, india[:avg]
    assert_equal({ currency: "INR", headcount: 1, min: 5_000_000, avg: 5_000_000, median: 5_000_000, max: 5_000_000 }, india[:local])
  end

  test "by department groups across countries in USD and sorts by avg desc" do
    groups = Insights.new.by("department")
    assert_equal %w[Engineering Sales], groups.map { |g| g[:key] }
    assert_equal 80_000, groups.first[:avg]
    assert_nil groups.first[:local]
  end

  test "rejects unknown dimension" do
    assert_raises(ArgumentError) { Insights.new.by("salary; drop") }
  end

  test "distribution buckets USD salaries and covers every employee" do
    dist = Insights.new.distribution
    assert_equal 3, dist.sum { |b| b[:count] }
    assert_equal 2, dist.find { |b| b[:label] == "50k–75k" }[:count]
    assert_equal 1, dist.find { |b| b[:label] == "100k–150k" }[:count]
    assert_equal "< 25k", dist.first[:label]
    assert_equal "200k+", dist.last[:label]
  end

  test "top ranks by USD, not raw local amount" do
    create_employee(country: "JP", salary: 9_000_000) # ≈ 60,300 USD
    top = Insights.new.top(2)
    assert_equal [100_000, 60_300], top.map { |t| t[:salary_usd] }
  end

  test "respects a scoped relation" do
    assert_equal 2, Insights.new(Employee.where(country: "US")).summary[:headcount]
  end
end

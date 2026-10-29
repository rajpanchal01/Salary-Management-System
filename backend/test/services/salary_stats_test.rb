require "test_helper"

class SalaryStatsTest < ActiveSupport::TestCase
  test "empty input yields zero headcount and nil stats" do
    assert_equal({ headcount: 0, min: nil, avg: nil, median: nil, max: nil }, SalaryStats.call([]))
  end

  test "odd count median is the middle value" do
    assert_equal({ headcount: 3, min: 10, avg: 20, median: 20, max: 30 }, SalaryStats.call([30, 10, 20]))
  end

  test "even count median averages the two middle values" do
    assert_equal 25, SalaryStats.call([10, 20, 30, 40])[:median]
  end

  test "outlier moves avg but not median" do
    stats = SalaryStats.call([100, 100, 100, 1_000])
    assert_equal 100, stats[:median]
    assert_equal 325, stats[:avg]
  end
end

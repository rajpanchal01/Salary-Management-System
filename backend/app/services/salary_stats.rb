# Pure descriptive statistics over a list of numbers. No DB, no Rails: easy to test.
class SalaryStats
  EMPTY = { headcount: 0, min: nil, avg: nil, median: nil, max: nil }.freeze

  def self.call(values)
    return EMPTY.dup if values.empty?

    sorted = values.sort
    {
      headcount: sorted.size,
      min: sorted.first.round,
      avg: (sorted.sum / sorted.size.to_f).round,
      median: median(sorted).round,
      max: sorted.last.round
    }
  end

  def self.median(sorted)
    mid = sorted.size / 2
    sorted.size.odd? ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2.0
  end
  private_class_method :median
end

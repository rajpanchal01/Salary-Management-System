# Answers "how do we pay people?" questions.
# Salaries are normalised to USD so that groups spanning countries are comparable.
# Aggregation happens in Ruby over a single narrow pluck: ~10k rows takes a few ms,
# and keeps the median/band logic simple and unit-testable (trade-off noted in docs).
class Insights
  DIMENSIONS = %w[country department job_title].freeze
  # Upper-exclusive USD band edges; the last band is open-ended.
  BAND_EDGES = [25_000, 50_000, 75_000, 100_000, 150_000, 200_000].freeze

  def initialize(scope = Employee.all)
    @scope = scope
  end

  def summary
    SalaryStats.call(rows.map(&:usd))
  end

  # Stats per group, in USD. For "country" we also report local-currency stats,
  # since every employee in a country shares one currency.
  def by(dimension)
    raise ArgumentError, "unknown dimension: #{dimension}" unless DIMENSIONS.include?(dimension)

    rows.group_by { |r| r.public_send(dimension) }.map do |key, group|
      entry = { key: key, **SalaryStats.call(group.map(&:usd)) }
      entry[:local] = { currency: Countries.find(key).currency, **SalaryStats.call(group.map(&:salary)) } if dimension == "country"
      entry
    end.sort_by { |e| -e[:avg] }
  end

  def distribution
    counts = Array.new(BAND_EDGES.size + 1, 0)
    rows.each { |r| counts[BAND_EDGES.index { |edge| r.usd < edge } || BAND_EDGES.size] += 1 }
    labels = band_labels
    counts.each_with_index.map { |count, i| { label: labels[i], count: count } }
  end

  def top(limit = 10)
    @scope.to_a.max_by(limit.clamp(1, 100)) { |e| e.salary_usd }
          .map { |e| { id: e.id, full_name: e.full_name, job_title: e.job_title, country: e.country,
                       salary: e.salary, currency: e.currency, salary_usd: e.salary_usd.round } }
  end

  private

  Row = Struct.new(:country, :department, :job_title, :salary, :usd)

  def rows
    @rows ||= @scope.pluck(:country, :department, :job_title, :salary).map do |country, dept, title, salary|
      Row.new(country, dept, title, salary, salary * Countries.find(country).usd_rate)
    end
  end

  def band_labels
    edges = BAND_EDGES.map { |e| "#{e / 1000}k" }
    ["< #{edges.first}"] + edges.each_cons(2).map { |a, b| "#{a}–#{b}" } + ["#{edges.last}+"]
  end
end

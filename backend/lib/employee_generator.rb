# Generates realistic, deterministic employee attribute hashes for seeding.
# Same seed => same data, so demos and tests are reproducible.
class EmployeeGenerator
  FIRST_NAMES = %w[Aarav Priya Rahul Anika Liam Emma Noah Olivia Mateo Sofia Hiro Yuki Chen Mei Lucas Hannah
                   Oliver Amelia Arjun Diya Ethan Mia Felix Clara Omar Layla Kenji Aiko Pedro Ana].freeze
  LAST_NAMES = %w[Sharma Patel Singh Kumar Smith Johnson Brown Garcia Muller Schmidt Tanaka Sato Wang Li
                  Silva Santos Dubois Martin Wilson Taylor Nguyen Khan Ali Rossi Nakamura Costa Reddy Iyer Jones Davis].freeze

  # department => [[job_title, base USD salary], ...]
  ROLES = {
    "Engineering" => [["Software Engineer", 95_000], ["Senior Software Engineer", 130_000], ["Engineering Manager", 165_000], ["QA Engineer", 75_000]],
    "Product" => [["Product Manager", 120_000], ["Product Designer", 95_000]],
    "Sales" => [["Account Executive", 85_000], ["Sales Manager", 125_000]],
    "Marketing" => [["Marketing Specialist", 70_000], ["Marketing Manager", 105_000]],
    "Finance" => [["Accountant", 72_000], ["Financial Analyst", 88_000]],
    "HR" => [["HR Generalist", 65_000], ["Recruiter", 68_000]],
    "Operations" => [["Operations Analyst", 70_000], ["Operations Manager", 110_000]]
  }.freeze
  JOBS = ROLES.flat_map { |dept, roles| roles.map { |title, base| [dept, title, base] } }.freeze

  # Rough cost-of-labour multiplier so country pay differs realistically in USD terms.
  COUNTRY_PAY_FACTOR = { "US" => 1.0, "IN" => 0.3, "GB" => 0.8, "DE" => 0.85, "FR" => 0.8, "CA" => 0.9,
                         "AU" => 0.9, "SG" => 0.85, "JP" => 0.75, "BR" => 0.35 }.freeze
  COUNTRY_WEIGHTS = { "US" => 25, "IN" => 25, "GB" => 10, "DE" => 8, "FR" => 6, "CA" => 6, "AU" => 5, "SG" => 5, "JP" => 5, "BR" => 5 }.freeze

  def initialize(seed: 42)
    @rng = Random.new(seed)
    @countries = COUNTRY_WEIGHTS.flat_map { |code, w| [code] * w }
  end

  # i is the 0-based index; it is baked into the email so uniqueness is guaranteed.
  def build(i)
    first = FIRST_NAMES.sample(random: @rng)
    last = LAST_NAMES.sample(random: @rng)
    dept, title, base_usd = JOBS.sample(random: @rng)
    country = @countries.sample(random: @rng)
    info = Countries.find(country)
    usd = base_usd * COUNTRY_PAY_FACTOR[country] * (0.85 + @rng.rand * 0.3)
    {
      full_name: "#{first} #{last}",
      email: "#{first}.#{last}.#{i + 1}@acme.test".downcase,
      job_title: title, department: dept, country: country,
      salary: round_salary(usd / info.usd_rate),
      hired_on: Date.new(2010, 1, 1) + @rng.rand(0..5_400)
    }
  end

  private

  def round_salary(amount)
    step = amount > 1_000_000 ? 10_000 : 500
    [(amount / step).round * step, step].max
  end
end

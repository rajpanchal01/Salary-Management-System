# Static reference data: supported countries, their ISO currency and an
# approximate USD rate. Deliberately a constant, not live FX (see docs/01-requirements.md).
module Countries
  Info = Struct.new(:code, :name, :currency, :usd_rate, keyword_init: true)

  ALL = [
    Info.new(code: "US", name: "United States", currency: "USD", usd_rate: 1.0),
    Info.new(code: "IN", name: "India", currency: "INR", usd_rate: 0.012),
    Info.new(code: "GB", name: "United Kingdom", currency: "GBP", usd_rate: 1.27),
    Info.new(code: "DE", name: "Germany", currency: "EUR", usd_rate: 1.08),
    Info.new(code: "FR", name: "France", currency: "EUR", usd_rate: 1.08),
    Info.new(code: "CA", name: "Canada", currency: "CAD", usd_rate: 0.74),
    Info.new(code: "AU", name: "Australia", currency: "AUD", usd_rate: 0.66),
    Info.new(code: "SG", name: "Singapore", currency: "SGD", usd_rate: 0.74),
    Info.new(code: "JP", name: "Japan", currency: "JPY", usd_rate: 0.0067),
    Info.new(code: "BR", name: "Brazil", currency: "BRL", usd_rate: 0.2)
  ].freeze

  BY_CODE = ALL.index_by(&:code).freeze

  def self.codes = BY_CODE.keys
  def self.find(code) = BY_CODE[code]
end

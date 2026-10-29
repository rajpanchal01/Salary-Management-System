class Employee < ApplicationRecord
  EMAIL_FORMAT = /\A[^@\s]+@[^@\s]+\.[^@\s]+\z/

  before_validation { self.email = email.to_s.strip.downcase.presence }

  validates :full_name, :job_title, :department, :hired_on, presence: true
  validates :email, presence: true, format: { with: EMAIL_FORMAT }, uniqueness: true
  validates :country, inclusion: { in: ->(_) { Countries.codes } }
  validates :salary, numericality: { only_integer: true, greater_than: 0 }

  def currency = Countries.find(country)&.currency
  def salary_usd = salary * Countries.find(country).usd_rate
end

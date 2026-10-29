# Reference data the UI needs to populate filters and forms.
class MetaController < ApplicationController
  def show
    render json: {
      countries: Countries::ALL.map { |c| c.to_h.slice(:code, :name, :currency) },
      departments: Employee.distinct.order(:department).pluck(:department),
      job_titles: Employee.distinct.order(:job_title).pluck(:job_title)
    }
  end
end

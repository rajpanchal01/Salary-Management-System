class InsightsController < ApplicationController
  def summary = render(json: insights.summary)

  def groups
    dimension = params[:by].to_s
    return render(json: { errors: { by: ["must be one of #{Insights::DIMENSIONS.join(', ')}"] } }, status: :bad_request) unless Insights::DIMENSIONS.include?(dimension)

    render json: insights.by(dimension)
  end

  def distribution = render(json: insights.distribution)

  def top = render(json: insights.top(params.fetch(:limit, 10).to_i))

  private

  # Optional filters let HR slice insights (e.g. "Engineering in India").
  def insights
    scope = Employee.all
    %i[country department job_title].each { |k| scope = scope.where(k => params[k]) if params[k].present? }
    Insights.new(scope)
  end
end

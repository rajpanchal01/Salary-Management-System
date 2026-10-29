class ApplicationController < ActionController::API
  rescue_from ActiveRecord::RecordNotFound do
    render json: { errors: { base: ["Not found"] } }, status: :not_found
  end

  rescue_from ActionController::ParameterMissing do |e|
    render json: { errors: { base: [e.message] } }, status: :bad_request
  end
end

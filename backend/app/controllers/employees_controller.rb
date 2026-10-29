class EmployeesController < ApplicationController
  before_action :set_employee, only: %i[show update destroy]

  def index
    query = EmployeeQuery.new(params)
    render json: {
      data: query.records.map { |e| serialize(e) },
      meta: { page: query.page, per_page: query.per_page, total: query.total,
              total_pages: (query.total / query.per_page.to_f).ceil }
    }
  end

  def show = render(json: serialize(@employee))

  def create
    employee = Employee.new(employee_params)
    if employee.save
      render json: serialize(employee), status: :created
    else
      render_errors(employee)
    end
  end

  def update
    if @employee.update(employee_params)
      render json: serialize(@employee)
    else
      render_errors(@employee)
    end
  end

  def destroy
    @employee.destroy!
    head :no_content
  end

  private

  def set_employee = (@employee = Employee.find(params[:id]))

  def employee_params
    params.require(:employee).permit(:full_name, :email, :job_title, :department, :country, :salary, :hired_on)
  end

  def serialize(e)
    e.as_json(only: %i[id full_name email job_title department country salary hired_on])
     .merge("currency" => e.currency)
  end

  def render_errors(record)
    render json: { errors: record.errors.to_hash(true) }, status: :unprocessable_entity
  end
end

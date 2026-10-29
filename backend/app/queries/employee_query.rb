# Builds the filtered / sorted / paginated employee list.
# Kept out of the controller so it is unit-testable and reusable.
class EmployeeQuery
  SORTABLE = %w[full_name email job_title department country salary hired_on].freeze
  DEFAULT_PER_PAGE = 25
  MAX_PER_PAGE = 100

  attr_reader :page, :per_page

  def initialize(params, scope: Employee.all)
    @params = params
    @scope = scope
    @page = [params[:page].to_i, 1].max
    @per_page = params[:per_page].to_i.clamp(1, MAX_PER_PAGE) if params[:per_page].present?
    @per_page ||= DEFAULT_PER_PAGE
  end

  # Filtered and sorted, not paginated (used for totals).
  def filtered
    @filtered ||= sort(filter(@scope))
  end

  def total = filtered.count

  def records
    filtered.offset((page - 1) * per_page).limit(per_page)
  end

  private

  def filter(scope)
    %i[country department job_title].each do |key|
      scope = scope.where(key => @params[key]) if @params[key].present?
    end
    if (q = @params[:q].to_s.strip).present?
      like = "%#{Employee.sanitize_sql_like(q.downcase)}%"
      scope = scope.where("LOWER(full_name) LIKE :q ESCAPE '\\' OR email LIKE :q ESCAPE '\\'", q: like)
    end
    scope = scope.where("salary >= ?", @params[:min_salary].to_i) if @params[:min_salary].present?
    scope = scope.where("salary <= ?", @params[:max_salary].to_i) if @params[:max_salary].present?
    scope
  end

  def sort(scope)
    column = SORTABLE.include?(@params[:sort]) ? @params[:sort] : "full_name"
    direction = @params[:dir].to_s.downcase == "desc" ? :desc : :asc
    scope.order(column => direction, id: :asc) # id tiebreaker keeps paging stable
  end
end

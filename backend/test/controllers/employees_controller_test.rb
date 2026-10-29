require "test_helper"

class EmployeesControllerTest < ActionDispatch::IntegrationTest
  def valid_params(extra = {})
    { employee: { full_name: "Dev Patel", email: "dev@acme.test", job_title: "Engineer",
                  department: "Engineering", country: "GB", salary: 70_000, hired_on: "2022-03-01" }.merge(extra) }
  end

  test "index returns data with pagination meta" do
    create_employee(full_name: "Zed")
    create_employee(full_name: "Amy")
    get "/api/employees", params: { per_page: 1 }
    assert_response :success
    body = response.parsed_body
    assert_equal ["Amy"], body["data"].map { |e| e["full_name"] }
    assert_equal({ "page" => 1, "per_page" => 1, "total" => 2, "total_pages" => 2 }, body["meta"])
  end

  test "create returns 201 with currency" do
    assert_difference "Employee.count", 1 do
      post "/api/employees", params: valid_params, as: :json
    end
    assert_response :created
    assert_equal "GBP", response.parsed_body["currency"]
  end

  test "create with invalid data returns 422 and errors" do
    post "/api/employees", params: valid_params(salary: -1, email: ""), as: :json
    assert_response :unprocessable_entity
    assert response.parsed_body["errors"].key?("salary")
  end

  test "missing employee root param returns 400" do
    post "/api/employees", params: {}, as: :json
    assert_response :bad_request
  end

  test "show, update and destroy" do
    e = create_employee
    get "/api/employees/#{e.id}"
    assert_response :success

    patch "/api/employees/#{e.id}", params: { employee: { salary: 123_456 } }, as: :json
    assert_response :success
    assert_equal 123_456, e.reload.salary

    assert_difference "Employee.count", -1 do
      delete "/api/employees/#{e.id}"
    end
    assert_response :no_content
  end

  test "unknown id returns 404" do
    get "/api/employees/0"
    assert_response :not_found
  end

  test "meta lists countries and distinct departments" do
    create_employee(department: "Sales")
    get "/api/meta"
    body = response.parsed_body
    assert_includes body["departments"], "Sales"
    assert_includes body["countries"].map { |c| c["code"] }, "IN"
  end
end

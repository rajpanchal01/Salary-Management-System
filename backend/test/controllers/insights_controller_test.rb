require "test_helper"

class InsightsControllerTest < ActionDispatch::IntegrationTest
  setup do
    create_employee(country: "US", department: "Engineering", salary: 100_000)
    create_employee(country: "US", department: "Sales", salary: 50_000)
  end

  test "summary" do
    get "/api/insights/summary"
    assert_response :success
    assert_equal 2, response.parsed_body["headcount"]
  end

  test "summary honours filters" do
    get "/api/insights/summary", params: { department: "Sales" }
    assert_equal 50_000, response.parsed_body["max"]
  end

  test "groups requires a valid dimension" do
    get "/api/insights/groups", params: { by: "department" }
    assert_response :success
    assert_equal 2, response.parsed_body.size

    get "/api/insights/groups", params: { by: "bogus" }
    assert_response :bad_request
  end

  test "distribution and top" do
    get "/api/insights/distribution"
    assert_equal 7, response.parsed_body.size
    get "/api/insights/top", params: { limit: 1 }
    assert_equal 100_000, response.parsed_body.first["salary_usd"]
  end
end

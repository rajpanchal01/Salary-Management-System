require "test_helper"

class StaticControllerTest < ActionDispatch::IntegrationTest
  test "client-side routes serve the SPA entry point when it is built" do
    index = Rails.public_path.join("index.html")
    File.write(index, "<html>spa</html>")
    get "/insights"
    assert_response :success
    assert_includes response.body, "spa"
  ensure
    File.delete(index) if File.exist?(index)
  end

  test "unbuilt frontend gives a helpful 404 instead of a routing error" do
    get "/insights"
    assert_response :not_found
    assert_includes response.body, "Frontend not built"
  end

  test "unknown api paths are not swallowed by the SPA fallback" do
    get "/api/nope"
    assert_response :not_found
  end
end

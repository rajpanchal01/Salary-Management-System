# Serves the built React app for client-side routes (e.g. /insights) so deep links and refreshes work.
class StaticController < ActionController::API
  def index
    index_file = Rails.public_path.join("index.html")
    if index_file.exist?
      send_file index_file, type: "text/html", disposition: "inline"
    else
      render plain: "Frontend not built. Run the Vite dev server (see README).", status: :not_found
    end
  end
end

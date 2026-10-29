Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  scope :api do
    resources :employees, only: %i[index show create update destroy]
    get "meta", to: "meta#show"
  end
end

Rails.application.routes.draw do
  # Health check endpoint
  get 'health', to: 'health#show'

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # API routes
  namespace :api do
    # Auth endpoints
    post 'auth/login', to: 'auth#login'
    post 'auth/logout', to: 'auth#logout'
    get 'auth/session', to: 'auth#session'

    # RESTful resources
    resources :users
    resources :items
  end
end

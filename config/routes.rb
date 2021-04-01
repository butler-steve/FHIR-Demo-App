Rails.application.routes.draw do
  root "app#index"

  get "/app", to: "app#index"
  get "/patients/stream", to: "patients#stream"
  get "/patients/onechunk", to: "patients#onechunk"
  get "/patients/all", to: "patients#all"

  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
end

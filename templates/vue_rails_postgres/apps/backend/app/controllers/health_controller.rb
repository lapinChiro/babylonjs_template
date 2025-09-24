class HealthController < ApplicationController
  # GET /health
  def show
    render json: { status: 'ok' }, status: :ok
  end
end
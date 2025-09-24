module JwtAuthenticatable
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_request!
  end

  private

  def authenticate_request!
    header = request.headers['Authorization']
    if header.nil?
      render json: { success: false, error: 'Unauthorized' }, status: :unauthorized
      return
    end

    token = header.split(' ').last if header.present?
    decoded = JwtService.decode(token)

    if decoded
      @current_user = User.active.find(decoded[:user_id])
    else
      render json: { success: false, error: 'Invalid token' }, status: :unauthorized
    end
  rescue ActiveRecord::RecordNotFound
    render json: { success: false, error: 'User not found' }, status: :unauthorized
  rescue => e
    Rails.logger.error "Authentication error: #{e.message}"
    render json: { success: false, error: 'Unauthorized' }, status: :unauthorized
  end

  def current_user
    @current_user
  end
end
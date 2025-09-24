module ErrorHandler
  extend ActiveSupport::Concern

  included do
    rescue_from ActiveRecord::RecordNotFound do |e|
      render json: {
        success: false,
        message: 'Record not found'
      }, status: :not_found
    end

    rescue_from ActiveRecord::RecordInvalid do |e|
      render json: {
        success: false,
        message: 'Validation error',
        error: e.record.errors.full_messages.join(', ')
      }, status: :bad_request
    end

    rescue_from ActiveRecord::RecordNotUnique do |e|
      render json: {
        success: false,
        message: 'Record already exists',
        error: 'This record violates a uniqueness constraint'
      }, status: :bad_request
    end

    rescue_from ActionController::ParameterMissing do |e|
      render json: {
        success: false,
        message: 'Parameter missing',
        error: e.message
      }, status: :bad_request
    end

    rescue_from StandardError do |e|
      Rails.logger.error "Unhandled error: #{e.class} - #{e.message}"
      Rails.logger.error e.backtrace.join("\n") if Rails.env.development?

      render json: {
        success: false,
        message: 'Internal server error',
        error: Rails.env.development? ? e.message : 'An unexpected error occurred'
      }, status: :internal_server_error
    end
  end
end
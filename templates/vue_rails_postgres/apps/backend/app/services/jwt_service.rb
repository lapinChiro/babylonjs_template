require 'jwt'

class JwtService
  class << self
    def encode(payload, exp = 24.hours.from_now)
      payload[:exp] = exp.to_i
      JWT.encode(payload, secret_key, 'HS256')
    end

    def decode(token)
      return nil if token.nil?

      decoded = JWT.decode(token, secret_key, true, algorithm: 'HS256')[0]
      HashWithIndifferentAccess.new(decoded)
    rescue JWT::DecodeError, JWT::ExpiredSignature, JWT::VerificationError => e
      Rails.logger.error "JWT decode error: #{e.message}"
      nil
    end

    private

    def secret_key
      ENV['JWT_SECRET'] || Rails.application.credentials.secret_key_base || 'dev-secret-key-change-in-production'
    end
  end
end
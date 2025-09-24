class Api::AuthController < ApplicationController
  include JwtAuthenticatable
  skip_before_action :authenticate_request!, only: [:login, :logout]

  def login
    user = User.active.find_by(email: login_params[:email]&.downcase)

    if user&.authenticate(login_params[:password])
      token = JwtService.encode({ user_id: user.id, email: user.email })

      render json: {
        success: true,
        data: {
          token: token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          }
        }
      }, status: :ok
    else
      render json: {
        success: false,
        error: 'Invalid email or password'
      }, status: :unauthorized
    end
  end

  def logout
    # JWT is stateless, so we just return success
    # Client should remove the token from storage
    render json: {
      success: true,
      data: nil
    }, status: :ok
  end

  def session
    if current_user
      render json: {
        success: true,
        data: {
          user: {
            id: current_user.id,
            name: current_user.name,
            email: current_user.email
          }
        }
      }, status: :ok
    else
      render json: {
        success: false,
        error: 'Unauthorized'
      }, status: :unauthorized
    end
  end

  private

  def login_params
    params.require(:auth).permit(:email, :password)
  rescue ActionController::ParameterMissing
    params.permit(:email, :password)
  end
end
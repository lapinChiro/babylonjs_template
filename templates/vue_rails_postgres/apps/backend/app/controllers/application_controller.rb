class ApplicationController < ActionController::API
  include ErrorHandler

  private

  def current_user
    @current_user
  end
end

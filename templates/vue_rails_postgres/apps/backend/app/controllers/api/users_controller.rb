class Api::UsersController < ApplicationController
  include JwtAuthenticatable
  before_action :set_user, only: [:show, :update, :destroy]

  # GET /api/users
  def index
    users = User.order(created_at: :desc)
    render json: users.map { |user| user_json(user, true) }, status: :ok
  end

  # GET /api/users/:id
  def show
    render json: user_json(@user, true), status: :ok
  end

  # POST /api/users
  def create
    user = User.new(user_params)

    if user.save
      render json: user_json(user, true), status: :created
    else
      render json: {
        success: false,
        message: 'Validation error',
        error: user.errors.full_messages.join(', ')
      }, status: :bad_request
    end
  end

  # PUT /api/users/:id
  def update
    # パスワードが空の場合は除外
    update_params = user_params
    update_params.delete(:password) if update_params[:password].blank?

    if @user.update(update_params)
      render json: user_json(@user, true), status: :ok
    else
      render json: {
        success: false,
        message: 'Validation error',
        error: @user.errors.full_messages.join(', ')
      }, status: :bad_request
    end
  end

  # DELETE /api/users/:id
  def destroy
    @user.destroy
    head :no_content
  end

  private

  def set_user
    @user = User.find(params[:id])
  end

  def user_params
    params.permit(:name, :email, :password, :active)
  end

  # HonoバックエンドではユーザーCRUD APIでidを文字列として返していたので、互換性のため文字列に変換
  def user_json(user, as_string_id = false)
    {
      id: as_string_id ? user.id.to_s : user.id,
      name: user.name,
      email: user.email,
      active: user.active,
      created_at: user.created_at.iso8601
    }
  end
end
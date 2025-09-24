class Api::ItemsController < ApplicationController
  include JwtAuthenticatable
  before_action :set_item, only: [:show, :update, :destroy]

  # GET /api/items
  def index
    items = Item.order(created_at: :desc)
    render json: items.map { |item| item_json(item, true) }, status: :ok
  end

  # GET /api/items/:id
  def show
    render json: item_json(@item, true), status: :ok
  end

  # POST /api/items
  def create
    item = Item.new(item_params)

    if item.save
      render json: item_json(item, true), status: :created
    else
      render json: {
        success: false,
        message: 'Validation error',
        error: item.errors.full_messages.join(', ')
      }, status: :bad_request
    end
  end

  # PUT /api/items/:id
  def update
    if @item.update(item_params)
      render json: item_json(@item, true), status: :ok
    else
      render json: {
        success: false,
        message: 'Validation error',
        error: @item.errors.full_messages.join(', ')
      }, status: :bad_request
    end
  end

  # DELETE /api/items/:id
  def destroy
    @item.destroy
    head :no_content
  end

  private

  def set_item
    @item = Item.find(params[:id])
  end

  def item_params
    params.permit(:name)
  end

  # HonoバックエンドではアイテムCRUD APIでidを文字列として返していたので、互換性のため文字列に変換
  def item_json(item, as_string_id = false)
    {
      id: as_string_id ? item.id.to_s : item.id,
      name: item.name,
      created_at: item.created_at.iso8601,
      updated_at: item.updated_at.iso8601
    }
  end
end
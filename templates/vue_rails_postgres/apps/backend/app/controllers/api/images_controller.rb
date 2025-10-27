module Api
  class ImagesController < ApplicationController
    include JwtAuthenticatable
    before_action :set_image, only: [:show, :destroy]

    # GET /api/images
    def index
      images = Image.order(created_at: :desc)
      render json: images.map { |image| format_image_response(image) }
    end

    # GET /api/images/:id
    def show
      render json: format_image_response(@image)
    end

    # POST /api/images/upload-url
    def upload_url
      filename = params[:filename]
      content_type = params[:content_type]
      size = params[:size]

      # バリデーション
      unless MinioService::ALLOWED_CONTENT_TYPES.include?(content_type)
        return render json: { error: 'サポートされていない画像形式です' }, status: :bad_request
      end

      max_size = 10 * 1024 * 1024 # 10MB
      if size.to_i > max_size
        return render json: { error: 'ファイルサイズは10MB以下にしてください' }, status: :bad_request
      end

      result = MinioService.generate_upload_url(
        filename: filename,
        content_type: content_type
      )

      render json: {
        upload_url: result[:upload_url],
        file_key: result[:file_key],
        expires_in: MinioService.upload_url_expiry
      }
    rescue ArgumentError => e
      render json: { error: e.message }, status: :bad_request
    rescue => e
      Rails.logger.error "Upload URL generation error: #{e.message}"
      render json: { error: 'Failed to generate upload URL' }, status: :internal_server_error
    end

    # POST /api/images/confirm
    def confirm
      file_key = params[:file_key]
      original_name = params[:original_name]
      mime_type = params[:mime_type]
      size = params[:size]

      # ファイルの存在確認とメタデータ取得
      metadata = MinioService.get_file_metadata(file_key: file_key)

      unless metadata[:exists]
        return render json: { error: 'File not found in storage' }, status: :bad_request
      end

      # サイズの二重チェック
      max_size = 10 * 1024 * 1024 # 10MB
      actual_size = metadata[:size]

      if actual_size > max_size
        # サイズ超過の場合はファイルを削除
        MinioService.delete_file(file_key: file_key)
        Rails.logger.warn "⚠️ File size exceeds limit: #{actual_size} bytes (max: #{max_size})"
        return render json: { error: 'File size exceeds limit' }, status: :bad_request
      end

      # クライアントが送信したサイズと実際のサイズを比較
      if actual_size != size.to_i
        Rails.logger.warn "⚠️ Size mismatch for #{file_key}: expected #{size}, got #{actual_size}"
        size = actual_size # 実際のサイズを使用
      end

      image = Image.create!(
        file_key: file_key,
        original_name: original_name,
        mime_type: mime_type,
        size: size,
        user_id: current_user&.id
      )

      render json: format_image_response(image), status: :created
    rescue ActiveRecord::RecordInvalid => e
      render json: { error: e.message }, status: :unprocessable_entity
    rescue => e
      Rails.logger.error "Confirm upload error: #{e.message}"
      render json: { error: 'Failed to save image metadata' }, status: :internal_server_error
    end

    # DELETE /api/images/:id
    def destroy
      # MinIOからファイルを削除
      MinioService.delete_file(file_key: @image.file_key)

      # DBから削除
      @image.destroy

      head :no_content
    rescue => e
      Rails.logger.error "Delete error: #{e.message}"
      render json: { error: 'Failed to delete image' }, status: :internal_server_error
    end

    private

    def set_image
      @image = Image.find(params[:id])
    rescue ActiveRecord::RecordNotFound
      render json: { error: 'Image not found' }, status: :not_found
    end

    def format_image_response(image)
      {
        id: image.id.to_s,
        file_key: image.file_key,
        original_name: image.original_name,
        mime_type: image.mime_type,
        size: image.size,
        url: MinioService.generate_download_url(file_key: image.file_key),
        user_id: image.user_id&.to_s,
        created_at: image.created_at.iso8601,
        updated_at: image.updated_at.iso8601
      }
    end
  end
end

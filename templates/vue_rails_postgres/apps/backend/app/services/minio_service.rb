require 'aws-sdk-s3'

class MinioService
  # 許可するContent-Typeのホワイトリスト
  ALLOWED_CONTENT_TYPES = %w[
    image/jpeg
    image/png
    image/gif
    image/webp
  ].freeze

  # MinIOクライアント初期化（バックエンド操作用）
  # Docker内部からMinIOサービスにアクセスするためのクライアント
  def self.internal_client
    @internal_client ||= Aws::S3::Client.new(
      endpoint: "#{ENV['MINIO_USE_SSL'] == 'true' ? 'https' : 'http'}://#{ENV.fetch('MINIO_ENDPOINT', 'minio')}:#{ENV.fetch('MINIO_PORT', '9000')}",
      access_key_id: ENV.fetch('MINIO_ACCESS_KEY', 'minioadmin'),
      secret_access_key: ENV.fetch('MINIO_SECRET_KEY', 'minioadmin123'),
      region: 'us-east-1',
      force_path_style: true
    )
  end

  # presigned URL生成専用クライアント（外部アクセス用）
  # 重要: 署名にホスト名が含まれるため、最初から外部エンドポイントで署名を生成
  # これによりホスト名変換による署名無効化を回避
  def self.external_client
    @external_client ||= Aws::S3::Client.new(
      endpoint: "#{ENV['MINIO_USE_SSL'] == 'true' ? 'https' : 'http'}://#{ENV.fetch('MINIO_EXTERNAL_ENDPOINT', 'localhost')}:#{ENV.fetch('MINIO_PORT', '9000')}",
      access_key_id: ENV.fetch('MINIO_ACCESS_KEY', 'minioadmin'),
      secret_access_key: ENV.fetch('MINIO_SECRET_KEY', 'minioadmin123'),
      region: 'us-east-1',
      force_path_style: true
    )
  end

  def self.bucket_name
    ENV.fetch('MINIO_BUCKET', 'rails-uploads')
  end

  def self.upload_url_expiry
    600 # 10 minutes
  end

  def self.download_url_expiry
    3600 # 1 hour
  end

  # バケットの存在確認と作成
  def self.ensure_bucket_exists
    internal_client.head_bucket(bucket: bucket_name)
  rescue Aws::S3::Errors::NotFound
    internal_client.create_bucket(bucket: bucket_name)
    Rails.logger.info "✅ Bucket '#{bucket_name}' created successfully"
  rescue => e
    Rails.logger.error "❌ Failed to ensure bucket exists: #{e.message}"
    raise
  end

  # アップロード用署名付きURL生成（バリデーション強化）
  def self.generate_upload_url(filename:, content_type:)
    # Content-Typeバリデーション
    unless ALLOWED_CONTENT_TYPES.include?(content_type)
      raise ArgumentError, "Invalid content type: #{content_type}"
    end

    # ファイル名のサニタイゼーション（パストラバーサル対策）
    sanitized_filename = File.basename(filename)
    ext = File.extname(sanitized_filename)
    file_key = "#{SecureRandom.uuid}#{ext}"

    # presigned URL生成（外部エンドポイントで直接署名）
    # 重要事項:
    # 1. external_clientを使用（endpoint='localhost'）
    # 2. Content-Typeヘッダーを署名に含めない（ブラウザのfetch()が自動付与するため）
    # 3. 最初から外部アクセス可能なURLで署名→変換不要
    signer = Aws::S3::Presigner.new(client: external_client)
    upload_url = signer.presigned_url(
      :put_object,
      bucket: bucket_name,
      key: file_key,
      expires_in: upload_url_expiry
    )

    { upload_url: upload_url, file_key: file_key }
  rescue => e
    Rails.logger.error "❌ Failed to generate upload URL: #{e.message}"
    raise
  end

  # ダウンロード用署名付きURL生成
  def self.generate_download_url(file_key:)
    # 外部エンドポイント用クライアントで直接署名生成
    signer = Aws::S3::Presigner.new(client: external_client)
    signer.presigned_url(
      :get_object,
      bucket: bucket_name,
      key: file_key,
      expires_in: download_url_expiry
    )
  rescue => e
    Rails.logger.error "❌ Failed to generate download URL: #{e.message}"
    raise
  end

  # ファイル削除
  def self.delete_file(file_key:)
    internal_client.delete_object(
      bucket: bucket_name,
      key: file_key
    )
  rescue => e
    Rails.logger.error "❌ Failed to delete file: #{e.message}"
    raise
  end

  # ファイル存在確認とメタデータ取得
  def self.get_file_metadata(file_key:)
    response = internal_client.head_object(
      bucket: bucket_name,
      key: file_key
    )

    {
      exists: true,
      size: response.content_length,
      content_type: response.content_type
    }
  rescue Aws::S3::Errors::NotFound
    { exists: false }
  rescue => e
    Rails.logger.error "❌ Failed to get file metadata: #{e.message}"
    { exists: false }
  end
end

class CreateImages < ActiveRecord::Migration[8.0]
  def change
    create_table :images do |t|
      t.string :file_key, null: false
      t.string :original_name, null: false
      t.string :mime_type, null: false
      t.bigint :size, null: false
      t.references :user, null: true, foreign_key: true

      t.timestamps
    end

    add_index :images, :file_key, unique: true
    add_index :images, :created_at
  end
end

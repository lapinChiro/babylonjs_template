# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

# Create admin user with specific password hash
# This password hash corresponds to a pre-defined password for testing
password_hash = '$2b$10$TIMlZeMFkb9hYdp8EtHPTutZ/vXQEHG.CyAoJ/GF/W7LXS103hltS'

admin = User.find_or_initialize_by(email: 'admin@test.com')
admin.assign_attributes(
  name: 'Admin User',
  password_digest: password_hash,
  active: true
)
admin.save!(validate: false) # Skip validations to allow direct password_digest assignment

puts "Created/Found admin user: #{admin.email}"

# Create demo items
items_data = [
  'MacBook Pro',
  'iPhone 15',
  'iPad Air',
  'AirPods Pro',
  'Magic Mouse',
  'Studio Display'
]

items_data.each do |item_name|
  Item.find_or_create_by!(name: item_name)
  puts "Created/Found item: #{item_name}"
end

puts "Seed data loaded successfully!"

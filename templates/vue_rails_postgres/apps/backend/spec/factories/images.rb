FactoryBot.define do
  factory :image do
    file_key { "MyString" }
    original_name { "MyString" }
    mime_type { "MyString" }
    size { "" }
    user { nil }
  end
end

FactoryGirl.define do
  sequence :note_title do |n|
    "Note #{n}"
  end
  factory :note do 
    title { generate(:note_title) }
    type "Unknown"
  end
end
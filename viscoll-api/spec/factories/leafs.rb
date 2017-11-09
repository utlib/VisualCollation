include ActionDispatch::TestProcess
FactoryGirl.define do
  factory :leaf do
    material "Paper"
    type "Original"
  end
end

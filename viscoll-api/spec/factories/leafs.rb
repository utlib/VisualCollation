include ActionDispatch::TestProcess
FactoryGirl.define do
  factory :leaf do
    material "Paper"
    type "Original"
    
    factory :parchment do
      material "Parchment"
    end
  end
end

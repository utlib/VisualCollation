include ActionDispatch::TestProcess
FactoryGirl.define do
  factory :leaf do
    transient {
      folio_number nil
    }
    after(:create) do |leaf, evaluator|
      unless evaluator.folio_number.blank?
        Side.find(leaf.rectoID).update(folio_number: "#{evaluator.folio_number}R")
        Side.find(leaf.versoID).update(folio_number: "#{evaluator.folio_number}V")
      end
    end
    material "Paper"
    type "Original"
    
    factory :parchment do
      material "Parchment"
    end
  end
end

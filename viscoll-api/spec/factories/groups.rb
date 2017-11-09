FactoryGirl.define do
  sequence :quire_title do |n|
    "Quire #{n}"
  end
  sequence :booklet_title do |n|
    "Booklet #{n}"
  end
  factory :group, class: Group do 
    transient do 
      groupOrder nil
    end
    title { groupOrder ? "Group #{groupOrder}" : generate(:quire_title) }
    type "Quire"
  end

  factory :quire, class: Group do
    title { generate(:quire_title) }
    type "Quire"
  end
  factory :booklet, class: Group do
    title { generate(:booklet_title) }
    type "Booklet"
  end
end

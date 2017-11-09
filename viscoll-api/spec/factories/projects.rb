include ActionDispatch::TestProcess
FactoryGirl.define do
  sequence :title do |n|
    "Project #{n}"
  end

  factory :empty_project, class: Project do
    title { generate(:title) }
    user_id { FactoryGirl.create(:user) }
  end

  factory :project do
    title { generate(:title) }
    user_id { FactoryGirl.create(:user) }
  end
end


# include ActionDispatch::TestProcess
# FactoryGirl.define do
#   sequence :shelfmark do |n|
#     "Cod. UTL #{n}"
#   end

#   sequence :uri do |n|
#     "http://www.example.org/#{n}"
#   end

#   factory :empty_manuscript, class: Manuscript do
#     shelfmark { generate :shelfmark }
#     uri ""
#     date { Date.today }
#   end

#   factory :manuscript do
#     shelfmark { generate :shelfmark }
#     uri { generate :uri }
#     date { Date.today }
#     after(:create) do |m|
#       m.leafs << FactoryGirl.create(:leaf, manuscript: m)
#     end
#   end
# end
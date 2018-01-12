include ActionDispatch::TestProcess
FactoryGirl.define do
  sequence :title do |n|
    "Project #{n}"
  end
  sequence :manifest_id do |n|
    "Manifest_#{n}"
  end
  sequence :manifest_name do |n|
    "Manifest #{n}"
  end
  sequence :manifest_url do |n|
    "https://iiif.example.org/#{n}/manifest.json"
  end

  factory :empty_project, class: Project do
    title { generate(:title) }
    user_id { FactoryGirl.create(:user) }
  end

  factory :project do
    transient do
      with_members []
      with_manifests []
    end
    before(:build) do |project, evaluator|
      evaluator.with_manifests.each do |manifest|
        mid = evaluator.generate(:manifest_id)
        manifest[:id] = mid
        project.manifests[mid] = manifest
      end
    end
    after(:create) do |project, evaluator|
      evaluator.with_members.each do |member|
        member.project_id = project.id
        member.nestLevel ||= 1 
        member.save
      end
      unless evaluator.with_members.blank?
        project.add_groupIDs(evaluator.with_members.collect { |member| member.id.to_s }, 1)
      end
    end
    title { generate(:title) }
    user_id { FactoryGirl.create(:user) }
  end
  
  factory :codex_project, parent: :project do
    transient do
      manifest_count 0
      quire_structure { [[4, 6]] }
    end
    before(:build) do |project, evaluator|
      evaluator.manifest_count.times do
        manifest = FactoryGirl.build(:manifest)
        project.manifests[manifest[:id]] = manifest
      end
    end
    after(:create) do |project, evaluator|
      start_page = 1
      members = []
      evaluator.quire_structure.each do |qs|
        qs[0].times do
          members << FactoryGirl.create(:quire, project_id: project.id, leafs: qs[1], start_page: start_page, nestLevel: 1)
          start_page += qs[1]
        end
      end
      unless members.blank?
        project.add_groupIDs(members.collect { |member| member.id.to_s }, 1)
      end
    end
  end
  
  factory :manifest, class: Hash do
    id { generate(:manifest_id) }
    url { generate(:manifest_url) }
    name { generate(:manifest_name) }
    initialize_with { attributes }
    to_create { }
  end
end

FactoryGirl.define do
  sequence :quire_title do |n|
    "Quire #{n}"
  end
  sequence :booklet_title do |n|
    "Booklet #{n}"
  end
  sequence :group_title do |n|
    "Group #{n}"
  end
  factory :group, class: Group do 
    transient do
      members []
    end
    after(:create) do |group, evaluator|
      group.nestLevel ||= 1
      unless evaluator.members.blank?
        newmembers = evaluator.members.each do |member|
          if member.is_a?(Group)
            member.nestLevel = group.nestLevel+1
          else
            member.nestLevel = group.nestLevel
          end
          member.save
        end
        group.add_members(newmembers.collect { |member| member.id.to_s }, 1)
      end
      group.save
    end
    title { generate(:group_title) }
    type "Quire"
  end
  
  factory :quire, class: Group do
    transient do
      leafs 0
      conjoined true
      leaf_properties { {} }
      start_page 1
    end
    after(:create) do |group, evaluator|
      group.nestLevel ||= 1
      unless evaluator.leafs <= 0
        newleafprops = evaluator.leaf_properties.merge({
          project_id: group.project_id,
          parentID: group.id.to_s,
          nestLevel: group.nestLevel
        })
        newleafs = evaluator.leafs.times.collect { |n| 
          FactoryGirl.build(:leaf, newleafprops.merge({ folio_number: evaluator.start_page+n }))
        }
        if evaluator.conjoined
          evaluator.leafs.times.each do |n|
            unless evaluator.leafs.odd? and n == evaluator.leafs >> 1
              conjoin_id = newleafs[-1-n].id.to_s
              newleafs[n].conjoined_to = if conjoin_id[0..4] == 'Leaf_' then conjoin_id else "Leaf_#{conjoin_id}" end
            end
            newleafs[n].save
          end
        end
        group.add_members(newleafs.collect { |newleaf| newleaf.id.to_s }, 1)
      end
    end
    title { generate(:quire_title) }
    type "Quire"
  end
  
  factory :booklet, parent: :quire do
    title { generate(:booklet_title) }
    type "Booklet"
    leafs 0
  end
end

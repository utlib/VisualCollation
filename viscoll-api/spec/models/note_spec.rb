# require 'rails_helper'

# RSpec.describe Note, type: :model do
#   it { is_expected.to be_mongoid_document }
#   it { is_expected.to have_field(:title).of_type(String) }
#   it { is_expected.to have_field(:type).of_type(String) }
#   it { is_expected.to have_field(:description).of_type(String) }
#   it { is_expected.to have_field(:objects).of_type(Hash) }
#   it { is_expected.to belong_to(:project).with_foreign_key(:project_id) }

#   it "updates linked objects before it gets deleted" do 
#     project = FactoryGirl.create(:project)
#     note = FactoryGirl.create(:note, project: project)
#     group = project.get_root_groups[0]
#     group2 = FactoryGirl.create(:group, project: project, groupOrder: 2)
#     leaf = project.leafs[0]
#     leaf2 = FactoryGirl.create(:leaf, project: project)
#     side = leaf.sides[0]
#     side2 = leaf.sides[1]

#     # Link note to objects
#     group.notes.push(note)
#     group2.notes.push(note)
#     leaf.notes.push(note)
#     leaf2.notes.push(note)
#     side.notes.push(note)
#     side2.notes.push(note)
#     note.objects[:Group].push(group.id.to_s)
#     note.objects[:Group].push(group2.id.to_s)
#     note.objects[:Leaf].push(leaf.id.to_s)
#     note.objects[:Leaf].push(leaf2.id.to_s)
#     note.objects[:Side].push(side.id.to_s)
#     note.objects[:Side].push(side2.id.to_s)

#     expect(group.notes.size).to eq(1)
#     expect(group2.notes.size).to eq(1)
#     expect(leaf.notes.size).to eq(1)
#     expect(leaf2.notes.size).to eq(1)
#     expect(side.notes.size).to eq(1)
#     expect(side2.notes.size).to eq(1)
#     group2.destroy
#     leaf2.destroy
#     side2.destroy

#     note.destroy
#     group.reload
#     leaf.reload
#     side.reload
#     expect(group.notes.size).to eq(0)
#     expect(leaf.notes.size).to eq(0)
#     expect(side.notes.size).to eq(0)
#   end
# end

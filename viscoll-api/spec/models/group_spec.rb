# require 'rails_helper'

# RSpec.describe Group, type: :model do
#   it { is_expected.to be_mongoid_document }
#   it { is_expected.to have_field(:order).of_type(Integer) }
#   it { is_expected.to have_field(:title).of_type(String) }
#   it { is_expected.to have_field(:type).of_type(String) }
#   it { is_expected.to belong_to(:project).with_foreign_key(:project_id) }
#   it { is_expected.to have_and_belong_to_many(:notes).with_foreign_key(:note_ids) }
#   it { is_expected.to have_and_belong_to_many(:groupings).with_foreign_key(:grouping_ids) }

#   before(:each) do
#     @project = FactoryGirl.create(:project)
#     @group = @project.get_root_groups[0]
#     @leaf = FactoryGirl.create(:leaf, project: @project)
#     @group.add_members([@leaf], 1)
#     @nestedGroup = FactoryGirl.create(:group, project: @project, groupOrder: 2)
#     @group.add_members([@nestedGroup], 2)
#   end

#   it "can get its members" do
#     expect(@group.get_member_objects.size).to eq(2)
#     expect(@nestedGroup.get_member_objects.size).to eq(0)
#     expect(@group.get_members.size).to eq(2)
#     expect(@nestedGroup.get_members.size).to eq(0)
#   end

#   it "can get a flattened list of members" do 
#     # Add a leaf in the nested group
#     nestedLeaf = FactoryGirl.create(:leaf, project: @project)
#     @nestedGroup.add_members([nestedLeaf], 1)
#     # Expect 4 items: itself, leaf, nested group and nested leaf 
#     expect(@group.get_flattened_nested_members.size).to eq(4)
#   end

#   it "can get all members, including special leaves 'none' and 'binding'" do 
#     # Expect leaf and nested group 
#     expect(@group.get_members_special.size).to eq(2)
#   end

#   it "can delete a member" do 
#     expect(@group.get_members.size).to eq(2)
#     @group.delete_member(@nestedGroup)
#     @group.reload
#     expect(@group.get_members.size).to eq(1)
#   end

#   it "can delete all its members" do 
#     @group.destroy_members
#     expect(@group.get_members.size).to eq(0)
#   end

#   it "can get its parent" do 
#     expect(@nestedGroup.get_parent).not_to be_nil
#     expect(@nestedGroup.get_parent_id).not_to be_nil
#     expect(@group.get_parent).to be_nil
#     expect(@group.get_parent_id).to be_nil
#   end

#   it "does not re-add an existing member" do 
#     expect(@group.add_members([@leaf], 1)).to eq(false)
#   end

#   it "updates existing member orders when a new member gets inserted" do
#     newLeaf = FactoryGirl.create(:leaf, project: @project)
#     expect(@group.add_members([newLeaf], 1)).to eq(true)
#     # Verify order of members
#     groupings = @group.get_member_groupings
#     expect(groupings[0].member).to eq(newLeaf)
#     expect(groupings[1].member).to eq(@leaf)
#     expect(groupings[2].member).to eq(@nestedGroup)
#   end

#   it "if destroyed, it removes parent's association to this group if any" do 
#     expect(@group.get_members.size).to eq(2)
#     @nestedGroup.destroy
#     @group.reload
#     expect(@group.get_members.size).to eq(1)
#   end
  
# end

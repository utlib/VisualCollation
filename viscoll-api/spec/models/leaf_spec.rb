# require 'rails_helper'

# RSpec.describe Leaf, type: :model do
#   it { is_expected.to be_mongoid_document }
#   it { is_expected.to have_field(:order).of_type(Integer) }
#   it { is_expected.to have_field(:material).of_type(String) }
#   it { is_expected.to have_field(:type).of_type(String) }
#   it { is_expected.to have_field(:attachment_method).of_type(String) }
#   it { is_expected.to have_field(:conjoined_to).of_type(String) }
#   it { is_expected.to have_field(:attached_above).of_type(String) }
#   it { is_expected.to have_field(:attached_below).of_type(String) }
#   it { is_expected.to have_field(:stubType).of_type(String) }
#   it { is_expected.to belong_to(:project).with_foreign_key(:project_id) }
#   it { is_expected.to have_many(:sides).with_foreign_key(:leaf_id) }
#   it { is_expected.to have_many(:groupings).with_foreign_key(:member_id) }
#   it { is_expected.to have_and_belong_to_many(:notes).with_foreign_key(:note_ids) }

#   before(:each) do
#     @project = FactoryGirl.create(:project)
#     @leaf = FactoryGirl.create(:leaf, project: @project, order: 1)
#     @leaf2 = FactoryGirl.create(:leaf, project: @project, order: 2)
#     @group = FactoryGirl.create(:quire)
#   end

#   it "can tell you what type it is" do
#     expect(@leaf.type_of).to eq "Leaf"
#   end

#   it "can get its parent" do
#     expect(@leaf.get_parent).to eq false
#     @group.add_member(@leaf, 1)
#     expect(@leaf.get_parent).to eq @group
#   end

#   it "deletes its grouping relationships when it gets deleted" do 
#     @group.add_member(@leaf, 1)
#     memberCount = @group.get_members.size
#     @leaf.destroy
#     @group.reload
#     expect(@group.get_members.size).to_not eq(memberCount)
#   end

# end
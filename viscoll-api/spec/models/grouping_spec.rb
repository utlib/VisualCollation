# require 'rails_helper'

# RSpec.describe Grouping, type: :model do
#   it { is_expected.to be_mongoid_document }
#   it { is_expected.to have_field(:order).of_type(Integer) }
#   it { is_expected.to belong_to(:group).with_foreign_key(:group_id) }
#   it { is_expected.to belong_to(:member).with_foreign_key(:member_id) }

#   before(:each) do
#     @project = FactoryGirl.create(:project)
#     @leaf = FactoryGirl.create(:leaf, project: @project)
#     @group = FactoryGirl.create(:quire)
#   end

#   it "can delete a member" do
#     @group.add_member(@leaf, 1)
#     @leaf.destroy
#     expect(@group.get_members.size).to eq 0
#   end

# end
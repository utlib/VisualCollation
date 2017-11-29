require 'rails_helper'

RSpec.describe ControllerHelper::GroupsHelper, type: :helper do
  before :each do
    @project = FactoryGirl.create(:project)
    @group = FactoryGirl.create(:group, project: @project)
  end
  
  describe 'addLeavesInside' do
    it 'adds unconjoined leaves' do
      addLeavesInside(@project.id.to_s, @group, 4, false, nil)
      expect(@project.leafs.count).to eq 4
      expect(@group.memberIDs.count).to eq 4
      expect(@project.leafs.all? { |leaf| leaf.conjoined_to.blank? }).to be true
    end
    it 'adds conjoined leaves' do
      addLeavesInside(@project.id.to_s, @group, 4, true, nil)
      expect(@project.leafs.count).to eq 4
      expect(@group.memberIDs.count).to eq 4
      4.times.each do |i|
        expect(@project.leafs[i].conjoined_to).to eq @project.leafs[3-i].id.to_s
      end
    end
  end
end

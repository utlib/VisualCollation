require 'rails_helper'

RSpec.describe ValidationHelper::LeafValidationHelper, type: :helper do
  before :each do
    @project = FactoryGirl.create(:project)
    @group = FactoryGirl.create(:group, project: @project)
    @project.add_groupIDs([@group.id.to_s], 0)
  end
  
  let(:project_id) { @project.id.to_s }
  let(:group_id) { @group.id.to_s }
  
  describe 'validateLeafParams' do
    it 'should accept correct parameters' do
      result = validateLeafParams(project_id, group_id)
      expect(result[:project_id]).to be_empty
      expect(result[:parentID]).to be_empty
    end
    
    describe 'Project' do
      it 'should be required' do
        result = validateLeafParams(nil, group_id)
        expect(result[:project_id]).to include 'is required'
      end
      it 'should be a string' do
        result = validateLeafParams(3, group_id)
        expect(result[:project_id]).to include 'should be a String'
      end
      it 'should exist' do
        result = validateLeafParams(project_id+'missing', group_id)
        expect(result[:project_id]).to include 'project not found'
      end
    end
    
    describe 'Parent' do
      it 'should be required' do
        result = validateLeafParams(project_id, nil)
        expect(result[:parentID]).to include 'is required'
      end
      it 'should be a string' do
        result = validateLeafParams(project_id, 3)
        expect(result[:parentID]).to include 'should be a String'
      end
      it 'should belong to the same project' do
        project2 = FactoryGirl.create(:project)
        group2 = FactoryGirl.create(:group, project: project2)
        project2.add_groupIDs([group2.id.to_s], 0)
        result = validateLeafParams(project_id, group2.id.to_s)
        expect(result[:parentID]).to include 'Group with parentID does not have project_id as a member'
      end
      it 'should exist' do
        result = validateLeafParams(project_id, group_id+'missing')
        expect(result[:parentID]).to include 'group not found'
      end
    end
  end
  
  describe 'validateAdditionalLeafParams' do
    it 'should accept correct parameters' do
      result = validateAdditionalLeafParams(project_id, group_id, 1, 12, true, nil)
      expect(result[:memberOrder]).to be_empty
      expect(result[:noOfLeafs]).to be_empty
      expect(result[:conjoin]).to be_empty
      expect(result[:oddMemberLeftOut]).to be_empty
    end
    
    describe 'memberOrder' do
      it 'should be required' do
        result = validateAdditionalLeafParams(project_id, group_id, nil, 12, true, nil)
        expect(result[:memberOrder]).to include 'is required'
      end
      
      it 'should be an integer' do
        result = validateAdditionalLeafParams(project_id, group_id, 'waahoo', 12, true, nil)
        expect(result[:memberOrder]).to include 'should be an Integer'
      end
      
      it 'should be positive' do
        result = validateAdditionalLeafParams(project_id, group_id, 0, 12, true, nil)
        expect(result[:memberOrder]).to include 'should be greater than 0'
      end
    end
    
    describe 'noOfLeafs' do
      it 'should be required' do
        result = validateAdditionalLeafParams(project_id, group_id, 1, nil, true, nil)
        expect(result[:noOfLeafs]).to include 'is required'
      end
      
      it 'should be an integer' do
        result = validateAdditionalLeafParams(project_id, group_id, 1, 'waahoo', true, nil)
        expect(result[:noOfLeafs]).to include 'should be an Integer'
      end
      
      it 'should be positive' do
        result = validateAdditionalLeafParams(project_id, group_id, 1, 0, true, nil)
        expect(result[:noOfLeafs]).to include 'should range from 1 to 999'
        result = validateAdditionalLeafParams(project_id, group_id, 1, 1, true, nil)
        expect(result[:noOfLeafs]).to be_empty
      end
      
      it 'should be at most 3 digits' do
        result = validateAdditionalLeafParams(project_id, group_id, 1, 999, true, nil)
        expect(result[:noOfLeafs]).to be_empty
        result = validateAdditionalLeafParams(project_id, group_id, 1, 1000, true, nil)
        expect(result[:noOfLeafs]).to include 'should range from 1 to 999'
      end
    end
    
    describe 'conjoin' do
      it 'should be a Boolean if present' do
        result = validateAdditionalLeafParams(project_id, group_id, 1, 12, 'waahoo', nil)
        expect(result[:conjoin]).to include 'should be a Boolean'
      end
      
      it 'should be false if noOfLeafs is 1' do
        result = validateAdditionalLeafParams(project_id, group_id, 1, 1, true, nil)
        expect(result[:conjoin]).to include 'should be false if the number of leaves is 1'
      end
    end
    
    describe 'oddMemberLeftOut' do
      it 'should be an integer if present' do
        result = validateAdditionalLeafParams(project_id, group_id, 1, 11, true, 'waahoo')
        expect(result[:oddMemberLeftOut]).to include 'should be an Integer'
      end
      
      it 'should be strictly between 0 and noOfLeafs' do
        result = validateAdditionalLeafParams(project_id, group_id, 1, 11, true, 0)
        expect(result[:oddMemberLeftOut]).to include 'should range from 1 to the number of leaves'
        result = validateAdditionalLeafParams(project_id, group_id, 1, 11, true, 1)
        expect(result[:oddMemberLeftOut]).to be_empty
        result = validateAdditionalLeafParams(project_id, group_id, 1, 11, true, 11)
        expect(result[:oddMemberLeftOut]).to be_empty
        result = validateAdditionalLeafParams(project_id, group_id, 1, 11, true, 12)
        expect(result[:oddMemberLeftOut]).to include 'should range from 1 to the number of leaves'
      end
      
      it 'should be empty if noOfLeafs is even' do
        result = validateAdditionalLeafParams(project_id, group_id, 1, 12, true, 2)
        expect(result[:oddMemberLeftOut]).to include 'should be present only if the number of leaves is odd'
      end
    end
  end
end

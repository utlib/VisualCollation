require 'rails_helper'

RSpec.describe ValidationHelper::GroupValidationHelper, type: :helper do
  describe "validateAdditionalGroupParams" do
    it 'should accept correct parameters' do
      result = validateAdditionalGroupParams(1, nil, 1, 4, true, nil)
      expect(result).to be_empty
    end
    
    describe "noOfGroups" do
      it 'should be required' do
        result = validateAdditionalGroupParams(nil, nil, 1, 4, true, nil)
        expect(result[:noOfGroups]).to include 'is required'
      end
      
      it 'should be an integer' do
        result = validateAdditionalGroupParams('waahoo', nil, 1, 4, true, nil)
        expect(result[:noOfGroups]).to include 'should be an Integer'
      end
      
      it 'should range from 1 to 999' do
        result = validateAdditionalGroupParams(0, nil, 1, 4, true, nil)
        expect(result[:noOfGroups]).to include 'should range from 1 to 999'
        result = validateAdditionalGroupParams(1, nil, 1, 4, true, nil)
        expect(result).to be_empty
        result = validateAdditionalGroupParams(999, nil, 1, 4, true, nil)
        expect(result).to be_empty
        result = validateAdditionalGroupParams(1000, nil, 1, 4, true, nil)
        expect(result[:noOfGroups]).to include 'should range from 1 to 999'
      end
    end
    
    describe "parentGroupID" do
      before do
        @project = FactoryGirl.create(:project)
        @parent = FactoryGirl.create(:group, project: @project)
        @project.add_groupIDs([@parent.id.to_s], 0)
      end
      
      it 'should be OK with an existent parent' do
        result = validateAdditionalGroupParams(1, @parent.id.to_s, 1, 4, true, nil)
        expect(result).to be_empty
      end
      
      it 'should reject a non-existent parent' do
        result = validateAdditionalGroupParams(1, @parent.id.to_s+'missing', 1, 4, true, nil)
        expect(result[:parentGroupID]).to include "group not found with id #{@parent.id.to_s}missing"
      end
    end
    
    describe "memberOrder" do
      it 'should not be required if there is no parent' do
        result = validateAdditionalGroupParams(1, nil, 1, 4, true, nil)
        expect(result).to be_empty
      end
      
      describe 'with parent' do
        before do
          @project = FactoryGirl.create(:project)
          @parent = FactoryGirl.create(:group, project: @project)
          @project.add_groupIDs([@parent.id.to_s], 0)
        end
        it 'should be required' do
          result = validateAdditionalGroupParams(1, @parent.id.to_s, nil, 4, true, nil)
          expect(result[:memberOrder]).to include 'is required'
        end
        it 'should be an Integer' do
          result = validateAdditionalGroupParams(1, @parent.id.to_s, 'waahoo', 4, true, nil)
          expect(result[:memberOrder]).to include 'should be an Integer'
        end
        it 'should be greater than 0' do
          result = validateAdditionalGroupParams(1, @parent.id.to_s, 0, 4, true, nil)
          expect(result[:memberOrder]).to include 'should be greater than 0'
        end
      end
    end
    
    describe "noOfLeafs" do
      it 'should be an integer' do
        result = validateAdditionalGroupParams(1, nil, 1, 'waahoo', false, nil)
        expect(result[:noOfLeafs]).to include 'should be an Integer'
      end
      
      it 'should range from 1 to 999' do
        result = validateAdditionalGroupParams(1, nil, 1, 0, false, nil)
        expect(result[:noOfLeafs]).to include 'should range from 1 to 999'
        result = validateAdditionalGroupParams(1, nil, 1, 1, false, nil)
        expect(result).to be_empty
        result = validateAdditionalGroupParams(1, nil, 1, 999, false, nil)
        expect(result).to be_empty
        result = validateAdditionalGroupParams(1, nil, 1, 1000, false, nil)
        expect(result[:noOfLeafs]).to include 'should range from 1 to 999'
      end
    end
    
    describe "conjoin" do
      it 'should be a Boolean' do
        result = validateAdditionalGroupParams(1, nil, 1, 4, 'waahoo', nil)
        expect(result[:conjoin]).to include 'should be a Boolean'
      end
      
      it 'should be false if the number of leaves is 1' do
        result = validateAdditionalGroupParams(1, nil, 1, 1, true, nil)
        expect(result[:conjoin]).to include 'should be false if the number of leaves is 1'
      end
    end
    
    describe "oddMemberLeftOut" do
      it 'should be an integer' do
        result = validateAdditionalGroupParams(1, nil, 1, 3, true, 'waahoo')
        expect(result[:oddMemberLeftOut]).to include 'should be an Integer'
      end
      
      it 'should range from 1 to the number of leaves' do
        result = validateAdditionalGroupParams(1, nil, 1, 5, true, 0)
        expect(result[:oddMemberLeftOut]).to include 'should range from 1 to the number of leaves'
        result = validateAdditionalGroupParams(1, nil, 1, 5, true, 1)
        expect(result).to be_empty
        result = validateAdditionalGroupParams(1, nil, 1, 5, true, 5)
        expect(result).to be_empty
        result = validateAdditionalGroupParams(1, nil, 1, 5, true, 6)
        expect(result[:oddMemberLeftOut]).to include 'should range from 1 to the number of leaves'
      end
      
      it 'should be empty if the number of leaves is even' do
        result = validateAdditionalGroupParams(1, nil, 1, 4, true, 2)
        expect(result[:oddMemberLeftOut]).to include 'should be empty if the number of leaves is even'
      end
    end
  end
  
  describe "validateGroupBatchDelete" do
    before do
      @project = FactoryGirl.create(:project)
      @group1 = FactoryGirl.create(:group, project: @project)
      @group2 = FactoryGirl.create(:group, project: @project)
      @params = [@group1.id.to_s, @group2.id.to_s]
      @project.add_groupIDs(@params, 0)
    end
    
    it 'should accept correct parameters' do
      result = validateGroupBatchDelete(@params)
      expect(result).to be_empty
      result = validateGroupBatchDelete([@group2.id.to_s])
      expect(result).to be_empty
    end
    
    it 'should pick out missing groups' do
      @params << @group1.id.to_s+'missing'
      @params << @group2.id.to_s+'waahoo'
      result = validateGroupBatchDelete(@params)
      expect(result).to include "group not found with id #{@group1.id.to_s}missing"
      expect(result).to include "group not found with id #{@group2.id.to_s}waahoo"
    end
  end
  
  describe "validateGroupBatchUpdate" do
    before do
      @project = FactoryGirl.create(:project)
      @group1 = FactoryGirl.create(:quire, project: @project)
      @group2 = FactoryGirl.create(:booklet, project: @project)
      @params = [
        { id: @group1.id.to_s, attributes: { type: 'Quire' } }, 
        { id: @group2.id.to_s, attributes: { type: 'Booklet' } }
      ]
      @project.add_groupIDs([@group1.id.to_s, @group2.id.to_s], 0)
    end
    
    it 'should accept correct parameters' do
      result = validateGroupBatchUpdate(@params)
      expect(result).to be_empty
    end
    
    it 'should pick out missing groups' do
      @params << { id: @group1.id.to_s+'missing', attributes: { type: 'Quire' } }
      result = validateGroupBatchUpdate(@params)
      expect(result[0][:id]).to include "group not found with id #{@group1.id.to_s}missing"
    end
    
    it 'should pick out bum types' do
      @params[0][:attributes][:type] = 'UltraWaahoo'
      result = validateGroupBatchUpdate(@params)
      expect(result[0][:attributes][:type]).to include 'should be either Quire or Booklet'
    end
  end
end

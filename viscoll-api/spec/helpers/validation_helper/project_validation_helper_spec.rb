require 'rails_helper'

RSpec.describe ValidationHelper::ProjectValidationHelper, type: :helper do
  describe "validateProjectCreateGroupsParams" do
    before :each do
      @params = [
        { 'leaves' => 3, 'oddLeaf' => 1, 'conjoin' => false },
        { 'leaves' => 6, 'oddLeaf' => 0, 'conjoin' => true }
      ]
    end
    
    it 'should allow nil' do
      result = validateProjectCreateGroupsParams(nil)
      expect(result[:errors]).to be_empty
      expect(result[:status]).to be true
    end
    
    it 'should allow the standard params' do
      result = validateProjectCreateGroupsParams(@params)
      expect(result[:errors]).to be_empty
      expect(result[:status]).to be true
    end
    
    describe "Leaf count" do
      it 'should be integers only' do
        @params[0]['leaves'] = 'waahoo'
        result = validateProjectCreateGroupsParams(@params)
        expect(result[:errors][0][:leaves]).to include 'should be an Integer'
        expect(result[:status]).to be false
      end
      
      it 'should be positive' do
        @params[1]['leaves'] = 0
        result = validateProjectCreateGroupsParams(@params)
        expect(result[:errors][0][:leaves]).to include 'should be greater than 0'
        expect(result[:status]).to be false
      end
    end
    
    describe "Odd leaf parity" do
      it 'should be integers only' do
        @params[0]['oddLeaf'] = 'waahoo'
        result = validateProjectCreateGroupsParams(@params)
        expect(result[:errors][0][:oddLeaf]).to include 'should be an Integer'
        expect(result[:status]).to be false
      end
      
      it 'should be positive' do
        @params[0]['oddLeaf'] = 0
        result = validateProjectCreateGroupsParams(@params)
        expect(result[:errors][0][:oddLeaf]).to include 'should be greater than 0'
        expect(result[:status]).to be false
      end
      
      it 'should not be greater than leaves' do
        @params[0]['oddLeaf'] = 7
        result = validateProjectCreateGroupsParams(@params)
        expect(result[:errors][0][:oddLeaf]).to include 'cannot be greater than leaves'
        expect(result[:status]).to be false
      end
    end
    
    describe "Conjoin" do
      it 'should be Boolean' do
        @params[1]['conjoin'] = 'waahoo'
        result = validateProjectCreateGroupsParams(@params)
        expect(result[:errors][0][:conjoin]).to include 'should be a Boolean'
        expect(result[:status]).to be false
      end
    end
  end
end

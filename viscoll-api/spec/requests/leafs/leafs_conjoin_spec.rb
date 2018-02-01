require 'rails_helper'

describe "PUT /leafs/conjoin", :type => :request do
  before do
    @user = FactoryGirl.create(:user, {:password => "user"})
    put '/confirmation', params: {:confirmation_token => @user.confirmation_token}
    post '/session', params: {:session => { :email => @user.email, :password => "user" }}
    @authToken = JSON.parse(response.body)['session']['jwt']
  end

  before :each do
    leaf_count = 5
    @project = FactoryGirl.create(:project, user: @user)
    @group = FactoryGirl.create(:group, project: @project)
    @project.add_groupIDs([@group.id.to_s], 0)
    @leafs = leaf_count.times.collect { FactoryGirl.create(:leaf, project: @project, material: 'Parchment', attachment_method: 'Glued', parentID: @group.id.to_s) }
    @group.add_members(@leafs.collect { |leaf| leaf.id.to_s }, 0)
    @parameters = {
      "leafs": @leafs[0..3].collect { |leaf| leaf.id.to_s }
    }
  end

  context 'and valid authorization' do
    context 'and valid even number of leafs' do
      before do
        put '/leafs/conjoin', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @project.reload
        @group.reload
        @leafs.each { |leaf| leaf.reload }
      end

      it 'returns 204' do
        expect(response).to have_http_status(:no_content)
      end

      it 'updates the affected leafs' do
        expect(@leafs[0].conjoined_to).to eq @leafs[3].id.to_s
        expect(@leafs[1].conjoined_to).to eq @leafs[2].id.to_s
        expect(@leafs[2].conjoined_to).to eq @leafs[1].id.to_s
        expect(@leafs[3].conjoined_to).to eq @leafs[0].id.to_s
      end
    end
    
    context 'and valid odd number of leafs' do
      before do
        @parameters[:leafs] = @leafs[0..4].collect { |leaf| leaf.id.to_s }
        put '/leafs/conjoin', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @project.reload
        @group.reload
        @leafs.each { |leaf| leaf.reload }
      end

      it 'returns 204' do
        expect(response).to have_http_status(:no_content)
      end

      it 'updates the affected leafs' do
        expect(@leafs[0].conjoined_to).to eq @leafs[4].id.to_s
        expect(@leafs[1].conjoined_to).to eq @leafs[3].id.to_s
        expect(@leafs[2].conjoined_to).to be_blank
        expect(@leafs[3].conjoined_to).to eq @leafs[1].id.to_s
        expect(@leafs[4].conjoined_to).to eq @leafs[0].id.to_s
      end
    end
    
    context 'and valid odd subleaves within even conjoined quire' do
      before do
        @project = FactoryGirl.create(:codex_project, user: @user, quire_structure: [[1,8]])
        @leafs = @project.leafs
        @parameters[:leafs] = @leafs[0..4].collect { |leaf| leaf.id.to_s }
        put '/leafs/conjoin', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @project.reload
        @leafs.each { |leaf| leaf.reload }
      end
      
      it 'returns 204' do
        expect(response).to have_http_status(:no_content)
      end
      
      it 'updates the affected leafs' do
        expect(@leafs[0].conjoined_to).to eq @leafs[4].id.to_s
        expect(@leafs[1].conjoined_to).to eq @leafs[3].id.to_s
        expect(@leafs[2].conjoined_to).to be_blank
        expect(@leafs[3].conjoined_to).to eq @leafs[1].id.to_s
        expect(@leafs[4].conjoined_to).to eq @leafs[0].id.to_s
        expect(@leafs[5].conjoined_to).to be_blank
        expect(@leafs[6].conjoined_to).to be_blank
        expect(@leafs[7].conjoined_to).to be_blank
      end
      
    end
    
    context 'and too few leafs' do
      before do
        @parameters[:leafs] = [@leafs[0].id.to_s]
        put '/leafs/conjoin', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @body = JSON.parse(response.body)
        @project.reload
        @group.reload
        @leafs.each { |leaf| leaf.reload }
      end

      it 'returns 422' do
        expect(response).to have_http_status(:unprocessable_entity)
      end
      
      it 'explains the error' do
        expect(JSON.parse(response.body)['leafs']).to include 'Minimum of 2 leaves required to conjoin'
      end
    end
    
    context 'and missing leaf' do
      before do
        @parameters[:leafs][0] += 'missing'
        put '/leafs/conjoin', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @body = JSON.parse(response.body)
      end

      it 'returns 422' do
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context 'and raised exception' do
      before do
        allow_any_instance_of(Leaf).to receive(:save).and_raise('MyException')
        put '/leafs/conjoin', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
      end

      it 'returns 422' do
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
    
    context 'and an unauthorized page' do
      before do
        @user2 = FactoryGirl.create(:user)
        @project.update(user: @user2)
        put '/leafs/conjoin', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @project.reload
        @group.reload
        @leafs.each { |leaf| leaf.reload }
      end
      
      it 'returns 401' do
        expect(response).to have_http_status(:unauthorized)
      end
      
      it 'should not edit the leaf' do
        @leafs.each do |leaf|
          expect(leaf.conjoined_to).to be_blank
        end
      end
    end
  end

  context 'with corrupted authorization' do
    before do
      put '/leafs/conjoin', params: @parameters.to_json, headers: {'Authorization' => @authToken+'asdf', 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
      @body = JSON.parse(response.body)
    end

    it 'returns an bad request error' do
      expect(response).to have_http_status(:bad_request)
    end

    it 'returns an appropriate error message' do
      expect(JSON.parse(response.body)['error']).to eq('Authorization Token: Signature verification raised')
    end
  end

  context 'with empty authorization' do
    before do
      put '/leafs/conjoin', params: @parameters.to_json, headers: {'Authorization' => ""}
    end

    it 'returns an bad request error' do
      expect(response).to have_http_status(:bad_request)
    end

    it 'returns an appropriate error message' do
      expect(JSON.parse(response.body)['error']).to eq('Authorization Token: Nil JSON web token')
    end
  end

  context 'invalid authorization' do
    before do
      put '/leafs/conjoin', params: @parameters.to_json, headers: {'Authorization' => "123456789"}
    end

    it 'returns an bad request error' do
      expect(response).to have_http_status(:bad_request)
    end

    it 'returns an appropriate error message' do
      expect(JSON.parse(response.body)['error']).to eq('Authorization Token: Not enough or too many segments')
    end
  end

  context 'without authorization' do
    before do
      delete "/leafs/#{@leafs[1].id.to_s}"
    end

    it 'returns an unauthorized action error' do
      expect(response).to have_http_status(:unauthorized)
    end
  end
end

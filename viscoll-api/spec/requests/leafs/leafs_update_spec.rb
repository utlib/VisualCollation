require 'rails_helper'

describe "PUT /leafs/:id", :type => :request do
  before do
    @user = FactoryGirl.create(:user, {:password => "user"})
    put '/confirmation', params: {:confirmation_token => @user.confirmation_token}
    post '/session', params: {:session => { :email => @user.email, :password => "user" }}
    @authToken = JSON.parse(response.body)['session']['jwt']
  end

  before :each do
    @project = FactoryGirl.create(:project, user: @user)
    @group = FactoryGirl.create(:group, project: @project)
    @project.add_groupIDs([@group.id.to_s], 0)
    @leafs = 3.times.collect { FactoryGirl.create(:leaf, project: @project, material: 'Parchment', parentID: @group.id.to_s) }
    @group.add_members(@leafs.collect { |leaf| leaf.id.to_s }, 0)
    @parameters = {
      "leaf": {
        "material": "Paper",
        "type": "Added",
        "attachment_method": "Glued",
        "conjoined_to": @leafs[2].id.to_s,
        "attached_below": "Sewn"
      }
    }
  end
  
  it 'should set up properly' do
    expect(true).to be true
  end

  context 'and valid authorization' do
    context 'and standard leaf' do
      before do
        put "/leafs/#{@leafs[0].id.to_s}", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @body = JSON.parse(response.body)
        @project.reload
        @group.reload
        @leafs.each { |leaf| leaf.reload }
      end

      it 'returns 200' do
        expect(response).to have_http_status(:ok)
      end

      it 'edit and reconjoin the leaf' do
        expect(@leafs[0].material).to eq 'Paper'
        expect(@leafs[0].conjoined_to).to eq @leafs[2].id.to_s
        expect(@leafs[0].attached_below).to eq 'Sewn'
        expect(@leafs[1].attached_above).to eq 'Sewn'
        expect(@leafs[2].conjoined_to).to eq @leafs[0].id.to_s
      end
    end
    
    context 'and missing page' do
      before do
        put "/leafs/#{@leafs[0].id.to_s}waahoo", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @body = JSON.parse(response.body)
      end

      it 'returns 404' do
        expect(response).to have_http_status(:not_found)
      end
    end

    context 'and failing params for the leaf' do
      before do
        allow_any_instance_of(Leaf).to receive(:update).and_return(false)
        put "/leafs/#{@leafs[0].id.to_s}", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
      end

      it 'returns 422' do
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
    
    context 'and an unauthorized page' do
      before do
        @user2 = FactoryGirl.create(:user)
        @project.update(user: @user2)
        put "/leafs/#{@leafs[0].id.to_s}", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @project.reload
        @group.reload
        @leafs.each { |leaf| leaf.reload }
      end
      
      it 'returns 401' do
        expect(response).to have_http_status(:unauthorized)
      end
      
      it 'should not edit the leaf' do
        expect(@leafs[0].material).not_to eq 'Paper'
        expect(@leafs[0].conjoined_to).not_to eq @leafs[2].id.to_s
        expect(@leafs[2].conjoined_to).not_to eq @leafs[0].id.to_s
      end
    end
  end

  context 'with corrupted authorization' do
    before do
      put "/leafs/#{@leafs[0].id.to_s}", params: @parameters.to_json, headers: {'Authorization' => @authToken+'asdf', 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
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
      put "/leafs/#{@leafs[0].id.to_s}", params: @parameters.to_json, headers: {'Authorization' => ""}
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
      put "/leafs/#{@leafs[0].id.to_s}", params: @parameters.to_json, headers: {'Authorization' => "123456789"}
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
      put "/leafs/#{@leafs[0].id.to_s}"
    end

    it 'returns an unauthorized action error' do
      expect(response).to have_http_status(:unauthorized)
    end
  end
end

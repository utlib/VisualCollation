require 'rails_helper'

describe "DELETE /leafs/:id", :type => :request do
  before do
    @user = FactoryGirl.create(:user, {:password => "user"})
    put '/confirmation', params: {:confirmation_token => @user.confirmation_token}
    post '/session', params: {:session => { :email => @user.email, :password => "user" }}
    @authToken = JSON.parse(response.body)['session']['jwt']
  end

  before :each do
    leaf_count = 4
    @project = FactoryGirl.create(:project, user: @user)
    @group = FactoryGirl.create(:group, project: @project)
    @project.add_groupIDs([@group.id.to_s], 0)
    @leafs = leaf_count.times.collect { FactoryGirl.create(:leaf, project: @project, material: 'Parchment', parentID: @group.id.to_s) }
    leaf_count.times.each do |i|
      params = {
        conjoined_to: @leafs[-i-1].id.to_s
      }
      unless i == 0
        params[:attached_above] = @leafs[i-1].id.to_s
      end
      unless i == leaf_count-1
        params[:attached_below] = @leafs[i+1].id.to_s
      end
      @leafs[i].update(params)
    end
    @group.add_members(@leafs.collect { |leaf| leaf.id.to_s }, 0)
  end
  
  it 'should set up properly' do
    expect(true).to be true
    expect(@leafs[0].conjoined_to).to eq @leafs[3].id.to_s
    expect(@leafs[1].conjoined_to).to eq @leafs[2].id.to_s
    expect(@leafs[2].conjoined_to).to eq @leafs[1].id.to_s
    expect(@leafs[3].conjoined_to).to eq @leafs[0].id.to_s
    expect(@leafs[1].attached_above).to eq @leafs[0].id.to_s
    expect(@leafs[2].attached_above).to eq @leafs[1].id.to_s
    expect(@leafs[3].attached_above).to eq @leafs[2].id.to_s
    expect(@leafs[0].attached_below).to eq @leafs[1].id.to_s
    expect(@leafs[1].attached_below).to eq @leafs[2].id.to_s
    expect(@leafs[2].attached_below).to eq @leafs[3].id.to_s
  end

  context 'and valid authorization' do
    context 'and standard leaf' do
      before do
        delete "/leafs/#{@leafs[1].id.to_s}", headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @project.reload
        @group.reload
        @leafs.each { |leaf| leaf.reload unless leaf.id == @leafs[1].id }
      end

      it 'returns 204' do
        expect(response).to have_http_status(:no_content)
      end

      it 'remove the leaf' do
        expect(Leaf.where(id: @leafs[1].id).exists?).to be false
      end
      
      it 'frees the conjoined leaf' do
        expect(@leafs[2].conjoined_to).to be_blank
      end
      
      it 'frees attached leafs' do
        expect(@leafs[0].attached_below).to eq 'None'
        expect(@leafs[2].attached_above).to eq 'None'
      end
    end
    
    context 'and missing page' do
      before do
        delete "/leafs/#{@leafs[1].id.to_s}waahoo", headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @body = JSON.parse(response.body)
      end

      it 'returns 404' do
        expect(response).to have_http_status(:not_found)
      end
    end

    context 'and raised exception' do
      before do
        allow_any_instance_of(Leaf).to receive(:destroy).and_raise('MyException')
        delete "/leafs/#{@leafs[1].id.to_s}", headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
      end

      it 'returns 422' do
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
    
    context 'and an unauthorized page' do
      before do
        @user2 = FactoryGirl.create(:user)
        @project.update(user: @user2)
        delete "/leafs/#{@leafs[1].id.to_s}", headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @project.reload
        @group.reload
      end
      
      it 'returns 401' do
        expect(response).to have_http_status(:unauthorized)
      end
      
      it 'should not remove any' do
        expect(@project.leafs.count).to eq 4
      end
    end
  end

  context 'with corrupted authorization' do
    before do
      delete "/leafs/#{@leafs[1].id.to_s}", headers: {'Authorization' => @authToken+'asdf', 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
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
      delete "/leafs/#{@leafs[1].id.to_s}", headers: {'Authorization' => ""}
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
      delete "/leafs/#{@leafs[1].id.to_s}", headers: {'Authorization' => "123456789"}
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

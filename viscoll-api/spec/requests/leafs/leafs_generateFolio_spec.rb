require 'rails_helper'

describe "PUT /leafs/generateFolio", :type => :request do
  before do
    @user = FactoryGirl.create(:user, {:password => "user"})
    put '/confirmation', params: {:confirmation_token => @user.confirmation_token}
    post '/session', params: {:session => { :email => @user.email, :password => "user" }}
    @authToken = JSON.parse(response.body)['session']['jwt']
  end

  before :each do
    @project = FactoryGirl.create(:project, {user: @user})
    @defaultGroup = FactoryGirl.create(:quire, project: @project)
    @project.add_groupIDs([@defaultGroup.id.to_s], 0)
    @leaf1 = FactoryGirl.create(:leaf, {project: @project})
    @leaf2 = FactoryGirl.create(:leaf, {project: @project})
    @defaultGroup.add_members([@leaf1.id.to_s, @leaf2.id.to_s], 1)   
    @parameters = {
      startNumber: 9,
      leafIDs: [@leaf1.id, @leaf2.id],
    }
  end

  context 'generate folio number' do
    before do
      put '/leafs/generateFolio', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
    end

    it 'returns 204' do
      expect(response).to have_http_status(:no_content)
    end

    it 'Updates the leaf folio numbers' do
      leaf1 = @project.leafs.find(@leaf1.id)
      leaf2 = @project.leafs.find(@leaf2.id)
      expect(leaf1.folio_number).to eq "9"
      expect(leaf2.folio_number).to eq "10"
    end
  end
end
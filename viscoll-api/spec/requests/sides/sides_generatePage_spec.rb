require 'rails_helper'

describe "PUT /sides/generatePageNumber", :type => :request do
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
      rectoIDs: [@leaf1.rectoID, @leaf2.rectoID],
      versoIDs: [@leaf1.versoID, @leaf2.versoID],
      startNumber: 3,
    }
  end

  context 'generate page number' do
    before do
      put '/sides/generatePageNumber', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
    end

    it 'returns 204' do
      expect(response).to have_http_status(:no_content)
    end

    it 'Updates the side page numbers' do
      side1R = @project.sides.find(@leaf1.rectoID)
      side1V = @project.sides.find(@leaf1.versoID)
      side2R = @project.sides.find(@leaf2.rectoID)
      side2V = @project.sides.find(@leaf2.versoID)
      expect(side1R.page_number).to eq "3"
      expect(side1V.page_number).to eq "4"
      expect(side2R.page_number).to eq "5"
      expect(side2V.page_number).to eq "6"
    end
  end
end
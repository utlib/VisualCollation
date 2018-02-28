require 'rails_helper'

describe "PUT /sides/id", :type => :request do
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
    @defaultGroup.add_members([@leaf1.id.to_s], 1)
    @side1 = @project.sides.find(@leaf1.rectoID)
    @side2 = @project.sides.find(@leaf1.versoID)
    @parameters = {
      "sides": [
        {
          "id": @side1.id.to_str,
          "attributes": {
            "texture": "PaperSide1",
            "script_direction": "LeftSide1"
          }
        },
        {
          "id": @side2.id.to_str,
          "attributes": {
            "texture": "PaperSide2",
            "script_direction": "LeftSide2"
          }
        }
      ]
    }
  end

  context 'with valid authorization' do
    context 'and valid side ID' do
      before do
        put '/sides', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @side1.reload
        @side2.reload
      end

      it 'returns 204' do
        expect(response).to have_http_status(:no_content)
      end

      it 'Updates the sides' do
        expect(@side1.texture).to eq "PaperSide1"
        expect(@side1.script_direction).to eq "LeftSide1"
        expect(@side2.texture).to eq "PaperSide2"
        expect(@side2.script_direction).to eq "LeftSide2"
      end
    end

    context 'and invalid side ID' do
      before do
        @parameters[:sides][0][:id] = "invalidID"
        put '/sides', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
      end

      it 'returns 404' do
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context "and someone else's sides" do
      before do
        @user2 = FactoryGirl.create(:user)
        @project2 = FactoryGirl.create(:project, { user: @user2 })
        @defaultGroup2 = FactoryGirl.create(:quire, project: @project)
        @leaf2 = FactoryGirl.create(:leaf, {project: @project2})
        @defaultGroup.add_members([@leaf2.id.to_s], 1)
        @side3 = @project2.sides.find(@leaf2.rectoID)
        @side4 = @project2.sides.find(@leaf2.versoID)
        @parameters = {
          "sides": [
            {
              "id": @side3.id,
              "attributes": {
                "texture": "PaperSide1",
                "script_direction": "LeftSide1"
              }
            },
            {
              "id": @side4.id,
              "attributes": {
                "texture": "PaperSide2",
                "script_direction": "LeftSide2"
              }
            }
          ]
        }
        put '/sides', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @side1.reload
      end

      it 'returns 401' do
        expect(response).to have_http_status(:unauthorized)
      end

      it 'leaves the side alone' do
        expect(@side3.texture).to eq "None"
      end
    end
  end

  context 'with corrupted authorization' do
    before do
      put '/sides', params: @parameters.to_json, headers: {'Authorization' => @authToken+'asdf', 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
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
      put '/sides', params: @parameters.to_json, headers: {'Authorization' => ""}
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
      put '/sides', params: @parameters.to_json, headers: {'Authorization' => "123456789"}
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
      put '/sides'
    end

    it 'returns an unauthorized action error' do
      expect(response).to have_http_status(:unauthorized)
    end
  end
end

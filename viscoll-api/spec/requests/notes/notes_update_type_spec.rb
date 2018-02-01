require 'rails_helper'

describe "PUT /notes/type", :type => :request do
  before do
    @user = FactoryGirl.create(:user, {:password => "user"})
    put '/confirmation', params: {:confirmation_token => @user.confirmation_token}
    post '/session', params: {:session => { :email => @user.email, :password => "user" }}
    @authToken = JSON.parse(response.body)['session']['jwt']
  end

  before :each do
    @project = FactoryGirl.create(:project, {
      user: @user,
      noteTypes: ["Ink", "Paper"]
    })
    @project.notes << FactoryGirl.create(:note, {
      project_id: @project.id,
      type: "Ink",
      description: "Sepia"
    })
    @project.notes << FactoryGirl.create(:note, {
      project_id: @project.id,
      type: "Paper",
      description: "Parchment"
    })
    @project.save
    @parameters = {
      "noteType": {
        "project_id": @project.id.to_str,
        "type": "New Paper",
        "old_type": "Paper"
      }
    }
  end

  context 'with valid authorization' do
    context 'with valid parameters' do
      before do
        put '/notes/type', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @project.reload
      end

      it 'should return 200' do
        expect(response).to have_http_status(:no_content)
      end

      it 'should remove the type from the project' do
        expect(@project.noteTypes).to include "Ink"
        expect(@project.noteTypes).to include "New Paper"
        expect(@project.noteTypes).not_to include "Paper"
      end

      it 'should rename notes with that type' do
        expect(@project.notes).to include an_object_having_attributes(type: "Ink")
        expect(@project.notes).to include an_object_having_attributes(type: "New Paper")
        expect(@project.notes).not_to include an_object_having_attributes(type: "Paper")
      end
    end

    context 'with missing project' do
      before do
        @parameters[:noteType][:project_id] += 'missing'
        put '/notes/type', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @project.reload
        @body = JSON.parse(response.body)
      end

      it 'should return 422' do
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'should return the right error message' do
        expect(@body['project_id']).to eq "project not found with id #{@project.id}missing"
      end
    end

    context 'with out-of-context type' do
      before do
        @parameters[:noteType][:old_type] = "Waahoo"
        put '/notes/type', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @project.reload
        @body = JSON.parse(response.body)
      end

      it 'should return 422' do
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'should return the right error message' do
        expect(@body['old_type']).to eq "Waahoo type doesn't exist in the project"
      end

      it 'should leave the project alone' do
        expect(@project.noteTypes).to eq ["Ink", "Paper"]
      end
    end

    context 'with duplicated target type' do
      before do
        @parameters[:noteType][:type] = "Ink"
        put '/notes/type', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @project.reload
        @body = JSON.parse(response.body)
      end

      it 'should return 422' do
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'should return the right error message' do
        expect(@body['type']).to eq "Ink already exists in the project"
      end

      it 'should leave the project alone' do
        expect(@project.noteTypes).to eq ["Ink", "Paper"]
      end
    end
    
    context 'with unauthorized project' do
      before do
        @user2 = FactoryGirl.create(:user)
        @project.user = @user2
        @project.save
        put '/notes/type', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @project.reload
      end
      
      it 'should return 403' do
        expect(response).to have_http_status(:unauthorized)
      end
      
      it 'should leave the types alone' do
        expect(@project.noteTypes).to eq ["Ink", "Paper"]
      end
    end
  end

  context 'with corrupted authorization' do
    before do
      put '/notes/type', params: @parameters.to_json, headers: {'Authorization' => @authToken+'asdf', 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
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
      put '/notes/type', params: @parameters.to_json, headers: {'Authorization' => ""}
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
      put '/notes/type', params: @parameters.to_json, headers: {'Authorization' => "123456789"}
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
      put '/notes/type'
    end

    it 'returns an unauthorized action error' do
      expect(response).to have_http_status(:unauthorized)
    end
  end
end

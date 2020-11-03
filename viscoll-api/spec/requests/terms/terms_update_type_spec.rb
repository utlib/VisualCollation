require 'rails_helper'

describe "PUT /terms/taxonomy", :type => :request do
  before do
    @user = FactoryGirl.create(:user, {:password => "user"})
    put '/confirmation', params: {:confirmation_token => @user.confirmation_token}
    post '/session', params: {:session => { :email => @user.email, :password => "user" }}
    @authToken = JSON.parse(response.body)['session']['jwt']
  end

  before :each do
    @project = FactoryGirl.create(:project, {
        user: @user,
        taxonomies: ["Ink", "Paper"]
    })
    @project.terms << FactoryGirl.create(:term, {
      project_id: @project.id,
      taxonomy: "Ink",
      description: "Sepia"
    })
    @project.terms << FactoryGirl.create(:term, {
      project_id: @project.id,
      taxonomy: "Paper",
      description: "Parchment"
    })
    @project.save
    @parameters = {
      "taxonomy": {
        "project_id": @project.id.to_str,
        "taxonomy": "New Paper",
        "old_taxonomy": "Paper"
      }
    }
  end

  context 'with valid authorization' do
    context 'with valid parameters' do
      before do
        put '/terms/taxonomy', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @project.reload
      end

      it 'should return 200' do
        expect(response).to have_http_status(:no_content)
      end

      it 'should remove the taxonomy from the project' do
        expect(@project.taxonomies).to include "Ink"
        expect(@project.taxonomies).to include "New Paper"
        expect(@project.taxonomies).not_to include "Paper"
      end

      it 'should rename terms with that taxonomy' do
        expect(@project.terms).to include an_object_having_attributes(taxonomy: "Ink")
        expect(@project.terms).to include an_object_having_attributes(taxonomy: "New Paper")
        expect(@project.terms).not_to include an_object_having_attributes(taxonomy: "Paper")
      end
    end

    context 'with missing project' do
      before do
        @parameters[:taxonomy][:project_id] += 'missing'
        put '/terms/taxonomy', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
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

    context 'with out-of-context taxonomy' do
      before do
        @parameters[:taxonomy][:old_taxonomy] = "Waahoo"
        put '/terms/taxonomy', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @project.reload
        @body = JSON.parse(response.body)
      end

      it 'should return 422' do
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'should return the right error message' do
        expect(@body['old_taxonomy']).to eq "Waahoo taxonomy doesn't exist in the project"
      end

      it 'should leave the project alone' do
        expect(@project.taxonomies).to eq ["Ink", "Paper"]
      end
    end

    context 'with duplicated target taxonomy' do
      before do
        @parameters[:taxonomy][:taxonomy] = "Ink"
        put '/terms/taxonomy', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @project.reload
        @body = JSON.parse(response.body)
      end

      it 'should return 422' do
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'should return the right error message' do
        expect(@body['taxonomy']).to eq "Ink already exists in the project"
      end

      it 'should leave the project alone' do
        expect(@project.taxonomies).to eq ["Ink", "Paper"]
      end
    end

    context 'with unauthorized project' do
      before do
        @user2 = FactoryGirl.create(:user)
        @project.user = @user2
        @project.save
        put '/terms/taxonomy', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @project.reload
      end

      it 'should return 403' do
        expect(response).to have_http_status(:unauthorized)
      end

      it 'should leave the taxonomys alone' do
        expect(@project.taxonomies).to eq ["Ink", "Paper"]
      end
    end
  end

  context 'with corrupted authorization' do
    before do
      put '/terms/taxonomy', params: @parameters.to_json, headers: {'Authorization' => @authToken+'asdf', 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
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
      put '/terms/taxonomy', params: @parameters.to_json, headers: {'Authorization' => ""}
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
      put '/terms/taxonomy', params: @parameters.to_json, headers: {'Authorization' => "123456789"}
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
      put '/terms/taxonomy'
    end

    it 'returns an unauthorized action error' do
      expect(response).to have_http_status(:unauthorized)
    end
  end
end

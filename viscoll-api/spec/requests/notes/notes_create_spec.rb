require 'rails_helper'

describe "POST /notes", :type => :request do
  before do
    @user = FactoryGirl.create(:user, {:password => "user"})
    put '/confirmation', params: {:confirmation_token => @user.confirmation_token}
    post '/session', params: {:session => { :email => @user.email, :password => "user" }}
    @authToken = JSON.parse(response.body)['session']['jwt']
  end

  before :each do
    @project = FactoryGirl.create(:project, {user: @user, noteTypes: ["Ink"]})
    @parameters = {
        term: {
        "project_id": @project.id.to_str,
        "title": "some title for note",
        "type": "Ink",
        "description": "blue ink"
      }
    }
  end

  context 'and valid authorization' do
    context 'and standard notes' do
      before do
        post '/notes', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
      end

      it 'returns 204' do
        expect(response).to have_http_status(:no_content)
      end

      it 'adds a note to the project' do
        expect(@project.notes.length).to eq 1
        expect(@project.notes[0].title).to eq "some title for note"
      end
    end

    context 'and out-of-context notes' do
      before do
        @parameters[:term][:type] = "WAAHOO"
        post '/notes', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @body = JSON.parse(response.body)
      end

      it 'returns 422' do
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'says what types are allowed' do
        expect(@body['type']).to include('should be one of ["Ink"]')
      end
    end

    context 'and missing project' do
      before do
        @parameters[:term][:project_id] += "WAAHOO"
        post '/notes', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @body = JSON.parse(response.body)
      end

      it 'returns 422' do
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'gives the right error message' do
        expect(@body['project_id']).to eq "project not found with id #{@parameters[:term][:project_id]}"
      end
    end

    context 'and failing params for the note' do
      before do
        allow_any_instance_of(Term).to receive(:save).and_return(false)
        post '/notes', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
      end

      it 'returns 422' do
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context 'and an unauthorized project' do
      before do
        @user2 = FactoryGirl.create(:user)
        @project2 = FactoryGirl.create(:project, { user: @user2, noteTypes: ["Ink"] })
        @parameters[:term][:project_id] = @project2.id.to_str
        post '/notes', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
      end

      it 'returns 401' do
        expect(response).to have_http_status(:unauthorized)
      end

      it 'should not add notes to the project' do
        expect(@project2.notes).not_to include an_object_having_attributes({ title: "some title for note" })
      end
    end
  end

  context 'with corrupted authorization' do
    before do
      post '/notes', params: @parameters.to_json, headers: {'Authorization' => @authToken+'asdf', 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
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
      post '/notes', params: @parameters.to_json, headers: {'Authorization' => ""}
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
      post '/notes', params: @parameters.to_json, headers: {'Authorization' => "123456789"}
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
      post '/notes'
    end

    it 'returns an unauthorized action error' do
      expect(response).to have_http_status(:unauthorized)
    end
  end
end

require 'rails_helper'

describe "PUT /notes/id", :type => :request do
  before do
    @user = FactoryGirl.create(:user, {:password => "user"})
    put '/confirmation', params: {:confirmation_token => @user.confirmation_token}
    post '/session', params: {:session => { :email => @user.email, :password => "user" }}
    @authToken = JSON.parse(response.body)['session']['jwt']
  end

  before :each do
    @project = FactoryGirl.create(:project, {
      user: @user,
      noteTypes: ["Ink"]
    })
    @term       = FactoryGirl.create(:term, {
      type: "Ink",
      project: @project,
      description: "vermilion"
    })
    @parameters = {
        term: {
        "project_id": @project.id.to_str,
        "title": "some title for note",
        "type": "Ink",
        "description": "sepia"
      }
    }
  end

  context 'with valid authorization' do
    context 'and valid note ID' do
      before do
        put '/notes/'+@term.id, params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @term.reload
      end

      it 'returns 204' do
        expect(response).to have_http_status(:no_content)
      end

      it 'Updates the note' do
        expect(@term.description).to eq "sepia"
      end
    end

    context 'and invalid note ID' do
      before do
        put '/notes/'+@term.id+'invalid', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
      end

      it 'returns 404' do
        expect(response).to have_http_status(:not_found)
      end
    end

    context 'and failed update' do
      before do
        allow_any_instance_of(Term).to receive(:update).and_return(false)
        put '/notes/'+@term.id, params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
      end

      it 'returns 422' do
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context 'and out-of-context note type' do
      before do
        @parameters[:term][:type] = "waahoo"
        put '/notes/'+@term.id, params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @term.reload
        @body = JSON.parse(response.body)
      end

      it 'returns 422' do
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'shows the available options' do
        expect(@body['type']).to eq 'should be one of ["Ink"]'
      end

      it 'leaves the note alone' do
        expect(@term.description).to eq "vermilion"
        expect(@term.type).to eq "Ink"
      end
    end

    context "and someone else's notes" do
      before do
        @user2 = FactoryGirl.create(:user)
        @project2 = FactoryGirl.create(:project, {
          user: @user2,
          noteTypes: ["Ink"]
        })
        @note2 = FactoryGirl.create(:term, {
          type: "Ink",
          project: @project2,
          description: "Prussian blue"
        })
        put '/notes/'+@note2.id, params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @note2.reload
      end

      it 'returns 401' do
        expect(response).to have_http_status(:unauthorized)
      end

      it 'leaves the note alone' do
        expect(@note2.description).to eq "Prussian blue"
      end
    end
  end

  context 'with corrupted authorization' do
    before do
      put '/notes/'+@term.id, params: @parameters.to_json, headers: {'Authorization' => @authToken+'asdf', 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
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
      put '/notes/'+@term.id, params: @parameters.to_json, headers: {'Authorization' => ""}
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
      put '/notes/'+@term.id, params: @parameters.to_json, headers: {'Authorization' => "123456789"}
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
      put '/notes/'+@term.id
    end

    it 'returns an unauthorized action error' do
      expect(response).to have_http_status(:unauthorized)
    end
  end
end

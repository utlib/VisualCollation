require 'rails_helper'

describe "DELETE /notes/id", :type => :request do
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
    @note = FactoryGirl.create(:note, {
      type: "Ink",
      project: @project
    })
    @parameters = {}
  end

  context 'with valid authorization' do
    context 'and valid note ID' do
      before do
        delete '/notes/'+@note.id, params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
      end

      it 'returns 200' do
        expect(response).to have_http_status(:ok)
      end

      it 'deletes the note' do
        expect(Note.where(id: @note.id).exists?).to be false
      end
    end

    context 'and invalid note ID' do
      before do
        delete '/notes/'+@note.id+'invalid', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
      end

      it 'returns 404' do
        expect(response).to have_http_status(:not_found)
      end
    end

    context "and someone else's notes" do
      before do
        @user2 = FactoryGirl.create(:user)
        @project2 = FactoryGirl.create(:project, {
          user: @user2,
          noteTypes: ["Hand"]
        })
        @note2 = FactoryGirl.create(:note, {
          type: "Hand",
          project: @project2
        })
        delete '/notes/'+@note2.id, params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
      end

      it 'returns 401' do
        expect(response).to have_http_status(:unauthorized)
      end

      it 'leaves the note alone' do
        expect(Note.where(id: @note2.id).exists?).to be true
      end
    end
  end

  context 'with corrupted authorization' do
    before do
      delete '/notes/'+@note.id, params: @parameters.to_json, headers: {'Authorization' => @authToken+'asdf', 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
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
      delete '/notes/'+@note.id, params: @parameters.to_json, headers: {'Authorization' => ""}
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
      delete '/notes/'+@note.id, params: @parameters.to_json, headers: {'Authorization' => "123456789"}
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
      delete '/notes/'+@note.id
    end

    it 'returns an unauthorized action error' do
      expect(response).to have_http_status(:unauthorized)
    end
  end
end

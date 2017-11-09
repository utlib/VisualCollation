require 'rails_helper'

describe "GET /users/userID", :type => :request do
  before do
    @user = User.create(:name => "user", :email => "user@mail.com", :password => "user")
    put '/confirmation', params: {:confirmation_token => @user.confirmation_token}
    post '/session', params: {:session => { :email=> "user@mail.com", :password => "user" }}
    @authToken = JSON.parse(response.body)['session']['jwt']
  end

  context 'with correct authorization' do
    context 'and valid params' do
      before do
        @project1 = Project.create(:title => "first project", :user_id => @user.id)
        @project2 = Project.create(:title => "second project", :user_id => @user.id)
        @project3 = Project.create(:title => "some other user project", :user_id => "")
        get '/users/'+@user.id.to_s, params: '', headers: {'Authorization' => @authToken}
      end

      it 'returns a successful ok response' do
        expect(response).to have_http_status(:ok)
      end

      it 'returns the user object in the response' do
        expect(JSON.parse(response.body)['id']).to eq(@user.id.to_s)
        expect(JSON.parse(response.body)['email']).to eq("user@mail.com")
        expect(JSON.parse(response.body)['name']).to eq("user")
      end

      it 'returns all the projects with manuscripts of this user' do
        expect(JSON.parse(response.body)['projects'].size).to eq(2)
        expect(JSON.parse(response.body)['projects'][0]["title"]).to eq("first project")
        expect(JSON.parse(response.body)['projects'][1]["title"]).to eq("second project")
      end
    end

    context 'and invalid params' do
      before do
        get '/users/invalidID', params: '', headers: {'Authorization' => @authToken}
      end

      it 'returns 404 no content found error' do
        expect(response).to have_http_status(:not_found)
      end

      it 'returns an appropriate error message' do
        expect(JSON.parse(response.body)['error']).to eq('user not found with id invalidID')
      end
    end
  end

  context 'with corrupted authorization' do
    before do
      get '/users/'+@user.id.to_s, params: '', headers: {'Authorization' => @authToken+"invalidify"}
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
      get '/users/'+@user.id.to_s, params: '', headers: {'Authorization' => ""}
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
      get '/users/'+@user.id.to_s, params: '', headers: {'Authorization' => "123456789"}
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
      get '/users/'+@user.id.to_s
    end

    it 'returns an unauthorized action error' do
      expect(response).to have_http_status(:unauthorized)
    end
  end
end

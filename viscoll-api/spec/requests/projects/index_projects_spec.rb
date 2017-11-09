require 'rails_helper'

describe "GET /projects", :type => :request do
  before do
    @user = FactoryGirl.create(:user, {:password => "user"})
    put '/confirmation', params: {:confirmation_token => @user.confirmation_token}
    post '/session', params: {:session => { :email => @user.email, :password => "user" }}
    @authToken = JSON.parse(response.body)['session']['jwt']
  end

  context 'with correct authorization' do
    context 'and standard params' do
      before do
        @user2 = FactoryGirl.create(:user)
        @project1 = FactoryGirl.create(:project, {:user_id => @user.id})
        @project2 = FactoryGirl.create(:project, {:user_id => @user.id})
        @project3 = FactoryGirl.create(:project, {:user_id => @user2.id})
        get '/projects', params: '', headers: {'Authorization' => @authToken}
        @body = JSON.parse(response.body)
      end

      it 'returns 200' do
        expect(response).to have_http_status(:ok)
      end

      it "contains the user's own projects only" do
        expect(@body.length).to eq 2
        expect(@body[0]['id']).to eq @project2.id.to_str
        expect(@body[1]['id']).to eq @project1.id.to_str
      end
    end
  end

  context 'with corrupted authorization' do
    before do
      get '/projects', params: '', headers: {'Authorization' => @authToken+"invalid"}
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
      get '/projects', params: '', headers: {'Authorization' => ""}
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
      get '/projects', params: '', headers: {'Authorization' => "123456789"}
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
      get '/projects'
    end

    it 'returns an unauthorized action error' do
      expect(response).to have_http_status(:unauthorized)
    end
  end
end

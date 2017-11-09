require 'rails_helper'

describe "DELETE /session", :type => :request do
  context 'without token in header' do
    before do
      @user = User.create(:name => "user", :email => "user@mail.com", :password => "user")
      @user.confirmation_token = nil
      @user.confirmed_at = "2017-07-12T16:08:25.278Z"
      @user.save
      delete '/session'
    end
    
    it 'returns an unauthorized action error' do
      expect(response).to have_http_status(:unauthorized)
    end
  end

  context 'with token in header' do 
    before do
      @user = User.create(:name => "user", :email => "user@mail.com", :password => "user")
      @user.confirmation_token = nil
      @user.confirmed_at = "2017-07-12T16:08:25.278Z"
      @user.save
    end

    context 'and token is invalid' do
      before do
        post '/session', params: {:session => { :email=> "user@mail.com", :password => "user" }}
        authToken = JSON.parse(response.body)['session']['jwt']+"someInvalidStuff"
        delete '/session', params: '', headers: {'Authorization' => authToken}
      end

      it 'returns an unprocessable_entity status' do
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'returns an appropriate error message' do
        expect(JSON.parse(response.body)['error']).to eq('Authorization Header: Signature verification raised')
      end
    end

    context 'and token format is wrong' do
      before do
        post '/session', params: {:session => { :email=> "user@mail.com", :password => "user" }}
        delete '/session', params: '', headers: {'Authorization' => "invalidTokenFormat"}
      end

      it 'returns an unprocessable_entity status' do
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'returns an appropriate error message' do
        expect(JSON.parse(response.body)['error']).to eq('Authorization Header: Not enough or too many segments')
      end
    end

    context 'and token is valid' do
      before do
        post '/session', params: {:session => { :email=> "user@mail.com", :password => "user" }}
        authToken = JSON.parse(response.body)['session']['jwt']
        delete '/session', params: '', headers: {'Authorization' => authToken}
      end

      it 'returns 204 no content response' do
        expect(response).to have_http_status(:no_content)
      end

      it 'clears the auth tokens of the user' do
        expect(User.find(@user.id).auth_tokens).to be_empty
      end
    end
  end
end

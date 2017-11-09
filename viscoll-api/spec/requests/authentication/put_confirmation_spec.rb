require 'rails_helper'

describe "PUT /confirmation", :type => :request do
  context 'with invalid token' do
    before do
      put '/confirmation', params: {:confirmation_token => "invalidToken"}
    end

    it 'returns an invalid token message' do
      expect(JSON.parse(response.body)['errors']['confirmation_token']).to eq(['not found'])
    end

    it 'returns an unprocessable_entity status' do
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  context 'with valid token' do
    before do
      @user = User.create(:name => "user", :email => "user@mail.com", :password => "user")
      put '/confirmation', params: {:confirmation_token => @user.confirmation_token}
    end

    it 'returns successful response code' do
      expect(response).to have_http_status(:no_content)
    end

    it 'clears the confirmation token in user record' do
      expect(User.find(@user.id).confirmation_token).to eq(nil)
    end
  end
end

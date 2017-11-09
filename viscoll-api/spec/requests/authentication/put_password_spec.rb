require 'rails_helper'

describe "PUT /password", :type => :request do
  before do
    @user = User.create(:name => "user", :email => "user@mail.com", :password => "user")
    @user.confirmation_token = nil
    @user.confirmed_at = "2017-07-12T16:08:25.278Z"
    @user.save
    post '/password', params: {:password => {:email => "user@mail.com"}}
    @user = User.find(@user.id)
  end

  context 'with valid params' do
    before do
      put '/password', params: {:reset_password_token => @user.reset_password_token, :password => {:password => "newUser", :password_confirmation => "newUser"}}
    end

    it 'returns a successful no_content response' do
      expect(response).to have_http_status(:no_content)
    end

    it 'clears the field for reset_password_token in user record' do
      expect(User.find(@user.id).reset_password_token).to eq(nil)
    end

    it 'updates the user password in the database' do
      post '/session', params: {:session => { :email=> "user@mail.com", :password => "newUser" }}
      expect(JSON.parse(response.body)['session']['jwt']).not_to be_empty
      expect(JSON.parse(response.body)['session']['email']).to eq("user@mail.com")
    end
  end

  context 'with invalid params' do
    context 'and reset token expired' do
      before do
        @user.reset_password_sent_at = "2017-07-12T16:08:30.278Z"
        @user.save
        put '/password', params: {:reset_password_token => @user.reset_password_token, :password => {:password => "newUser", :password_confirmation => "newUser"}}
      end

      it 'returns an unprocessable_entity status' do
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'returns an appropriate error message' do
        expect(JSON.parse(response.body)['errors']['reset_password_token']).to eq(['has expired, please request a new one'])
      end

      it 'does not not clear field for reset_password_token in user record' do
        expect(User.find(@user.id).reset_password_token).not_to eq(nil)
      end
    end

    context 'and invalid reset token' do 
      before do
        put '/password', params: {:reset_password_token => "invalidToken", :password => {:password => "newUser", :password_confirmation => "newUser"}}
      end

      it 'returns an unprocessable_entity status' do
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'returns an appropriate error message' do
        expect(JSON.parse(response.body)['errors']['reset_password_token']).to eq(['not found'])
      end

      it 'does not not clear field for reset_password_token in user record' do
        expect(User.find(@user.id).reset_password_token).not_to eq(nil)
      end
    end

    context 'and blank password' do
      before do
        put '/password', params: {:reset_password_token => @user.reset_password_token, :password => {:password => "", :password_confirmation => "newUser"}}
      end

      it 'returns an unprocessable_entity status' do
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'returns an appropriate error message' do
        expect(JSON.parse(response.body)['errors']['password']).to eq(['blank'])
      end
    end

    context 'and no matching passwords' do
      before do
        put '/password', params: {:reset_password_token => @user.reset_password_token, :password => {:password => "newUser", :password_confirmation => "newUserGhost"}}
      end

      it 'returns an unprocessable_entity status' do
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'returns an appropriate error message' do
        expect(JSON.parse(response.body)['errors']['password_confirmation']).to eq(['doesn\'t match Password'])
      end
    end
  end
end

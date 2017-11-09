require 'rails_helper'

describe "POST /password", :type => :request do
  context 'with valid params' do
    before do
      @user = User.create(:name => "user", :email => "user@mail.com", :password => "user")
      @user.confirmation_token = nil
      @user.confirmed_at = "2017-07-12T16:08:25.278Z"
      @user.save
      post '/password', params: {:password => {:email => "user@mail.com"}}
    end

    it 'returns a successful no_content response' do
      expect(response).to have_http_status(:no_content)
    end

    it 'creates fields for reset_password in user record' do
      expect(User.find(@user.id).reset_password_token).not_to eq(nil)
      expect(User.find(@user.id).reset_password_sent_at).not_to eq(nil)
    end
  end

  context 'with invalid params' do
    context 'and unconfirmed user' do 
      before do
        @user = User.create(:name => "user", :email => "user@mail.com", :password => "user")
        post '/password', params: {:password => {:email => "user@mail.com"}}
      end

      it 'returns an unprocessable_entity status' do
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'returns an appropriate error message' do
        expect(JSON.parse(response.body)['errors']['email']).to eq(['unconfirmed email'])
      end

      it 'doest not create fields for reset_password in user record' do
        expect(User.find(@user.id).reset_password_token).to eq(nil)
        expect(User.find(@user.id).reset_password_sent_at).to eq(nil)
      end
    end

    context 'and no valid user' do
      before do
        post '/password', params: {:password => {:email => "user@mail.com"}}
      end

      it 'returns an unprocessable_entity status' do
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'returns an appropriate error message' do
        expect(JSON.parse(response.body)['errors']['email']).to eq(['not found'])
      end
    end
  end
end

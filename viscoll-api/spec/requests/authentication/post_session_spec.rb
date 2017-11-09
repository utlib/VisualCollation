require 'rails_helper'

describe "POST /session", :type => :request do
  context 'when the user does not exist' do
    before do
      post '/session', params: {:session => { :email=> "ghost@mail.com", :password => "ghost" }}
    end

    it 'returns an invalid email / password error message' do
      expect(JSON.parse(response.body)['errors']['session'][0]).to eq('invalid email / password')
    end

    it 'returns an unprocessable_entity status' do
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  context 'when the user exist' do 
    before do
      @user = User.create(:name => "user", :email => "user@mail.com", :password => "user")
      post '/session', params: {:session => { :email=> "user@mail.com", :password => "user" }}
    end

    context 'and user email is not confirmed' do
      it 'returns unconfirmed email error' do
        expect(JSON.parse(response.body)['errors']['session'][0]).to eq('unconfirmed email')
      end

      it 'returns an unprocessable_entity status' do
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context 'and user email is confirmed' do
      before do
        @user.confirmation_token = nil
        @user.confirmed_at = "2017-07-12T16:08:25.278Z"
        @user.save
        @project1 = Project.create(:title => "first project", :user_id => @user.id)
        @project2 = Project.create(:title => "second project", :user_id => @user.id)
        @project3 = Project.create(:title => "some other user project", :user_id => "")
      end

      context 'and request with invalid params' do
        before do
          post '/session', params: {:session => { :email=> "user@mail.com", :password => "wrong" }}
        end

        it 'returns an invalid email / password error message' do
          expect(JSON.parse(response.body)['errors']['session'][0]).to eq('invalid email / password')
        end

        it 'returns an unprocessable_entity status' do
          expect(response).to have_http_status(:unprocessable_entity)
        end
      end

      context 'and request with valid params' do
        before do
          post '/session', params: {:session => { :email=> "user@mail.com", :password => "user" }}
        end

        it 'returns the user session token' do
          expect(JSON.parse(response.body)['session']['jwt']).not_to be_empty
          expect(JSON.parse(response.body)['session']['email']).to eq("user@mail.com")
        end

        it 'creates the auth_tokens for the user' do
          expect(User.find(@user.id).auth_tokens).not_to be_empty
        end

        it 'returns all the projects of this user' do
          expect(JSON.parse(response.body)['session']['projects'].size).to eq(2)
          expect(JSON.parse(response.body)['session']['projects'][0]["title"]).to eq("first project")
          expect(JSON.parse(response.body)['session']['projects'][1]["title"]).to eq("second project")
        end

        it 'returns an ok status' do
          expect(response).to have_http_status(:ok)
        end
      end
    end
  end
end

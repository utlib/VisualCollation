require 'rails_helper'

describe "PUT /users/userID", :type => :request do
  before do
    @user = User.create(:name => "user", :email => "user@mail.com", :password => "user")
    put '/confirmation', params: {:confirmation_token => @user.confirmation_token}
    post '/session', params: {:session => { :email=> "user@mail.com", :password => "user" }}
    @authToken = JSON.parse(response.body)['session']['jwt']
  end

  context 'with correct authorization' do
    context 'and valid params' do
      context 'update email address' do
        before do
          put '/users/'+@user.id.to_s, params: {:user => {:email => "newUser@mail.com"}}, headers: {'Authorization' => @authToken}
        end

        it 'returns a successful ok response' do
          expect(response).to have_http_status(:ok)
        end

        it 'returns the same user object in the response with old email address' do
          expect(JSON.parse(response.body)['email']).to eq("user@mail.com")
        end

        it 'creates fields for email confirmation in user record' do
          expect(User.find(@user.id).confirmation_token).not_to eq(nil)
          expect(User.find(@user.id).unconfirmed_email).to eq("newUser@mail.com")
        end
      end

      context 'update name' do
        before do
          put '/users/'+@user.id.to_s, params: {:user => {:name => "newUser"}}, headers: {'Authorization' => @authToken}
        end

        it 'returns a successful ok response' do
          expect(response).to have_http_status(:ok)
        end

        it 'returns the updated object in the response with new name' do
          expect(JSON.parse(response.body)['name']).to eq("newUser")
        end

        it 'updates the field for name in user record' do
          expect(User.find(@user.id).name).to eq("newUser")
        end
      end

      context 'update email and name' do
        before do
          put '/users/'+@user.id.to_s, params: {:user => {:email => "newUser@mail.com", :name => "newUser"}}, headers: {'Authorization' => @authToken}
        end

        it 'returns a successful ok response' do
          expect(response).to have_http_status(:ok)
        end

        it 'returns the updated object in the response with new name and old email' do
          expect(JSON.parse(response.body)['name']).to eq("newUser")
          expect(JSON.parse(response.body)['email']).to eq("user@mail.com")
        end

        it 'updates the field for name and email confirmation in user record' do
          expect(User.find(@user.id).name).to eq("newUser")
          expect(User.find(@user.id).confirmation_token).not_to eq(nil)
          expect(User.find(@user.id).unconfirmed_email).to eq("newUser@mail.com")
        end
      end

      context 'update password' do
        before do
          put '/users/'+@user.id.to_s, params: {:user => {:current_password => "user", :password => "newUser"}}, headers: {'Authorization' => @authToken}
        end

        it 'returns a successful ok response' do
          expect(response).to have_http_status(:ok)
        end

        it 'returns the updated object in the response' do
          expect(JSON.parse(response.body)['name']).to eq("user")
        end

        it 'updates the field for password in user record' do
          post '/session', params: {:session => { :email=> "user@mail.com", :password => "newUser" }}
          expect(JSON.parse(response.body)['session']['jwt']).not_to be_empty
        end
      end

      context 'update email, name and password' do
        before do
          put '/users/'+@user.id.to_s, params: {:user => {:email => "newUser@mail.com", :name => "newUser", :current_password => "user", :password => "newUser"}}, headers: {'Authorization' => @authToken}
        end

        it 'returns a successful ok response' do
          expect(response).to have_http_status(:ok)
        end

        it 'returns the updated object in the response' do
          expect(JSON.parse(response.body)['email']).to eq("user@mail.com")
          expect(JSON.parse(response.body)['name']).to eq("newUser")
        end

        it 'updates the field for password in user record' do
          post '/session', params: {:session => { :email=> "user@mail.com", :password => "newUser" }}
          expect(JSON.parse(response.body)['session']['jwt']).not_to be_empty
        end

        it 'creates fields for email confirmation in user record' do
          expect(User.find(@user.id).confirmation_token).not_to eq(nil)
          expect(User.find(@user.id).unconfirmed_email).to eq("newUser@mail.com")
        end

        it 'updates the field for name and email confirmation in user record' do
          expect(User.find(@user.id).name).to eq("newUser")
          expect(User.find(@user.id).confirmation_token).not_to eq(nil)
          expect(User.find(@user.id).unconfirmed_email).to eq("newUser@mail.com")
        end
      end


    end

    context 'and invalid params' do
      context 'with invalid userID' do
        before do
          put '/users/invalidID', params: '', headers: {'Authorization' => @authToken}
        end

        it 'returns 404 no content found error' do
          expect(response).to have_http_status(:not_found)
        end

        it 'returns an appropriate error message' do
          expect(JSON.parse(response.body)['error']).to eq('user not found with id invalidID')
        end
      end

      context 'with invalid current password' do
        before do
          put '/users/'+@user.id.to_s, params: {:user => {:current_password => "userInvalid", :password => "newUser"}}, headers: {'Authorization' => @authToken}
        end

        it 'returns an unprocessable_entity status' do
          expect(response).to have_http_status(:unprocessable_entity)
        end

        it 'returns an appropriate error message' do
          expect(JSON.parse(response.body)['current_password']).to eq(['invalid'])
        end
      end

      context 'with duplicate email address' do
        before do
          @user2 = User.create(:name => "newUser", :email => "newUser@mail.com", :password => "newUser")
          put '/confirmation', params: {:confirmation_token => @user2.confirmation_token}
          put '/users/'+@user.id.to_s, params: {:user => {:email => "newUser@mail.com"}}, headers: {'Authorization' => @authToken}
        end

        it 'returns an unprocessable_entity status' do
          expect(response).to have_http_status(:unprocessable_entity)
        end

        it 'returns an appropriate error message' do
          expect(JSON.parse(response.body)['email']).to eq(["is already taken"])
        end
      end

      context 'with invalid email address' do
        before do
          put '/users/'+@user.id.to_s, params: {:user => {:email => "invalidEmail"}}, headers: {'Authorization' => @authToken}
        end

        it 'returns an unprocessable_entity status' do
          expect(response).to have_http_status(:unprocessable_entity)
        end

        it 'returns an appropriate error message' do
          expect(JSON.parse(response.body)['email']).to eq(["is not an email"])
        end
      end

      context 'with missing current password' do
        before do
          put '/users/'+@user.id.to_s, params: {:user => {:password => "newUser"}}, headers: {'Authorization' => @authToken}
        end

        it 'returns an unprocessable_entity status' do
          expect(response).to have_http_status(:unprocessable_entity)
        end

        it 'returns an appropriate error message' do
          expect(JSON.parse(response.body)['current_password']).to eq(['blank'])
        end
      end

      context 'with missing new password' do
        before do
          put '/users/'+@user.id.to_s, params: {:user => {:current_password => "userInvalid", :password => ""}}, headers: {'Authorization' => @authToken}
        end

        it 'returns an unprocessable_entity status' do
          expect(response).to have_http_status(:unprocessable_entity)
        end

        it 'returns an appropriate error message' do
          expect(JSON.parse(response.body)['password']).to eq(['blank'])
        end
      end

    end
  end

  context 'with corrupted authorization' do
    before do
      put '/users/'+@user.id.to_s, params: '', headers: {'Authorization' => @authToken+"invalidify"}
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
      put '/users/'+@user.id.to_s, params: '', headers: {'Authorization' => ""}
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
      put '/users/'+@user.id.to_s, params: '', headers: {'Authorization' => "123456789"}
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
      put '/users/'+@user.id.to_s
    end

    it 'returns an unauthorized action error' do
      expect(response).to have_http_status(:unauthorized)
    end
  end
end

require 'rails_helper'

describe "DELETE /users/userID", :type => :request do
  before do
    @user = User.create(:name => "user", :email => "user@mail.com", :password => "user")
    put '/confirmation', params: {:confirmation_token => @user.confirmation_token}
    post '/session', params: {:session => { :email=> "user@mail.com", :password => "user" }}
    @authToken = JSON.parse(response.body)['session']['jwt']
  end

  context 'with correct authorization' do
    context 'and valid params' do
      before do
        @user2 = User.create(:name => "user2", :email => "user2@mail.com", :password => "user2")
        @project1 = Project.create(:title => "first project", :user_id => @user.id)
        @project2 = Project.create(:title => "second project", :user_id => @user.id)
        @project3 = Project.create(:title => "some other user project", :user_id => @user2.id)
        delete '/users/'+@user.id.to_s, params: '', headers: {'Authorization' => @authToken}
      end

      it 'returns a successful no_content response' do
        expect(response).to have_http_status(:no_content)
      end

      it 'deletes the user from the database' do
        expect(User.where(id: @user.id).count).to eq(0)
      end

      it 'deletes all user related objects only' do
        expect(Project.where(id: @project1.id).count).to eq(0)
        expect(Project.where(id: @project2.id).count).to eq(0)
        expect(Project.all.count).to eq(1)
      end
    end

    context 'and another user' do
      before do
        @user2 = User.create(:name => "user2", :email => "user2@mail.com", :password => "user2")
        @project1 = Project.create(:title => "first project", :user_id => @user.id)
        @project2 = Project.create(:title => "second project", :user_id => @user.id)
        @project3 = Project.create(:title => "some other user project", :user_id => @user2.id)
        delete '/users/'+@user2.id.to_s, params: '', headers: {'Authorization' => @authToken}
      end

      it 'returns unauthorized' do
        expect(response).to have_http_status(:unauthorized)
      end

      it 'leaves the other user alone' do
        expect(User.where(id: @user2.id).count).to eq 1
      end
    end

    context 'and invalid params' do
      before do
        delete '/users/invalidID', params: '', headers: {'Authorization' => @authToken}
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
      delete '/users/'+@user.id.to_s, params: '', headers: {'Authorization' => @authToken+"invalidify"}
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
      delete '/users/'+@user.id.to_s, params: '', headers: {'Authorization' => ""}
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
      delete '/users/'+@user.id.to_s, params: '', headers: {'Authorization' => "123456789"}
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
      delete '/users/'+@user.id.to_s
    end

    it 'returns an unauthorized action error' do
      expect(response).to have_http_status(:unauthorized)
    end
  end
end

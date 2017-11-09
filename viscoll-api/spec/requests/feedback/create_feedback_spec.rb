require 'rails_helper'

describe "POST /feedback", :type => :request do
  before do
    @user = FactoryGirl.create(:user, {:password => "user"})
    put '/confirmation', params: {:confirmation_token => @user.confirmation_token}
    post '/session', params: {:session => { :email => @user.email, :password => "user" }}
    @authToken = JSON.parse(response.body)['session']['jwt']
  end

  before :each do
    @parameters = {
      feedback: {
        title: "Something is weird",
        message: "Hey can you look into this"
      }
    }
  end

  context 'with valid authentication' do
    context 'and valid user ID' do
      it 'sends an email' do
        expect {
          post '/feedback', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        }.to change { ActionMailer::Base.deliveries.count }.by 1
      end
    end
  end

  context 'with corrupted authorization' do
    before do
      post '/feedback', params: @parameters.to_json, headers: {'Authorization' => @authToken+'asdf', 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
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
      post '/feedback', params: @parameters.to_json, headers: {'Authorization' => ""}
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
      post '/feedback', params: @parameters.to_json, headers: {'Authorization' => "123456789"}
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
      post '/feedback'
    end

    it 'returns an unauthorized action error' do
      expect(response).to have_http_status(:unauthorized)
    end
  end
end

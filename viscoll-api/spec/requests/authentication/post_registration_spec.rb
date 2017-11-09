require 'rails_helper'

describe "POST /registration", :type => :request do
  context 'with valid params' do
    before do
      post '/registration', params: {:user => { :email=> "user@mail.com", :password => "user", :name=>"user" }}
    end

    it 'returns with a successful 200 response' do
      expect(response).to have_http_status(:created)
    end

    it 'returns an user object in the response body' do
      expect(JSON.parse(response.body)['user']).not_to be_empty
      expect(JSON.parse(response.body)['user']['email']).to eq('user@mail.com')
      expect(JSON.parse(response.body)['user']['name']).to eq('user')
    end

    it 'returns an email confirmation token with the response body' do
      expect(JSON.parse(response.body)['user']['confirmation_token']).not_to be_empty
      expect(JSON.parse(response.body)['user']['confirmation_sent_at']).not_to be_empty
    end

    it 'creates an User object in the database' do
      expect(User.count).to eq(1)
    end
  end

  context 'with invalid params' do
    before do
      @user = User.create(:name => "user", :email => "user@mail.com", :password => "user")
      @user.confirmation_token = nil
      @user.confirmed_at = "2017-07-12T16:08:25.278Z"
      @user.save
    end

    context 'where email is empty' do
      before do
        post '/registration', params: {:user => { :email=> "", :password => "newUser", :name=>"newUser" }}
      end
    
      it 'returns an appropriate error message with 422 code' do
        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)['errors']['email']).to eq(['can\'t be blank', 'is not an email'])
      end

      it 'does not create another User object in the database' do
        expect(User.count).to eq(1)
      end
    end

    context 'where email is invalid' do
      before do
        post '/registration', params: {:user => { :email=> "ghost", :password => "newUser", :name=>"newUser" }}
      end
    
      it 'returns an appropriate error message with 422 code' do
        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)['errors']['email']).to eq(['is not an email'])
      end

      it 'does not create another User object in the database' do
        expect(User.count).to eq(1)
      end
    end

    context 'where email is already taken' do
      before do
        post '/registration', params: {:user => { :email=> "user@mail.com", :password => "user", :name=>"user" }}
      end
    
      it 'returns an appropriate error message with 422 code' do
        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)['errors']['email']).to eq(['is already taken'])
      end

      it 'does not create another User object in the database' do
        expect(User.count).to eq(1)
      end
    end

    context 'where password is empty' do
      before do
        post '/registration', params: {:user => { :email=> "newUser@mail.com", :password => "", :name=>"newUser" }}
      end
    
      it 'returns an appropriate error message with 422 code' do
        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)['errors']['password']).to eq(['can\'t be blank'])
      end

      it 'does not create another User object in the database' do
        expect(User.count).to eq(1)
      end
    end

    context 'where email and password are invalid' do
      before do
        post '/registration', params: {:user => { :email=> "ghost", :password => "", :name=>"newUser" }}
      end
    
      it 'returns an appropriate error message with 422 code' do
        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)['errors']['email']).to eq(['is not an email'])
        expect(JSON.parse(response.body)['errors']['password']).to eq(['can\'t be blank'])
      end

      it 'does not create another User object in the database' do
        expect(User.count).to eq(1)
      end
    end
    
    context 'where an exception is thrown' do
      before do
        allow_any_instance_of(RailsJwtAuth.model).to receive(:save).and_raise('Exception')
        post '/registration', params: {:user => { :email=> "user@mail.com", :password => "user", :name=>"user" }}
      end

      it 'returns an appropriate error message with 422 code' do
        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)['error']).to eq 'Exception'
      end
    end
  end
end

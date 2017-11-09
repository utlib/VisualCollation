require 'rails_helper'

describe "POST /projects", :type => :request do
  before do
    @user = FactoryGirl.create(:user, {:password => "user"})
    put '/confirmation', params: {:confirmation_token => @user.confirmation_token}
    post '/session', params: {:session => { :email => @user.email, :password => "user" }}
    @authToken = JSON.parse(response.body)['session']['jwt']
  end

  before :each do
    @parameters = {
      "project": {
        "title": "Project Title"
      },
      "manuscript": {
        "shelfmark": "Shelfmark",
        "uri": "http://www.waahoo.net",
        "date": "Early 15th Century"
      },
      "groups": [
        {
          "number": 1,
          "leaves": 4,
          "conjoin": true,
          "oddLeaf": 1
        },
        {
          "number": 2,
          "leaves": 4,
          "conjoin": false,
          "oddLeaf": 1
        }
      ]
    }
  end

  context 'with correct authorization' do
    context 'and standard params' do
      before do
        post '/projects', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @body = JSON.parse(response.body)
      end

      it 'returns 200' do
        expect(response).to have_http_status(:ok)
      end

      it 'returns a new project' do
        expect(Project.find(id: @body[0]['id'])).not_to be nil
      end
    end

    context 'and standard params with no groups' do
      before do
        @parameters.delete('groups')
        post '/projects', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @body = JSON.parse(response.body)
      end

      it 'returns 200' do
        expect(response).to have_http_status(:ok)
      end

      it 'returns a new project' do
        expect(Project.find(id: @body[0]['id'])).not_to be nil
      end
    end

    context 'and failing params for the project' do
      before do
        allow_any_instance_of(Project).to receive(:save).and_return(false)
        post '/projects', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
      end

      it 'returns 422' do
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end


    context 'and non-integer leaf count' do
      before do
        @parameters[:groups][0][:leaves] = "ULTRAWAAHOO"
        post '/projects', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @body = JSON.parse(response.body)
      end

      it 'returns 422' do
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'shows the right leaves error' do
        expect(@body['groups'][0]['leaves']).to include("should be an Integer")
      end
    end

    context 'and negative leaf count' do
      before do
        @parameters[:groups][0][:leaves] = -583
        post '/projects', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @body = JSON.parse(response.body)
      end

      it 'returns 422' do
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'shows the right leaves error' do
        expect(@body['groups'][0]['leaves']).to include("should be greater than 0")
      end
    end

    context 'and non-integer odd-leaf' do
      before do
        @parameters[:groups][0][:leaves] = 3;
        @parameters[:groups][0][:oddLeaf] = "ULTRAWAAHOO"
        post '/projects', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @body = JSON.parse(response.body)
      end

      it 'returns 422' do
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'shows the right odd-leaf error' do
        expect(@body['groups'][0]['oddLeaf']).to include("should be an Integer")
      end
    end

    context 'and negative odd-leaf' do
      before do
        @parameters[:groups][0][:leaves] = 3;
        @parameters[:groups][0][:oddLeaf] = -2
        post '/projects', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @body = JSON.parse(response.body)
      end

      it 'returns 422' do
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'shows the right odd-leaf error' do
        expect(@body['groups'][0]['oddLeaf']).to include("should be greater than 0")
      end
    end

    context 'and excessive odd-leaf' do
      before do
        @parameters[:groups][0][:leaves] = 3;
        @parameters[:groups][0][:oddLeaf] = 5
        post '/projects', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @body = JSON.parse(response.body)
      end

      it 'returns 422' do
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'shows the right odd-leaf error' do
        expect(@body['groups'][0]['oddLeaf']).to include("cannot be greater than leaves")
      end
    end

    context 'and non-Boolean conjoin' do
      before do
        @parameters[:groups][0][:conjoin] = "ULTRAWAAHOO"
        post '/projects', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @body = JSON.parse(response.body)
      end

      it 'returns 422' do
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'shows the right leaves error' do
        expect(@body['groups'][0]['conjoin']).to include("should be a Boolean")
      end
    end

    context 'and a failed create' do
      before do
        allow_any_instance_of(Project).to receive(:save).and_raise("Exception")
        post '/projects', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @body = JSON.parse(response.body)
      end

      it 'returns 401' do
        expect(response).to have_http_status(:bad_request)
      end

      it 'includes the exception' do
        expect(@body['errors']).to eq "Exception"
      end
    end
  end

  context 'with corrupted authorization' do
    before do
      post '/projects', params: @parameters.to_json, headers: {'Authorization' => @authToken+'asdf', 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
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
      post '/projects', params: @parameters.to_json, headers: {'Authorization' => ""}
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
      post '/projects', params: @parameters.to_json, headers: {'Authorization' => "123456789"}
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
      post '/projects'
    end

    it 'returns an unauthorized action error' do
      expect(response).to have_http_status(:unauthorized)
    end
  end
end

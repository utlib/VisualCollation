require 'rails_helper'

describe "POST /images", :type => :request do
  before do
    @user = FactoryGirl.create(:user, {:password => "user"})
    put '/confirmation', params: {:confirmation_token => @user.confirmation_token}
    post '/session', params: {:session => { :email => @user.email, :password => "user" }}
    @authToken = JSON.parse(response.body)['session']['jwt']
  end

  before :each do
    @project = FactoryGirl.create(:codex_project, user: @user, quire_structure: [[1, 2]])
    @parameters = {
      "projectID": @project.id.to_s,
      "images": [
      	{
      		"filename": "green",
      		"content": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
      	},
      	{
      		"filename": "blue",
      		"content": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
         }
  	  ]
    }
    end

  context 'and valid authorization' do
    context 'and standard group' do
      before do
        post '/images', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @body = JSON.parse(response.body)
      end

      it 'returns 200' do
        expect(response).to have_http_status(:ok)
      end

      it 'creates two new images connected to the project' do
        expect(Image.where(image_file_name: 'green')).to exist
        expect(Image.where(image_file_name: 'blue')).to exist
        expect(Image.find_by(image_file_name: 'green').projectIDs).to include @project.id.to_s
        expect(Image.find_by(image_file_name: 'blue').projectIDs).to include @project.id.to_s
      end
    end
    
    context 'and duplicated image' do
      before do
        @parameters[:images][1][:filename] = 'green'
        post '/images', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @body = JSON.parse(response.body)
      end
      
      it 'returns 200' do
        expect(response).to have_http_status(:ok)
      end
      
      it 'creates two new images, the second with the _copy(n) suffix' do
        expect(Image.where(image_file_name: 'green')).to exist
        expect(Image.where(image_file_name: 'green_copy(1)')).to exist
        expect(Image.find_by(image_file_name: 'green').projectIDs).to include @project.id.to_s
        expect(Image.find_by(image_file_name: 'green_copy(1)').projectIDs).to include @project.id.to_s
      end
    end
    
    context 'and missing project' do
      before do
        @parameters[:projectID] += 'missing'
        post '/images', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @body = JSON.parse(response.body)
      end
      
      it 'returns 404' do
        expect(response).to have_http_status(:not_found)
      end
      
      it 'returns the error message' do
        expect(@body['error']).to eq("project not found with id #{@project.id.to_str}missing")
      end
    end
    
    context 'and unauthorized project' do
      before do
        @project.update(user: FactoryGirl.create(:user))
        post '/images', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
      end
      
      it 'returns 401' do
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'and failing image' do
      before do
        allow_any_instance_of(Image).to receive(:valid?).and_return(false)
        post '/images', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
      end

      it 'returns 422' do
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context 'and uncaught exception' do
      before do
        allow(Project).to receive(:find).and_raise("Exception")
        post '/images', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @body = JSON.parse(response.body)
      end

      it 'returns 422' do
        expect(response).to have_http_status(:unprocessable_entity)
        @body = JSON.parse(response.body)
      end
      
      it 'returns the error message' do
        expect(@body['error']).to eq "Exception"
      end
    end
  end

  context 'with corrupted authorization' do
    before do
      post '/images', params: @parameters.to_json, headers: {'Authorization' => @authToken+'asdf', 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
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
      post '/images', params: @parameters.to_json, headers: {'Authorization' => ""}
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
      post '/images', params: @parameters.to_json, headers: {'Authorization' => "123456789"}
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
      post '/images'
    end

    it 'returns an unauthorized action error' do
      expect(response).to have_http_status(:unauthorized)
    end
  end
end

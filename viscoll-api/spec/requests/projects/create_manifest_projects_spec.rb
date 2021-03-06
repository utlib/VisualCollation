require 'rails_helper'

describe "POST /projects/:id/manifests", :type => :request do
  before do
    @user = FactoryGirl.create(:user, {:password => "user"})
    put '/confirmation', params: {:confirmation_token => @user.confirmation_token}
    post '/session', params: {:session => { :email => @user.email, :password => "user" }}
    @authToken = JSON.parse(response.body)['session']['jwt']
    stub_request(:get, 'https://iiif.library.utoronto.ca/presentation/v2/hollar:Hollar_a_3000/manifest').with(headers: { 'Accept' => '*/*', 'User-Agent' => 'Ruby' }).to_return(status: 200, body: File.read(File.dirname(__FILE__) + '/../../fixtures/uoft_hollar.json'), headers: {})
  end
  
  before :each do
    @parameters = {
      "manifest": {
    		"url": "https://iiif.library.utoronto.ca/presentation/v2/hollar:Hollar_a_3000/manifest"
    	}
    }
    @project = FactoryGirl.create(:project, { user: @user })
  end
  
  after :each do
    @project.destroy
  end
  
  context 'with valid authorization' do
    context 'with valid parameters' do
      before do
        post "/projects/#{@project.id.to_str}/manifests", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @project.reload
      end
      
      it 'returns 200' do
        expect(response).to have_http_status(:ok)
      end
      
      it 'adds the manifest' do
        expect(@project.manifests.any? { |key, manifest| manifest['url'] == "https://iiif.library.utoronto.ca/presentation/v2/hollar:Hollar_a_3000/manifest"}).to be true
      end
    end
    context 'with missing project' do
      before do
        post "/projects/#{@project.id.to_str}missing/manifests", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
      end
      
      it 'returns 404' do
        expect(response).to have_http_status(:not_found)
      end
    end
    context 'with unauthorized project' do
      before do
        @project.user = FactoryGirl.create(:user)
        @project.save
        post "/projects/#{@project.id.to_str}/manifests", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
      end
      
      it 'returns 403' do
        expect(response).to have_http_status(:unauthorized)
      end
      
      it 'leaves the project alone' do
        expect(@project.manifests.any? { |key, manifest| manifest['url'] == "https://iiif.library.utoronto.ca/presentation/v2/hollar:Hollar_a_3000/manifest"}).to be false
      end
    end
    context 'with exception' do
      before do
        allow_any_instance_of(Project).to receive(:save).and_raise("WaahooException")
        post "/projects/#{@project.id.to_str}/manifests", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @body = JSON.parse(response.body)
      end
      
      it 'returns 400' do
        expect(response).to have_http_status(:bad_request)
      end
      
      it 'shows the exception' do
        expect(@body['errors']).to eq "WaahooException"
      end
    end
  end
  
  context 'with corrupted authorization' do
    before do
      post "/projects/#{@project.id.to_str}/manifests", params: @parameters.to_json, headers: {'Authorization' => @authToken+'asdf', 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
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
      post "/projects/#{@project.id.to_str}/manifests", params: @parameters.to_json, headers: {'Authorization' => ""}
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
      post "/projects/#{@project.id.to_str}/manifests", params: @parameters.to_json, headers: {'Authorization' => "123456789"}
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
      post "/projects/#{@project.id.to_str}/manifests"
    end

    it 'returns an unauthorized action error' do
      expect(response).to have_http_status(:unauthorized)
    end
  end
end

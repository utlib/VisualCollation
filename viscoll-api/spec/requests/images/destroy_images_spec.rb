require 'rails_helper'

describe "DELETE /images", :type => :request do
  before do
    @user = FactoryGirl.create(:user, {:password => "user"})
    put '/confirmation', params: {:confirmation_token => @user.confirmation_token}
    post '/session', params: {:session => { :email => @user.email, :password => "user" }}
    @authToken = JSON.parse(response.body)['session']['jwt']
  end

  before :each do
    @project = FactoryGirl.create(:codex_project, user: @user, quire_structure: [[1, 2]])
    @image1 = FactoryGirl.create(:image, user: @user)
    @image2 = FactoryGirl.create(:image, user: @user)
    @parameters = {
      "imageIDs": [@image1.id.to_s]
    }
  end

  context 'and valid authorization' do
    context 'and valid image' do
      before do
        delete '/images', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @body = JSON.parse(response.body)
      end

      it 'returns 200' do
        expect(response).to have_http_status(:ok)
      end

      it 'deletes the right image' do
        expect(Image.where(id: @image1.id)).not_to exist
        expect(Image.where(id: @image2.id)).to exist
      end
    end
    
    context 'and missing image' do
      before do
        @parameters[:imageIDs][0] += 'missing'
        delete '/images', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @body = JSON.parse(response.body)
      end
      
      it 'returns 404' do
        expect(response).to have_http_status(:not_found)
      end
      
      it 'returns the error message' do
        expect(@body['error']).to eq("image not found with id #{@image1.id.to_str}missing")
      end
    end
    
    context 'and unauthorized image' do
      before do
        @image1.update(user: FactoryGirl.create(:user))
        delete '/images', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
      end
      
      it 'returns 401' do
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'and uncaught exception' do
      before do
        allow(Image).to receive(:find).and_raise("Exception")
        delete '/images', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
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
      delete '/images', params: @parameters.to_json, headers: {'Authorization' => @authToken+'asdf', 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
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
      delete '/images', params: @parameters.to_json, headers: {'Authorization' => ""}
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
      delete '/images', params: @parameters.to_json, headers: {'Authorization' => "123456789"}
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
      delete '/images'
    end

    it 'returns an unauthorized action error' do
      expect(response).to have_http_status(:unauthorized)
    end
  end
end

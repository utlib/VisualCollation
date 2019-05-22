require 'rails_helper'

describe "GET /images/:id", :type => :request do
  before do
    @user = FactoryGirl.create(:user, {:password => "user"})
    put '/confirmation', params: {:confirmation_token => @user.confirmation_token}
    post '/session', params: {:session => { :email => @user.email, :password => "user" }}
    @authToken = JSON.parse(response.body)['session']['jwt']
  end

  before :each do
    @project = FactoryGirl.create(:codex_project, user: @user, quire_structure: [[1, 2]])
    @image1 = FactoryGirl.create(:pixel, user: @user)
    @image2 = FactoryGirl.create(:shiba_inu, user: @user)
  end

  before :all do
    imagePath = "#{Rails.root}/public/uploads"
    File.new(imagePath+'/pixel', 'w')
  end

  after :all do
    imagePath = "#{Rails.root}/public/uploads"
    File.delete(imagePath+'/pixel')
  end

  context 'and valid authorization' do
    context 'and valid image' do
      before do
        get "/images/#{@image1.id}", headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json'}
      end

      it 'returns 200' do
        expect(response).to have_http_status(:ok)
      end

      it 'shows the right image' do
        expect(response.body).to eq(File.open("#{Rails.root}/public/uploads/pixel", 'rb') { |file| file.read })
      end
    end
    
    context 'and missing image' do
      before do
        get "/images/#{@image1.id}missing", headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json'}
        @body = JSON.parse(response.body)
      end
      
      it 'returns 404' do
        expect(response).to have_http_status(:not_found)
      end
      
      it 'returns the error message' do
        expect(@body['error']).to eq("image not found with id #{@image1.id.to_str}missing")
      end
    end

    context 'and uncaught exception' do
      before do
        allow(Image).to receive(:find).and_raise("Exception")
        get "/images/#{@image1.id}", headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json'}
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
end

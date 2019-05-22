require 'rails_helper'

describe "GET /images/zip/:imageid_:projectid", :type => :request do
  before do
    @user = FactoryGirl.create(:user, {:password => "user"})
    put '/confirmation', params: {:confirmation_token => @user.confirmation_token}
    post '/session', params: {:session => { :email => @user.email, :password => "user" }}
    @authToken = JSON.parse(response.body)['session']['jwt']
    @zipPath = "#{Rails.root}/public/uploads"
  end

  before :each do
    @project = FactoryGirl.create(:codex_project, user: @user, quire_structure: [[1, 2]])
    @image1 = FactoryGirl.create(:pixel, user: @user)
    @image2 = FactoryGirl.create(:shiba_inu, user: @user)
  end

  context 'and valid authorization' do
    context 'and valid image' do
      before do

        File.open("#{@zipPath}/#{@project.id}_images.zip", 'w+') { |file| file.write('testcontent') }
        get "/images/zip/#{@project.id}", headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json'}
      end
      after do
        File.delete("#{@zipPath}/#{@project.id}_images.zip")
      end

      it 'returns 200' do
        expect(response).to have_http_status(:ok)
      end

      it 'sends the zip file' do
        expect(response.body).to eq('testcontent')
      end
    end
    
    context 'and missing image' do
      before do
        get "/images/zip/#{@image1.id}missing_#{@project.id}", headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json'}
        @body = JSON.parse(response.body)
      end
      
      it 'returns 422' do
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context 'and uncaught exception' do
      before do
        allow(Image).to receive(:find).and_raise("Exception")
        get "/images/zip/#{@image1.id}_#{@project.id}", headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json'}
        @body = JSON.parse(response.body)
      end

      it 'returns 422' do
        expect(response).to have_http_status(:unprocessable_entity)
        @body = JSON.parse(response.body)
      end
      
      it 'returns the error message' do
        expect(@body['error']).to include "Cannot read file"
      end
    end
  end
end

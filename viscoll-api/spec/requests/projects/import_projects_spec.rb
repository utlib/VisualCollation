require 'rails_helper'

describe "PUT /projects/import", :type => :request do
  before do
    @user = FactoryGirl.create(:user, {:password => "user"})
    put '/confirmation', params: {:confirmation_token => @user.confirmation_token}
    post '/session', params: {:session => { :email => @user.email, :password => "user" }}
    @authToken = JSON.parse(response.body)['session']['jwt']
  end

  before :each do
    @parameters = {
      "importData": nil,
      "importFormat": nil,
      "imageData": nil
    }
  end

  describe 'JSON imports' do
    let(:import_data) { File.open(File.dirname(__FILE__) + '/../../fixtures/sample_import_json.json', 'r') { |file| file.read } }
    before :each do
      @parameters[:importFormat] = 'json'
    end

    it 'should import properly' do
      @parameters[:importData] = import_data
      expect{ put '/projects/import', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'} }.to change{Project.count}.by(1)
      expect(response).to have_http_status(:ok)
      project = Project.last
      expect(project.title).to eq 'Sample project'
      expect(project.shelfmark).to eq 'Ravenna 384.2339'
      expect(project.metadata).to eq({ 'date' => '18th century' })
      expect(project.preferences).to eq({ 'showTips' => true })
      expect(project.taxonomies).to eq ['Hand', 'Ink', 'Unknown']
      expect(project.manifests).to eq({ '12341234' => { 'id' => '12341234', 'url' => 'https://digital.library.villanova.edu/Item/vudl:99213/Manifest', 'name' => 'Boston, and Bunker Hill.' } })
      expect(project.leafs.count).to eq 6
      expect(project.sides.count).to eq 12
      expect(project.terms[0].title).to eq 'Test Term'
      expect(project.terms[0].taxonomy).to eq 'Ink'
      expect(project.terms[0].description).to eq 'This is a test'
      expect(project.terms[0].objects).to eq({'Group' => [project.groups[0].id.to_s], 'Leaf' => [project.leafs[4].id.to_s], 'Recto' => [project.leafs[4].rectoID], 'Verso' => [project.leafs[4].versoID]})
    end

    it 'should show error for invalid JSON' do
      @parameters[:importData] = import_data + '{}[];;'
      expect{ put '/projects/import', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'} }.not_to change{Project.count}
      expect(response).to have_http_status(:unprocessable_entity)
      expect(JSON.parse(response.body)['error']).to eq("Sorry, the imported data cannot be validated. Please check your file for errors and make sure the correct import format is selected above.")
    end
  end

  describe 'XML imports' do
    let(:import_data) { File.open(File.dirname(__FILE__) + '/../../fixtures/sample_import_xml.xml', 'r') { |file| file.read } }
    before :each do
      @parameters[:importFormat] = 'xml'
    end

    it 'should import properly' do
      @parameters[:importData] = import_data
      expect{ put '/projects/import', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'} }.to change{Project.count}.by(1)
      project = Project.last
      expect(project.title).to eq 'Sample project'
      expect(project.shelfmark).to eq 'Ravenna 384.2339'
      expect(project.metadata).to eq({ 'date' => '18th century' })
      expect(project.preferences).to eq({ 'showTips' => true })
      # TODO: import taxonomies
      expect(project.manifests).to eq({ '12341234' => { 'id' => '12341234', 'url' => 'https://digital.library.villanova.edu/Item/vudl:99213/Manifest' } })
      expect(project.leafs.count).to eq 6
      expect(project.sides.count).to eq 12
      # TODO: import terms
    end

    it 'should show error for invalid XML' do
      @parameters[:import_data] = import_data + '<junk'
      expect{ put '/projects/import', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'} }.not_to change{Project.count}
      expect(response).to have_http_status(:unprocessable_entity)
      expect(JSON.parse(response.body)['error']).not_to be_blank
    end
  end

  describe 'Invalid situations' do
    let(:import_data) { File.open(File.dirname(__FILE__) + '/../../fixtures/sample_import_json.json', 'r') { |file| file.read } }
    before :each do
      @parameters[:importFormat] = 'json'
    end

    context 'with corrupted authorization' do
      before do
        put '/projects/import', params: @parameters.to_json, headers: {'Authorization' => @authToken+'asdf', 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
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
        put '/projects/import', params: @parameters.to_json, headers: {'Authorization' => ""}
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
        put '/projects/import', params: @parameters.to_json, headers: {'Authorization' => "123456789"}
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
        put '/projects/import'
      end

      it 'returns an unauthorized action error' do
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end

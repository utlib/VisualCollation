require 'rails_helper'

RSpec.describe ControllerHelper::ImportMappingHelper, type: :helper do
  before do
    @base_api_url = 'http://127.0.0.1:12345'
    @user = FactoryGirl.create(:user)
    @project = FactoryGirl.create(:codex_project, user: @user, quire_structure: [[1,3]])
  end
  
  describe 'handleMappingImport' do
    it 'should run properly with images in various attachment situations' do
      # Prep user with preloaded images
      preloads = [
        FactoryGirl.create(:pixel, user: @user, projectIDs: [@project.id.to_s], filename: '1V.png'),
        FactoryGirl.create(:shiba_inu, user: @user, projectIDs: [@project.id.to_s], filename: '2R.png', id: '5a28221ec199860e7a2f5fd1shibainu'),
        FactoryGirl.create(:viscoll_logo, user: @user, projectIDs: [@project.id.to_s], filename: '2V.png', id: '5a28221ec199860e7a2f5fd1waahoo')
      ]
      @user.images = preloads
      @user.save
      # Situation 1: Brand new image uploaded
      @project.sides[0].update(image: {
        manifestID: 'DIYImages',
        label: '1R',
        url: 'http://www.foobar.net/images/5a28221ec199860e7a2f5fd1_1R.png'
      })
      # Situation 2: Uploaded image same name and content as existing image
      @project.sides[1].update(image: {
        manifestID: 'DIYImages',
        label: '1V',
        url: 'http://www.foobar.net/images/5a28221ec199860e7a2f5fd1pixel_1V.png'
      })
      # Situation 3: Uploaded image same name but different content from existing image
      @project.sides[2].update(image: {
        manifestID: 'DIYImages',
        label: '2R',
        url: 'http://www.foobar.net/images/5a28221ec199860e7a2f5fd1_2R.png'
      })
      # Situation 4: Image exists with current user but not uploaded
      @project.sides[3].update(image: {
        manifestID: 'DIYImages',
        label: '2V',
        url: 'http://www.foobar.net/images/5a28221ec199860e7a2f5fd1waahoo_2V.png'
      })
      # Situation 5: Image specified but not uploaded
      @project.sides[4].update(image: {
        manifestID: 'DIYImages',
        label: '3R',
        url: 'http://www.foobar.net/images/5a28221ec199860e7a2f5fd1_3R.png'
      })
      handleMappingImport(@project, File.new(File.dirname(__FILE__) + '/../../fixtures/dots_exported.zip', 'rb'), @user)
      @project.reload
      expect(@project.sides[0].image).to include('manifestID' => 'DIYImages')
      expect(@project.sides[0].image['url']).to match(/http:\/\/127\.0\.0\.1:12345\/images\/[\w]+_1R\.png/)
      expect(@project.sides[1].image).to include('manifestID' => 'DIYImages', 'url' => "http://127.0.0.1:12345/images/#{preloads[0].id}_1V.png")
      expect(@project.sides[2].image).to include('manifestID' => 'DIYImages')
      expect(@project.sides[2].image['url']).to match(/http:\/\/127\.0\.0\.1:12345\/images\/[\w]+_2R\.png/)
      expect(@project.sides[3].image).to include('manifestID' => 'DIYImages', 'url' => "http://127.0.0.1:12345/images/5a28221ec199860e7a2f5fd1waahoo_2V.png")
      expect(@project.sides[4].image).to be_empty
    end
  end
end

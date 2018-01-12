require 'rails_helper'

module ControllerHelper
  module StubbedImportHelper
    include ControllerHelper::ImportJsonHelper
    
    def current_user
      User.last
    end
  end
end

RSpec.describe ControllerHelper::StubbedImportHelper, type: :helper do
  describe 'JSON Import' do
    let(:json_import_data) do
      JSON.parse(File.open(File.dirname(__FILE__) + '/../../fixtures/sample_import_json.json', 'r') { |file| file.read })
    end
    
    it 'should import properly' do
      user = FactoryGirl.create(:user)
      expect{ handleJSONImport(json_import_data) }.to change{Project.count}.by(1)
      project = Project.last
      expect(project.title).to eq 'Sample project'
      expect(project.shelfmark).to eq 'Ravenna 384.2339'
      expect(project.metadata).to eq({ 'date' => '18th century' })
      expect(project.preferences).to eq({ 'showTips' => true })
      expect(project.noteTypes).to eq ['Hand', 'Ink', 'Unknown']
      expect(project.manifests).to eq({ '12341234' => { 'id' => '12341234', 'url' => 'https://digital.library.villanova.edu/Item/vudl:99213/Manifest', 'name' => 'Boston, and Bunker Hill.' } })
      expect(project.leafs.count).to eq 6
      expect(project.sides.count).to eq 12
      expect(project.notes[0].title).to eq 'Test Note'
      expect(project.notes[0].type).to eq 'Ink'
      expect(project.notes[0].description).to eq 'This is a test'
      expect(project.notes[0].objects).to eq({'Group' => [project.groups[0].id.to_s], 'Leaf' => [project.leafs[4].id.to_s], 'Recto' => [project.leafs[4].rectoID], 'Verso' => [project.leafs[4].versoID]})
    end
    
    it 'should avoid overwriting a project of the same name' do
      user = FactoryGirl.create(:user)
      existing_project = FactoryGirl.create(:project, title: 'Ultra waahoo project is ultra waahoo')
      duplicated_data = json_import_data
      duplicated_data['project']['title'] = existing_project.title
      expect{ handleJSONImport(duplicated_data) }.to change{Project.count}.by(1)
      existing_project.reload
      expect(existing_project.title).to eq 'Ultra waahoo project is ultra waahoo'
      project = Project.last
      expect(project.title[0..46]).to eq "Copy of Ultra waahoo project is ultra waahoo @ "
      expect(project.shelfmark).to eq 'Ravenna 384.2339'
      expect(project.metadata).to eq({ 'date' => '18th century' })
      expect(project.preferences).to eq({ 'showTips' => true })
      expect(project.noteTypes).to eq ['Hand', 'Ink', 'Unknown']
      expect(project.manifests).to eq({ '12341234' => { 'id' => '12341234', 'url' => 'https://digital.library.villanova.edu/Item/vudl:99213/Manifest', 'name' => 'Boston, and Bunker Hill.' } })
      expect(project.leafs.count).to eq 6
      expect(project.sides.count).to eq 12
      expect(project.notes[0].title).to eq 'Test Note'
      expect(project.notes[0].type).to eq 'Ink'
      expect(project.notes[0].description).to eq 'This is a test'
      expect(project.notes[0].objects).to eq({'Group' => [project.groups[0].id.to_s], 'Leaf' => [project.leafs[4].id.to_s], 'Recto' => [project.leafs[4].rectoID], 'Verso' => [project.leafs[4].versoID]})
    end
  end
end

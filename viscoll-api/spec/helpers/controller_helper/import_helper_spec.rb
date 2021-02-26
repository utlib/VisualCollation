require 'rails_helper'

module ControllerHelper
  module StubbedImportHelper
    include ControllerHelper::ImportHelper
    
    def current_user
      User.last
    end
  end
end

RSpec.describe ControllerHelper::StubbedImportHelper, type: :helper do
  describe 'JSON Import' do
    let(:json_import_data) do
      {
        "project" => {
          "title" => 'Sample project',
          "shelfmark" => 'Ravenna 384.2339',
          "metadata" => { 'date' => '18th century' },
          "preferences" => { 'showTips' => true },
          "manifests" => { '12341234' => { 'id' => '12341234', 'url' => 'https://digital.library.villanova.edu/Item/vudl:99213/Manifest', 'name' => 'Boston, and Bunker Hill.' } },
          "taxonomies" => ['Hand', 'Ink', 'Unknown']
        },
        "Groups" => {
          "1" => {"params" => {"type" => "Quire", "title" => "Quire 1", "nestLevel" => 1}, "tacketed" => [], "sewing" => [], "parentOrder" => nil, "memberOrders" => ["Leaf_1", "Leaf_2", "Group_2", "Leaf_5", "Leaf_6"]},
          "2" => {"params" => {"type" => "Quire", "title" => "Quire 2", "nestLevel" => 2}, "tacketed" => [], "sewing" => [], "parentOrder" => 1, "memberOrders" => ["Leaf_3", "Leaf_4"]}
        },
        "Leafs" => {
          "1" => {"params" => {"folio_number" => "1", "material" => "Paper", "type" => "Original", "attached_above" => "None", "attached_below" => "None", "stub" => "No", "nestLevel" => 1}, "conjoined_leaf_order" => nil, "parentOrder" => 1, "rectoOrder" => 1, "versoOrder" => 1},
          "2" => {"params" => {"folio_number" => "2", "material" => "Paper", "type" => "Original", "attached_above" => "None", "attached_below" => "None", "stub" => "No", "nestLevel" => 1}, "conjoined_leaf_order" => nil, "parentOrder" => 1, "rectoOrder" => 2, "versoOrder" => 2},
          "3" => {"params" => {"folio_number" => "3", "material" => "Paper", "type" => "Original", "attached_above" => "None", "attached_below" => "None", "stub" => "No", "nestLevel" => 2}, "conjoined_leaf_order" => nil, "parentOrder" => 2, "rectoOrder" => 3, "versoOrder" => 3},
          "4" => {"params" => {"folio_number" => "4", "material" => "Paper", "type" => "Original", "attached_above" => "None", "attached_below" => "None", "stub" => "No", "nestLevel" => 2}, "conjoined_leaf_order" => nil, "parentOrder" => 2, "rectoOrder" => 4, "versoOrder" => 4},
          "5" => {"params" => {"folio_number" => "5", "material" => "Paper", "type" => "Original", "attached_above" => "None", "attached_below" => "None", "stub" => "No", "nestLevel" => 1}, "conjoined_leaf_order" => nil, "parentOrder" => 1, "rectoOrder" => 5, "versoOrder" => 5},
          "6" => {"params" => {"folio_number" => "6", "material" => "Paper", "type" => "Endleaf", "attached_above" => "None", "attached_below" => "None", "stub" => "No", "nestLevel" => 1}, "conjoined_leaf_order" => nil, "parentOrder" => 1, "rectoOrder" => 6, "versoOrder" => 6}
        },
        "Rectos" => {
          "1" => {"params" => {"texture" => "Hair", "image" => {}, "script_direction" => "None"}, "parentOrder" => 1},
          "2" => {"params" => {"texture" => "Hair", "image" => {}, "script_direction" => "None"}, "parentOrder" => 2},
          "3" => {"params" => {"texture" => "Hair", "image" => {}, "script_direction" => "None"}, "parentOrder" => 3},
          "4" => {"params" => {"texture" => "Hair", "image" => {}, "script_direction" => "None"}, "parentOrder" => 4},
          "5" => {"params" => {"texture" => "Hair", "image" => {}, "script_direction" => "None"}, "parentOrder" => 5},
          "6" => {"params" => {"texture" => "Hair", "image" => {}, "script_direction" => "None"}, "parentOrder" => 6}
        },
        "Versos" => {
          "1" => {"params" => {"texture" => "Flesh", "image" => {}, "script_direction" => "None"}, "parentOrder" => 1},
          "2" => {"params" => {"texture" => "Flesh", "image" => {}, "script_direction" => "None"}, "parentOrder" => 2},
          "3" => {"params" => {"texture" => "Flesh", "image" => {}, "script_direction" => "None"}, "parentOrder" => 3},
          "4" => {"params" => {"texture" => "Flesh", "image" => {}, "script_direction" => "None"}, "parentOrder" => 4},
          "5" => {"params" => {"texture" => "Flesh", "image" => {}, "script_direction" => "None"}, "parentOrder" => 5},
          "6" => {"params" => {"texture" => "Flesh", "image" => {}, "script_direction" => "None"}, "parentOrder" => 6}
        },
        "Terms" => {
          "1" => {"params" => {"title" => "Test Term", "taxonomy" => "Ink", "description" => "This is a test", "show" => true}, "objects" => {"Group" => [1], "Leaf" => [5], "Recto" => [5], "Verso" => [5]}}
        }
      }
    end
    
    it 'should import properly' do
      user = FactoryGirl.create(:user)
      expect{ handleJSONImport(json_import_data) }.to change{Project.count}.by(1)
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
      expect(project.taxonomies).to eq ['Hand', 'Ink', 'Unknown']
      expect(project.manifests).to eq({ '12341234' => { 'id' => '12341234', 'url' => 'https://digital.library.villanova.edu/Item/vudl:99213/Manifest', 'name' => 'Boston, and Bunker Hill.' } })
      expect(project.leafs.count).to eq 6
      expect(project.sides.count).to eq 12
      expect(project.terms[0].title).to eq 'Test Term'
      expect(project.terms[0].taxonomy).to eq 'Ink'
      expect(project.terms[0].description).to eq 'This is a test'
      expect(project.terms[0].objects).to eq({'Group' => [project.groups[0].id.to_s], 'Leaf' => [project.leafs[4].id.to_s], 'Recto' => [project.leafs[4].rectoID], 'Verso' => [project.leafs[4].versoID]})
    end
  end
end

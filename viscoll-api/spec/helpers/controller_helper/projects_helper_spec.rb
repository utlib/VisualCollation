require 'rails_helper'

RSpec.describe ControllerHelper::ProjectsHelper, type: :helper do
  describe 'addGroupsLeafsConjoin' do
    it 'should create a variety of groups' do
      @project = FactoryGirl.create(:project)
      addGroupsLeafsConjoin(@project, [
        { 'leaves' => 2 },
        { 'leaves' => 4, 'conjoin' => true },
        { 'leaves' => 3, 'conjoin' => true, 'oddLeaf' => 2 }
      ])
      expect(@project.groups.count).to eq 3
      expect(@project.groups[0].memberIDs.count).to eq 2
      expect(@project.groups[1].memberIDs.count).to eq 4
      expect(Leaf.find(@project.groups[1].memberIDs[0]).conjoined_to).to eq @project.groups[1].memberIDs[3]
      expect(Leaf.find(@project.groups[1].memberIDs[1]).conjoined_to).to eq @project.groups[1].memberIDs[2]
      expect(Leaf.find(@project.groups[1].memberIDs[2]).conjoined_to).to eq @project.groups[1].memberIDs[1]
      expect(Leaf.find(@project.groups[1].memberIDs[3]).conjoined_to).to eq @project.groups[1].memberIDs[0]
      expect(@project.groups[2].memberIDs.count).to eq 3
      expect(Leaf.find(@project.groups[2].memberIDs[1]).conjoined_to).to be_blank
      expect(Leaf.find(@project.groups[2].memberIDs[0]).conjoined_to).to eq @project.groups[2].memberIDs[2]
      expect(Leaf.find(@project.groups[2].memberIDs[2]).conjoined_to).to eq @project.groups[2].memberIDs[0]
    end
  end
  
  describe 'getManifestInformation' do
    before do
      stub_request(:get, 'https://iiif.library.utoronto.ca/presentation/v2/hollar:Hollar_a_3000/manifest').with(headers: { 'Accept' => '*/*', 'User-Agent' => 'Ruby' }).to_return(status: 200, body: File.read(File.dirname(__FILE__) + '/../../fixtures/uoft_hollar.json'), headers: {})
    end
    
    it 'should pull images' do
      result = getManifestInformation('https://iiif.library.utoronto.ca/presentation/v2/hollar:Hollar_a_3000/manifest')
      expect(result[:name]).to eq "The fables of Aesop / paraphras'd in verse, and adorn'd with sculpture ; by John Ogilby."
      expect(result[:images].count).to eq 392
      expect(result[:images][1]).to eq({ label: "Hollar_a_3000_0002", url: "https://iiif.library.utoronto.ca/image/v2/hollar:Hollar_a_3000_0002" })
    end
  end
  
  describe 'generateResponse/getLeafMembers' do
    before do
      stub_request(:get, 'https://digital.library.villanova.edu/Item/vudl:99213/Manifest').with(headers: { 'Accept' => '*/*', 'User-Agent' => 'Ruby' }).to_return(status: 200, body: File.read(File.dirname(__FILE__) + '/../../fixtures/villanova_boston.json'), headers: {})
      @project = FactoryGirl.create(:project,
        title: 'Sample project',
        shelfmark: 'Ravenna 384.2339',
        metadata: { date: '18th century' },
        preferences: { showTips: true },
        noteTypes: ['Hand', 'Ink', 'Unknown'],
        manifests: { '12341234': { id: '12341234', url: 'https://digital.library.villanova.edu/Item/vudl:99213/Manifest', name: 'Boston, and Bunker Hill.' } }
      )
      # Attach group with 2 leafs - (group with 2 leafs) - 2 conjoined leafs
      @testgroup = FactoryGirl.create(:group, project: @project, nestLevel: 1)
      @upleafs = 2.times.collect { FactoryGirl.create(:leaf, project: @project, parentID: @testgroup.id.to_s, nestLevel: 1) }
      @testmidgroup = FactoryGirl.create(:group, project: @project, parentID: @testgroup.id.to_s, nestLevel: 2)
      @midleafs = 2.times.collect { FactoryGirl.create(:leaf, project: @project, parentID: @testmidgroup.id.to_s, nestLevel: 2) }  
      @botleafs = 2.times.collect { FactoryGirl.create(:leaf, project: @project, parentID: @testgroup.id.to_s, nestLevel: 1) }
      @botleafs[1].update(type: 'Endleaf')
      @project.add_groupIDs([@testgroup.id.to_s, @testmidgroup.id.to_s], 0)
      @testgroup.add_members([@upleafs[0].id.to_s, @upleafs[1].id.to_s, @testmidgroup.id.to_s, @botleafs[0].id.to_s, @botleafs[1].id.to_s], 0)
      @testmidgroup.add_members([@midleafs[0].id.to_s, @midleafs[1].id.to_s], 0)
      @testnote = FactoryGirl.create(:note, project: @project, title: 'Test Note', type: 'Ink', description: 'This is a test', show: true, objects: {Group: [@testgroup.id.to_s], Leaf: [@botleafs[0].id.to_s], Recto: [@botleafs[0].rectoID], Verso: [@botleafs[0].versoID]})
    end
    
    it 'returns the right output for the given sample' do
      body = generateResponse()
      expect(body[:project]).to eq({
        'id': @project.id.to_s,
        'title': 'Sample project',
        'shelfmark': 'Ravenna 384.2339',
        'metadata': { 'date' => '18th century' },
        'preferences': { 'showTips' => true },
        'noteTypes': [ 'Hand', 'Ink', 'Unknown' ],
        'manifests': { '12341234' => {
          'id' => '12341234', 
          'url' => 'https://digital.library.villanova.edu/Item/vudl:99213/Manifest', 
          'name' => 'Boston, and Bunker Hill.', 
          'images' => [ { 'label' => nil, 'url' => 'https://iiif.library.villanova.edu/image/vudl%3A99215', 'manifestID' => '12341234' } ]
        } },
      })
      expect(body[:groupIDs]).to eq([@testgroup.id.to_s, @testmidgroup.id.to_s])
      expect(body[:leafIDs]).to eq((@upleafs+@midleafs+@botleafs).collect { |leaf| leaf.id.to_s })
      expect(body[:rectoIDs]).to eq((@upleafs+@midleafs+@botleafs).collect { |leaf| leaf.rectoID })
      expect(body[:versoIDs]).to eq((@upleafs+@midleafs+@botleafs).collect { |leaf| leaf.versoID })
      expect(body[:notes]).to eq({@testnote.id.to_s => {
        id: @testnote.id.to_s,
        title: 'Test Note',
        type: 'Ink',
        description: 'This is a test',
        show: true,
        objects: {'Group' => [@testgroup.id.to_s], 'Leaf' => [@botleafs[0].id.to_s], 'Recto' => [@botleafs[0].rectoID], 'Verso' => [@botleafs[0].versoID]}
      }})
    end
  end
  
  describe 'Roman numerals' do
    it 'should convert properly' do
      {
        1999 => "mcmxcix",
        1000 => "m",
        900 => "cm",
        678 => "dclxxviii",
        666 => "dclxvi",
        444 => "cdxliv",
        500 => "d",
        400 => "cd",
        100 => "c",
        90 => "xc",
        50 => "l",
        40 => "xl",
        10 => "x",
        9 => "ix",
        5 => "v",
        4 => "iv",
        1 => "i"
      }.each do |value, target|
        expect(to_roman(value)).to eq target
      end
    end
  end
end

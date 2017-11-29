require 'rails_helper'

RSpec.describe ControllerHelper::ExportHelper, type: :helper do
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
  
  it 'builds the right JSON' do
    result = buildJSON(@project)
    expect(result[:project]).to eq({
      title: 'Sample project',
      shelfmark: 'Ravenna 384.2339',
      metadata: { 'date' => '18th century' },
      preferences: { 'showTips' => true },
      manifests: { '12341234' => { 'id' => '12341234', 'url' => 'https://digital.library.villanova.edu/Item/vudl:99213/Manifest', 'name' => 'Boston, and Bunker Hill.' } },
      noteTypes: ['Hand', 'Ink', 'Unknown']
    })
    expect(result[:groups]).to eq({
      1 => {:params=>{:type=>"Quire", :title=>"Quire 1", :nestLevel=>1}, :tacketed=>[], :sewing=>[], :parentOrder=>nil, :memberOrders=>["Leaf_1", "Leaf_2", "Group_2", "Leaf_5", "Leaf_6"]},
      2 => {:params=>{:type=>"Quire", :title=>"Quire 2", :nestLevel=>2}, :tacketed=>[], :sewing=>[], :parentOrder=>1, :memberOrders=>["Leaf_3", "Leaf_4"]}
    })
    expect(result[:leafs]).to eq({
      1 => {:params=>{:material=>"Paper", :type=>"Original", :attachment_method=>"None", :attached_above=>"None", :attached_below=>"None", :stub=>"None", :nestLevel=>1}, :conjoined_leaf_order=>nil, :parentOrder=>1, :rectoOrder=>1, :versoOrder=>1},
      2 => {:params=>{:material=>"Paper", :type=>"Original", :attachment_method=>"None", :attached_above=>"None", :attached_below=>"None", :stub=>"None", :nestLevel=>1}, :conjoined_leaf_order=>nil, :parentOrder=>1, :rectoOrder=>2, :versoOrder=>2},
      3 => {:params=>{:material=>"Paper", :type=>"Original", :attachment_method=>"None", :attached_above=>"None", :attached_below=>"None", :stub=>"None", :nestLevel=>2}, :conjoined_leaf_order=>nil, :parentOrder=>2, :rectoOrder=>3, :versoOrder=>3},
      4 => {:params=>{:material=>"Paper", :type=>"Original", :attachment_method=>"None", :attached_above=>"None", :attached_below=>"None", :stub=>"None", :nestLevel=>2}, :conjoined_leaf_order=>nil, :parentOrder=>2, :rectoOrder=>4, :versoOrder=>4},
      5 => {:params=>{:material=>"Paper", :type=>"Original", :attachment_method=>"None", :attached_above=>"None", :attached_below=>"None", :stub=>"None", :nestLevel=>1}, :conjoined_leaf_order=>nil, :parentOrder=>1, :rectoOrder=>5, :versoOrder=>5},
      6 => {:params=>{:material=>"Paper", :type=>"Endleaf", :attachment_method=>"None", :attached_above=>"None", :attached_below=>"None", :stub=>"None", :nestLevel=>1}, :conjoined_leaf_order=>nil, :parentOrder=>1, :rectoOrder=>6, :versoOrder=>6}
    })
    expect(result[:rectos]).to eq({
      1 => {:params=>{:folio_number=>"1R", :texture=>"Hair", :image=>{}, :script_direction=>"None"}, :parentOrder=>1},
      2 => {:params=>{:folio_number=>"2R", :texture=>"Hair", :image=>{}, :script_direction=>"None"}, :parentOrder=>2},
      3 => {:params=>{:folio_number=>"3R", :texture=>"Hair", :image=>{}, :script_direction=>"None"}, :parentOrder=>3},
      4 => {:params=>{:folio_number=>"4R", :texture=>"Hair", :image=>{}, :script_direction=>"None"}, :parentOrder=>4},
      5 => {:params=>{:folio_number=>"5R", :texture=>"Hair", :image=>{}, :script_direction=>"None"}, :parentOrder=>5},
      6 => {:params=>{:folio_number=>"6R", :texture=>"Hair", :image=>{}, :script_direction=>"None"}, :parentOrder=>6}
    })
    expect(result[:versos]).to eq({
      1 => {:params=>{:folio_number=>"1V", :texture=>"Flesh", :image=>{}, :script_direction=>"None"}, :parentOrder=>1},
      2 => {:params=>{:folio_number=>"2V", :texture=>"Flesh", :image=>{}, :script_direction=>"None"}, :parentOrder=>2},
      3 => {:params=>{:folio_number=>"3V", :texture=>"Flesh", :image=>{}, :script_direction=>"None"}, :parentOrder=>3},
      4 => {:params=>{:folio_number=>"4V", :texture=>"Flesh", :image=>{}, :script_direction=>"None"}, :parentOrder=>4},
      5 => {:params=>{:folio_number=>"5V", :texture=>"Flesh", :image=>{}, :script_direction=>"None"}, :parentOrder=>5},
      6 => {:params=>{:folio_number=>"6V", :texture=>"Flesh", :image=>{}, :script_direction=>"None"}, :parentOrder=>6}
    })
    expect(result[:notes]).to eq({
      1 => {:params=>{:title=>"Test Note", :type=>"Ink", :description=>"This is a test", :show=>true}, :objects=>{:Group=>[1], :Leaf=>[5], :Recto=>[5], :Verso=>[5]}}
    })
  end
end

require 'rails_helper'

RSpec.describe ControllerHelper::ExportHelper, type: :helper do
  before do
    stub_request(:get, 'https://digital.library.villanova.edu/Item/vudl:99213/Manifest').with(headers: { 'Accept' => '*/*', 'User-Agent' => 'Ruby' }).to_return(status: 200, body: File.read(File.dirname(__FILE__) + '/../../fixtures/villanova_boston.json'), headers: {})
    @project = FactoryGirl.create(:project,
      'title' => 'Sample project',
      'shelfmark' => 'Ravenna 384.2339',
      'notationStyle' => 'r-v',
      'metadata' => { date: '18th century' },
      'preferences' => { 'showTips' => true },
      'taxonomies' => ['Ink', 'Unknown'],
      'manifests' => { '12341234': { 'id' => '12341234', 'url' => 'https://digital.library.villanova.edu/Item/vudl:99213/Manifest', 'name' => 'Boston, and Bunker Hill.' } }
    )
    # Attach group with 2 leafs - (group with 2 leafs) - 2 conjoined leafs
    @testgroup = FactoryGirl.create(:group, project: @project, nestLevel: 1, title: 'Group 1')
    @upleafs = 2.times.collect { FactoryGirl.create(:leaf, project: @project, parentID: @testgroup.id.to_s, nestLevel: 1) }
    @testmidgroup = FactoryGirl.create(:group, project: @project, parentID: @testgroup.id.to_s, nestLevel: 2, title: 'Group 2')
    @midleafs = 2.times.collect { FactoryGirl.create(:leaf, project: @project, parentID: @testmidgroup.id.to_s, nestLevel: 2) }
    @botleafs = 2.times.collect { FactoryGirl.create(:leaf, project: @project, parentID: @testgroup.id.to_s, nestLevel: 1) }
    @botleafs[1].update(type: 'Endleaf')
    @project.add_groupIDs([@testgroup.id.to_s, @testmidgroup.id.to_s], 0)
    @testgroup.add_members([@upleafs[0].id.to_s, @upleafs[1].id.to_s, @testmidgroup.id.to_s, @botleafs[0].id.to_s, @botleafs[1].id.to_s], 0)
    @testmidgroup.add_members([@midleafs[0].id.to_s, @midleafs[1].id.to_s], 0)
    @testterm = FactoryGirl.create(:term, project: @project, title: 'Test Note', taxonomy: 'Ink', description: 'This is a test', uri: 'https://www.test.com/', show: true, objects: {Group: [@testgroup.id.to_s], Leaf: [@botleafs[0].id.to_s], Recto: [@botleafs[0].rectoID], Verso: [@botleafs[0].versoID]})
  end

  it 'builds the right JSON' do
    result = buildJSON(@project)
    expect(result[:project]).to eq({
      title: 'Sample project',
      shelfmark: 'Ravenna 384.2339',
      notationStyle: 'r-v',
      metadata: { 'date' => '18th century' },
      preferences: { 'showTips' => true },
      manifests: { '12341234' => { 'id' => '12341234', 'url' => 'https://digital.library.villanova.edu/Item/vudl:99213/Manifest', 'name' => 'Boston, and Bunker Hill.' } },
      taxonomies: ['Ink', 'Unknown']
    })
    expect(result[:groups]).to eq({
      1 => {:params=>{:type=>"Quire", :title=>"Group 1", :nestLevel=>1}, :tacketed=>[], :sewing=>[], :parentOrder=>nil, :memberOrders=>["Leaf_1", "Leaf_2", "Group_2", "Leaf_5", "Leaf_6"]},
      2 => {:params=>{:type=>"Quire", :title=>"Group 2", :nestLevel=>2}, :tacketed=>[], :sewing=>[], :parentOrder=>1, :memberOrders=>["Leaf_3", "Leaf_4"]}
    })
    expect(result[:leafs]).to eq({
      1 => {:params=>{:folio_number=>"", :material=>"Paper", :type=>"Original", :attached_above=>"None", :attached_below=>"None", :stub=>"No", :nestLevel=>1}, :conjoined_leaf_order=>nil, :parentOrder=>1, :rectoOrder=>1, :versoOrder=>1},
      2 => {:params=>{:folio_number=>"", :material=>"Paper", :type=>"Original", :attached_above=>"None", :attached_below=>"None", :stub=>"No", :nestLevel=>1}, :conjoined_leaf_order=>nil, :parentOrder=>1, :rectoOrder=>2, :versoOrder=>2},
      3 => {:params=>{:folio_number=>"", :material=>"Paper", :type=>"Original", :attached_above=>"None", :attached_below=>"None", :stub=>"No", :nestLevel=>2}, :conjoined_leaf_order=>nil, :parentOrder=>2, :rectoOrder=>3, :versoOrder=>3},
      4 => {:params=>{:folio_number=>"", :material=>"Paper", :type=>"Original", :attached_above=>"None", :attached_below=>"None", :stub=>"No", :nestLevel=>2}, :conjoined_leaf_order=>nil, :parentOrder=>2, :rectoOrder=>4, :versoOrder=>4},
      5 => {:params=>{:folio_number=>"", :material=>"Paper", :type=>"Original", :attached_above=>"None", :attached_below=>"None", :stub=>"No", :nestLevel=>1}, :conjoined_leaf_order=>nil, :parentOrder=>1, :rectoOrder=>5, :versoOrder=>5},
      6 => {:params=>{:folio_number=>"", :material=>"Paper", :type=>"Endleaf", :attached_above=>"None", :attached_below=>"None", :stub=>"No", :nestLevel=>1}, :conjoined_leaf_order=>nil, :parentOrder=>1, :rectoOrder=>6, :versoOrder=>6}
    })
    expect(result[:rectos]).to eq({
      1 => {:params=>{:page_number=>"", :texture=>"None", :image=>{}, :script_direction=>"None"}, :parentOrder=>1},
      2 => {:params=>{:page_number=>"", :texture=>"None", :image=>{}, :script_direction=>"None"}, :parentOrder=>2},
      3 => {:params=>{:page_number=>"", :texture=>"None", :image=>{}, :script_direction=>"None"}, :parentOrder=>3},
      4 => {:params=>{:page_number=>"", :texture=>"None", :image=>{}, :script_direction=>"None"}, :parentOrder=>4},
      5 => {:params=>{:page_number=>"", :texture=>"None", :image=>{}, :script_direction=>"None"}, :parentOrder=>5},
      6 => {:params=>{:page_number=>"", :texture=>"None", :image=>{}, :script_direction=>"None"}, :parentOrder=>6}
    })
    expect(result[:versos]).to eq({
      1 => {:params=>{:page_number=>"", :texture=>"None", :image=>{}, :script_direction=>"None"}, :parentOrder=>1},
      2 => {:params=>{:page_number=>"", :texture=>"None", :image=>{}, :script_direction=>"None"}, :parentOrder=>2},
      3 => {:params=>{:page_number=>"", :texture=>"None", :image=>{}, :script_direction=>"None"}, :parentOrder=>3},
      4 => {:params=>{:page_number=>"", :texture=>"None", :image=>{}, :script_direction=>"None"}, :parentOrder=>4},
      5 => {:params=>{:page_number=>"", :texture=>"None", :image=>{}, :script_direction=>"None"}, :parentOrder=>5},
      6 => {:params=>{:page_number=>"", :texture=>"None", :image=>{}, :script_direction=>"None"}, :parentOrder=>6}
    })
    expect(result[:terms]).to eq({
      1 => {:params=>{:title=>"Test Note", :taxonomy=>"Ink", :description=>"This is a test", :uri=>"https://www.test.com/", :show=>true}, :objects=>{:Group=>[1], :Leaf=>[5], :Recto=>[5], :Verso=>[5]}}
    })
  end

  it 'builds the right XML' do
    result = Nokogiri::XML(buildDotModel(@project))
    # Metadata elements
    expect(result.css("textblock title").text).to eq 'Sample project'
    expect(result.css("textblock shelfmark").text).to eq 'Ravenna 384.2339'
    expect(result.css("textblock date").text).to eq '18th century'
    expect(result.css("taxonomy[xml|id='manuscript_preferences'] term").collect { |t| [t['xml:id'], t.text] }).to include(
      ['manuscript_preferences_ravenna_384_2339_showTips', 'true']
    )
    expect(result.css("taxonomy[xml|id='manifests'] term").collect { |t| [t['xml:id'], t.text] }).to include(
      ['manifest_12341234', 'https://digital.library.villanova.edu/Item/vudl:99213/Manifest']
    )
    # Quires
    expect(result.css("taxonomy[xml|id='group_type'] term").collect { |t| [t['xml:id'], t.text] }).to include(
      ['group_type_quire', 'Quire']
    )
    expect(result.css("taxonomy[xml|id='group_title'] term").collect { |t| [t['xml:id'], t.text] }).to include(
      ['group_title_group_1', 'Group 1'],
      ['group_title_group_2', 'Group 2'],
    )
    # first element should be a group, second element should be a string of all leaves in that group, separated by a space
    groups_and_members = result.css("taxonomy[xml|id='group_members'] term").collect { |t| [t['xml:id'], t.text] }
    groups_and_members.each do |gm|
      expect(gm[0]).to match /^group_members_Group/
      expect(gm[1]).to match /^#Leaf/
    end
    # Leaves
    expect(result.css("taxonomy[xml|id='leaf_material'] term").collect { |t| [t['xml:id'], t.text] }).to include(
      ['leaf_material_paper', 'Paper']
    )
    # Check that there are 6 rectos and 6 versos
    ns = {n: "http://schoenberginstitute.org/schema/collation"}
    expect(result.xpath("//n:mapping/n:map[@side='recto']", ns).size).to eq(6)
    expect(result.xpath("//n:mapping/n:map[@side='verso']", ns).size).to eq(6)
    # Check that the @target contains either Group or Leaf
    map_targets = result.xpath("//n:mapping/n:map[@target]/@target", ns)
    map_targets.each do |t|
      expect(t).to match /^#(Leaf|Group)/
    end
    # check that mapping/map/term/@target matches either Group or #side_page_number_EMPTY
    term_targets = result.xpath("//n:mapping/n:map/n:term[@target]/@target", ns)
    term_targets.each do |t|
      expect(t.to_s).to match /^\s?#(side_page_number_EMPTY|group)/
    end
  end
end

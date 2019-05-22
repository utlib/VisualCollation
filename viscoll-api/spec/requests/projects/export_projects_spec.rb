require 'rails_helper'

describe "GET /projects/:id/export/:format", :type => :request do
  before do
    stub_request(:get, 'https://digital.library.villanova.edu/Item/vudl:99213/Manifest').with(headers: { 'Accept' => '*/*', 'User-Agent' => 'Ruby' }).to_return(status: 200, body: File.read(File.dirname(__FILE__) + '/../../fixtures/villanova_boston.json'), headers: {})
    # Set up an account and allow sign-in
    @user = FactoryGirl.create(:user, {:password => "user"})
    put '/confirmation', params: {:confirmation_token => @user.confirmation_token}
    post '/session', params: {:session => { :email => @user.email, :password => "user" }}
    @authToken = JSON.parse(response.body)['session']['jwt']
    # Create project
    @project = FactoryGirl.create(:project,
      user: @user,
      'title' => 'Sample project',
      'shelfmark' => 'Ravenna 384.2339',
      'metadata' => { date: '18th century' },
      'preferences' => { 'showTips' => true },
      'noteTypes' => ['Ink', 'Unknown'],
      'manifests' => { '12341234': { 'id' => '12341234', 'url' => 'https://digital.library.villanova.edu/Item/vudl:99213/Manifest', 'name' => 'Boston, and Bunker Hill.' } }
    )
    # Attach group with 2 leafs - (group with 2 leafs) - 2 conjoined leafs, 1 image
    @testgroup = FactoryGirl.create(:group, project: @project, nestLevel: 1, title: 'Group 1')
    @upleafs = 2.times.collect { FactoryGirl.create(:leaf, project: @project, parentID: @testgroup.id.to_s, nestLevel: 1) }
    @testmidgroup = FactoryGirl.create(:group, project: @project, parentID: @testgroup.id.to_s, nestLevel: 2, title: 'Group 2')
    @midleafs = 2.times.collect { FactoryGirl.create(:leaf, project: @project, parentID: @testmidgroup.id.to_s, nestLevel: 2) }  
    @botleafs = 2.times.collect { FactoryGirl.create(:leaf, project: @project, parentID: @testgroup.id.to_s, nestLevel: 1) }
    @botleafs[1].update(type: 'Endleaf')
    @project.add_groupIDs([@testgroup.id.to_s, @testmidgroup.id.to_s], 0)
    @testgroup.add_members([@upleafs[0].id.to_s, @upleafs[1].id.to_s, @testmidgroup.id.to_s, @botleafs[0].id.to_s, @botleafs[1].id.to_s], 0)
    @testmidgroup.add_members([@midleafs[0].id.to_s, @midleafs[1].id.to_s], 0)
    @testnote = FactoryGirl.create(:note, project: @project, title: 'Test Note', type: 'Ink', description: 'This is a test', show: true, objects: {Group: [@testgroup.id.to_s], Leaf: [@botleafs[0].id.to_s], Recto: [@botleafs[0].rectoID], Verso: [@botleafs[0].versoID]})
    @testimage = FactoryGirl.create(:pixel, user: @user, projectIDs: [@project.id.to_s], sideIDs: [@upleafs[0].rectoID], filename: 'pixel.png')
    Side.find(@upleafs[0].rectoID).update(image: {
      manifestID: 'DIYImages',
      label: "Pixel",
      url: "https://dummy.library.utoronto.ca/images/#{@testimage.id}_pixel.png"
    })
  end
  
  before :each do
    @format = 'json'
  end
  
  before :all do
    imagePath = "#{Rails.root}/public/uploads"
    File.new(imagePath+'/pixel', 'w')
  end

  after :all do
    imagePath = "#{Rails.root}/public/uploads"
    if File.file?(imagePath+'/pixel')
      File.delete(imagePath+'/pixel')
    end
    Dir.glob(imagePath+'/*.zip').each { |file| File.delete(file) }
  end

  context 'with valid authorization' do
    context 'for JSON export' do
      before do
        @format = 'json'
        get "/projects/#{@project.id}/export/#{@format}", headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @body = JSON.parse(response.body)
      end
      
      it 'should return 200' do
        expect(response).to have_http_status(:ok)
      end
      
      it 'should have expected content' do
        export_result = @body['Export']
        image_result = @body['Images']
        expect(export_result['project']).to eq({
          'title' => 'Sample project',
          'shelfmark' => 'Ravenna 384.2339',
          'metadata' => { 'date' => '18th century' },
          'preferences' => { 'showTips' => true },
          'manifests' => { '12341234' => { 'id' => '12341234', 'url' => 'https://digital.library.villanova.edu/Item/vudl:99213/Manifest', 'name' => 'Boston, and Bunker Hill.' } },
          'noteTypes' => ['Ink', 'Unknown']
        })
        expect(export_result['Groups']).to eq({
          '1' => {'params'=>{'type'=>"Quire", 'title'=>"Group 1", 'nestLevel'=>1}, 'tacketed'=>[], 'sewing'=>[], 'parentOrder'=>nil, 'memberOrders'=>["Leaf_1", "Leaf_2", "Group_2", "Leaf_5", "Leaf_6"]},
          '2' => {'params'=>{'type'=>"Quire", 'title'=>"Group 2", 'nestLevel'=>2}, 'tacketed'=>[], 'sewing'=>[], 'parentOrder'=>1, 'memberOrders'=>["Leaf_3", "Leaf_4"]}
        })
        expect(export_result['Leafs']).to eq({
          '1' => {'params'=>{'material'=>"Paper", 'type'=>"Original", 'attached_above'=>"None", 'attached_below'=>"None", 'stub'=>"None", 'nestLevel'=>1}, 'conjoined_leaf_order'=>nil, 'parentOrder'=>1, 'rectoOrder'=>1, 'versoOrder'=>1},
          '2' => {'params'=>{'material'=>"Paper", 'type'=>"Original", 'attached_above'=>"None", 'attached_below'=>"None", 'stub'=>"None", 'nestLevel'=>1}, 'conjoined_leaf_order'=>nil, 'parentOrder'=>1, 'rectoOrder'=>2, 'versoOrder'=>2},
          '3' => {'params'=>{'material'=>"Paper", 'type'=>"Original", 'attached_above'=>"None", 'attached_below'=>"None", 'stub'=>"None", 'nestLevel'=>2}, 'conjoined_leaf_order'=>nil, 'parentOrder'=>2, 'rectoOrder'=>3, 'versoOrder'=>3},
          '4' => {'params'=>{'material'=>"Paper", 'type'=>"Original", 'attached_above'=>"None", 'attached_below'=>"None", 'stub'=>"None", 'nestLevel'=>2}, 'conjoined_leaf_order'=>nil, 'parentOrder'=>2, 'rectoOrder'=>4, 'versoOrder'=>4},
          '5' => {'params'=>{'material'=>"Paper", 'type'=>"Original", 'attached_above'=>"None", 'attached_below'=>"None", 'stub'=>"None", 'nestLevel'=>1}, 'conjoined_leaf_order'=>nil, 'parentOrder'=>1, 'rectoOrder'=>5, 'versoOrder'=>5},
          '6' => {'params'=>{'material'=>"Paper", 'type'=>"Endleaf", 'attached_above'=>"None", 'attached_below'=>"None", 'stub'=>"None", 'nestLevel'=>1}, 'conjoined_leaf_order'=>nil, 'parentOrder'=>1, 'rectoOrder'=>6, 'versoOrder'=>6}
        })
        expect(export_result['Rectos']).to eq({
          '1' => {'params'=>{'folio_number'=>"", 'page_number'=>"", 'texture'=>"None", 'image'=>{'manifestID' => 'DIYImages', 'label' => "Pixel", 'url' => "https://dummy.library.utoronto.ca/images/#{@testimage.id}_pixel.png"}, 'script_direction'=>"None"}, 'parentOrder'=>1},
          '2' => {'params'=>{'folio_number'=>"", 'page_number'=>"", 'texture'=>"None", 'image'=>{}, 'script_direction'=>"None"}, 'parentOrder'=>2},
          '3' => {'params'=>{'folio_number'=>"", 'page_number'=>"", 'texture'=>"None", 'image'=>{}, 'script_direction'=>"None"}, 'parentOrder'=>3},
          '4' => {'params'=>{'folio_number'=>"", 'page_number'=>"", 'texture'=>"None", 'image'=>{}, 'script_direction'=>"None"}, 'parentOrder'=>4},
          '5' => {'params'=>{'folio_number'=>"", 'page_number'=>"", 'texture'=>"None", 'image'=>{}, 'script_direction'=>"None"}, 'parentOrder'=>5},
          '6' => {'params'=>{'folio_number'=>"", 'page_number'=>"", 'texture'=>"None", 'image'=>{}, 'script_direction'=>"None"}, 'parentOrder'=>6}
        })
        expect(export_result['Versos']).to eq({
          '1' => {'params'=>{'folio_number'=>"", 'page_number'=>"", 'texture'=>"None", 'image'=>{}, 'script_direction'=>"None"}, 'parentOrder'=>1},
          '2' => {'params'=>{'folio_number'=>"", 'page_number'=>"", 'texture'=>"None", 'image'=>{}, 'script_direction'=>"None"}, 'parentOrder'=>2},
          '3' => {'params'=>{'folio_number'=>"", 'page_number'=>"", 'texture'=>"None", 'image'=>{}, 'script_direction'=>"None"}, 'parentOrder'=>3},
          '4' => {'params'=>{'folio_number'=>"", 'page_number'=>"", 'texture'=>"None", 'image'=>{}, 'script_direction'=>"None"}, 'parentOrder'=>4},
          '5' => {'params'=>{'folio_number'=>"", 'page_number'=>"", 'texture'=>"None", 'image'=>{}, 'script_direction'=>"None"}, 'parentOrder'=>5},
          '6' => {'params'=>{'folio_number'=>"", 'page_number'=>"", 'texture'=>"None", 'image'=>{}, 'script_direction'=>"None"}, 'parentOrder'=>6}
        })
        expect(export_result['Notes']).to eq({
          '1' => {'params'=>{'title'=>"Test Note", 'type'=>"Ink", 'description'=>"This is a test", 'show'=>true}, 'objects'=>{'Group'=>[1], 'Leaf'=>[5], 'Recto'=>[5], 'Verso'=>[5]}}
        })
        expect(image_result['exportedImages']).to eq("https://dummy.library.utoronto.ca/api/images/zip/#{@project.id}")
      end
    end
    
    context 'for XML export' do
      before do
        @format = 'xml'
        get "/projects/#{@project.id}/export/#{@format}", headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @body = JSON.parse(response.body)
      end
      
      it 'should return 200' do
        expect(response).to have_http_status(:ok)
      end
      
      it 'should have expected content' do
        expect(@body['type']).to eq 'xml'
        expect(@body['Images']['exportedImages']).to eq("https://dummy.library.utoronto.ca/api/images/zip/#{@project.id}")
        result = Nokogiri::XML(@body['data'])
        # Metadata elements
        expect(result.css("manuscript title").text).to eq 'Sample project'
        expect(result.css("manuscript shelfmark").text).to eq 'Ravenna 384.2339'
        expect(result.css("manuscript date").text).to eq '18th century'
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
        expect(result.css("taxonomy[xml|id='group_members'] term").collect { |t| [t['xml:id'], t.text] }).to include(
          ['group_members_ravenna_384_2339-q-1', '#ravenna_384_2339-1-1 #ravenna_384_2339-1-2 #ravenna_384_2339-q-1-2 #ravenna_384_2339-1-3 #ravenna_384_2339-1-4'],
          ['group_members_ravenna_384_2339-q-1-2', '#ravenna_384_2339-1-2-3 #ravenna_384_2339-1-2-4'],
        )
        # Leaves
        expect(result.css("taxonomy[xml|id='leaf_material'] term").collect { |t| [t['xml:id'], t.text] }).to include(
          ['leaf_material_paper', 'Paper']
        )
        expect(result.css("manuscript leaf").collect { |t| [t['xml:id'], t.css('folioNumber').first.text, t.css('q').first['target'], t.css('q').first['n']] }).to include(
          ['ravenna_384_2339-1-1', '1', '#ravenna_384_2339-q-1', '1'],
          ['ravenna_384_2339-1-2', '2', '#ravenna_384_2339-q-1', '1'],
          ['ravenna_384_2339-1-2-3', '3', '#ravenna_384_2339-q-1-2', '2'],
          ['ravenna_384_2339-1-2-4', '4', '#ravenna_384_2339-q-1-2', '2'],
          ['ravenna_384_2339-1-3', '5', '#ravenna_384_2339-q-1', '1'],
          ['ravenna_384_2339-1-4', '6', '#ravenna_384_2339-q-1', '1']
        )
        # Sides and Notes

        expect(result.css("mapping map").collect { |t| [t['target'], t['side'], t.css('term').first['target']]}).to include(
          ['#ravenna_384_2339-1-1', 'recto', '#side_page_number_EMPTY https://dummy.library.utoronto.ca/images/'+@testimage.id.to_s+'_pixel.png #manifest_DIYImages'],
          ['#ravenna_384_2339-1-2', 'recto', '#side_page_number_EMPTY'],
          ['#ravenna_384_2339-1-2-3', 'recto', '#side_page_number_EMPTY'],
          ['#ravenna_384_2339-1-2-4', 'recto', '#side_page_number_EMPTY'],
          ['#ravenna_384_2339-1-3', 'recto', '#side_page_number_EMPTY'],
          ['#ravenna_384_2339-1-4', 'recto', '#side_page_number_EMPTY'],
          ['#ravenna_384_2339-1-1', 'verso', '#side_page_number_EMPTY'],
          ['#ravenna_384_2339-1-2', 'verso', '#side_page_number_EMPTY'],
          ['#ravenna_384_2339-1-2-3', 'verso', '#side_page_number_EMPTY'],
          ['#ravenna_384_2339-1-2-4', 'verso', '#side_page_number_EMPTY'],
          ['#ravenna_384_2339-1-3', 'verso', '#side_page_number_EMPTY'],
          ['#ravenna_384_2339-1-4', 'verso', '#side_page_number_EMPTY']
        )
        expect(result.css("mapping map").collect { |t| [t['target'], t.css('term').first['target']]}).to include(
          ['#ravenna_384_2339-n-1', '#note_title_test_note #note_show'],
        )
      end
    end
    
    context 'with missing project' do
      before do
        get "/projects/#{@project.id}missing/export/#{@format}", headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @body = JSON.parse(response.body)
      end
      
      it 'should return 404' do
        expect(response).to have_http_status(:not_found)
      end
      
      it 'should show error' do
        expect(@body['error']).to eq "project not found with id #{@project.id}missing"
      end
    end
    
    context 'with unauthorized project' do
      before do
        @project.update(user: FactoryGirl.create(:user))
        get "/projects/#{@project.id}/export/#{@format}", headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
      end
      
      it 'should return 401' do
        expect(response).to have_http_status(:unauthorized)
      end
    end
    
    context 'with invalid format' do
      before do
        @format = 'waahoo'
        get "/projects/#{@project.id}/export/#{@format}", headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @body = JSON.parse(response.body)
      end
      
      it 'should return 422' do
        expect(response).to have_http_status(:unprocessable_entity)
      end
      
      it 'should show error' do
        expect(@body['error']).to eq "Export format must be one of [json, xml]"
      end
    end
  end
    
  context 'with corrupted authorization' do
    before do
      get "/projects/#{@project.id}/export/#{@format}", headers: {'Authorization' => @authToken+'asdf', 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
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
      get "/projects/#{@project.id}/export/#{@format}", headers: {'Authorization' => ""}
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
      get "/projects/#{@project.id}/export/#{@format}", headers: {'Authorization' => "123456789"}
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

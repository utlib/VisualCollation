require 'rails_helper'

describe "PUT /projects/:id/filter", :type => :request do
  before do
    @user = FactoryGirl.create(:user, {:password => "user"})
    @user2 = FactoryGirl.create(:user, {:password => "user2"})
    @project1 = FactoryGirl.create(:codex_project, :user => @user, :quire_structure => [[4, 6]])
    @project2 = FactoryGirl.create(:codex_project, :user => @user2, :quire_structure => [[4, 6]])
    put '/confirmation', params: {:confirmation_token => @user.confirmation_token}
    post '/session', params: {:session => { :email => @user.email, :password => "user" }}
    @authToken = JSON.parse(response.body)['session']['jwt']
  end
  
  before :each do
    @parameters = {
      "queries": [
        {
        }
      ]
    }
  end
  
  it 'should be sane' do
    expect(@project1.groups.count).to eq 4
    expect(@project1.groups.collect { |g| g.id }.count).to eq 4
  end

  context 'with correct authorization' do
    context 'and group-based queries' do
      context 'equals one' do
        before do
          @parameters = {
            "queries": [
              {
                "type": "group",
                "attribute": "title",
                "condition": "equals",
                "values": [ @project1.groups[0].title ]
              }
            ]
          }
          put "/projects/#{@project1.id}/filter", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        end
        
        it 'returns 200' do
          expect(response).to have_http_status(:ok)
        end
        
        it 'contains the expected entries' do
          body = JSON.parse(response.body)
          expect(body['Groups']).to include(@project1.groups[0].id.to_s)
          expect(body['Groups']).not_to include(@project2.groups[0].id.to_s)
        end
      end
      
      context 'equals multiple' do
        before do
          @parameters = {
            "queries": [
              {
                "type": "group",
                "attribute": "title",
                "condition": "equals",
                "values": [ @project1.groups[0].title, @project2.groups[0].title ]
              }
            ]
          }
          put "/projects/#{@project1.id}/filter", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        end
        
        it 'returns 200' do
          expect(response).to have_http_status(:ok)
        end
        
        it 'contains the expected entries' do
          body = JSON.parse(response.body)
          expect(body['Groups']).to include(@project1.groups[0].id.to_s)
          expect(body['Groups']).not_to include(@project2.groups[0].id.to_s)
        end
      end
      
      context 'contains one' do
        before do
          @parameters = {
            "queries": [
              {
                "type": "group",
                "attribute": "title",
                "condition": "contains",
                "values": [ @project1.groups[0].title ]
              }
            ]
          }
          put "/projects/#{@project1.id}/filter", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        end
        
        it 'returns 200' do
          expect(response).to have_http_status(:ok)
        end
        
        it 'contains the expected entries' do
          body = JSON.parse(response.body)
          expect(body['Groups']).to include(@project1.groups[0].id.to_s)
          expect(body['Groups']).not_to include(@project2.groups[0].id.to_s)
        end
      end
      
      context 'contains multiple' do
        before do
          @parameters = {
            "queries": [
              {
                "type": "group",
                "attribute": "title",
                "condition": "contains",
                "values": [ @project1.groups[0].title, @project2.groups[0].title ]
              }
            ]
          }
          put "/projects/#{@project1.id}/filter", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        end
        
        it 'returns 200' do
          expect(response).to have_http_status(:ok)
        end
        
        it 'contains the expected entries' do
          body = JSON.parse(response.body)
          expect(body['Groups']).to include(@project1.groups[0].id.to_s)
          expect(body['Groups']).not_to include(@project2.groups[0].id.to_s)
        end
      end
      
      context 'not equals one' do
        before do
          @parameters = {
            "queries": [
              {
                "type": "group",
                "attribute": "title",
                "condition": "not equals",
                "values": [ @project1.groups[0].title ]
              }
            ]
          }
          put "/projects/#{@project1.id}/filter", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        end
        
        it 'returns 200' do
          expect(response).to have_http_status(:ok)
        end
        
        it 'contains the expected entries' do
          body = JSON.parse(response.body)
          expect(body['Groups']).not_to include(@project1.groups[0].id.to_s)
          @project1.groups[1..-1].each do |should_have_group|
            expect(body['Groups']).to include(should_have_group.id.to_s)
          end
        end
      end
      
      context 'not equals multiple' do
        before do
          @parameters = {
            "queries": [
              {
                "type": "group",
                "attribute": "title",
                "condition": "not equals",
                "values": [ @project1.groups[0].title, @project1.groups[1].title ]
              }
            ]
          }
          put "/projects/#{@project1.id}/filter", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        end
        
        it 'returns 200' do
          expect(response).to have_http_status(:ok)
        end
        
        it 'contains the expected entries' do
          body = JSON.parse(response.body)
          expect(body['Groups']).not_to include(@project1.groups[0].id.to_s)
          expect(body['Groups']).not_to include(@project1.groups[1].id.to_s)
          @project1.groups[2..-1].each do |should_have_group|
            expect(body['Groups']).to include(should_have_group.id.to_s)
          end
        end
      end
      
      context 'not contains one' do
        before do
          @parameters = {
            "queries": [
              {
                "type": "group",
                "attribute": "title",
                "condition": "not contains",
                "values": [ @project1.groups[0].title ]
              }
            ]
          }
          put "/projects/#{@project1.id}/filter", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        end
        
        it 'returns 200' do
          expect(response).to have_http_status(:ok)
        end
        
        it 'contains the expected entries' do
          body = JSON.parse(response.body)
          expect(body['Groups']).not_to include(@project1.groups[0].id.to_s)
          @project1.groups[1..-1].each do |should_have_group|
            expect(body['Groups']).to include(should_have_group.id.to_s)
          end
        end
      end
      
      context 'not contains multiple' do
        before do
          @parameters = {
            "queries": [
              {
                "type": "group",
                "attribute": "title",
                "condition": "not contains",
                "values": [ @project1.groups[0].title, @project1.groups[1].title ]
              }
            ]
          }
          put "/projects/#{@project1.id}/filter", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        end
        
        it 'returns 200' do
          expect(response).to have_http_status(:ok)
        end
        
        it 'contains the expected entries' do
          body = JSON.parse(response.body)
          expect(body['Groups']).not_to include(@project1.groups[0].id.to_s)
          expect(body['Groups']).not_to include(@project1.groups[1].id.to_s)
          @project1.groups[2..-1].each do |should_have_group|
            expect(body['Groups']).to include(should_have_group.id.to_s)
          end
        end
      end
    end
    
    context 'and leaf-based queries' do
      context 'equals one' do
        before do
          @project1.leafs[5].update(material: 'Copy paper')
          @project2.leafs[5].update(material: 'Copy paper')
          @parameters = {
            "queries": [
              {
                "type": "leaf",
                "attribute": "material",
                "condition": "equals",
                "values": [ 'Copy paper' ]
              }
            ]
          }
          put "/projects/#{@project1.id}/filter", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        end
        
        it 'returns 200' do
          expect(response).to have_http_status(:ok)
        end
        
        it 'contains the expected entries' do
          body = JSON.parse(response.body)
          expect(body['Leafs']).to eq [@project1.leafs[5].id.to_s]
        end
      end
      
      context 'equals multiple' do
        before do
          @project1.leafs[5].update(material: 'Copy paper')
          @project1.leafs[13].update(material: 'Copy paper')
          @project1.leafs[16].update(material: 'Plastic')
          @project2.leafs[5].update(material: 'Copy paper')
          @project2.leafs[13].update(material: 'Copy paper')
          @project2.leafs[16].update(material: 'Plastic')
          @parameters = {
            "queries": [
              {
                "type": "leaf",
                "attribute": "material",
                "condition": "equals",
                "values": [ 'Copy paper', 'Plastic' ]
              }
            ]
          }
          put "/projects/#{@project1.id}/filter", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        end
        
        it 'returns 200' do
          expect(response).to have_http_status(:ok)
        end
        
        it 'contains the expected entries' do
          body = JSON.parse(response.body)
          expect(body['Leafs'].length).to eq 3
          expect(body['Leafs']).to include(@project1.leafs[5].id.to_s)
          expect(body['Leafs']).to include(@project1.leafs[13].id.to_s)
          expect(body['Leafs']).to include(@project1.leafs[16].id.to_s)
        end
      end
      
      context 'not equals one' do
        before do
          @project1.leafs[5].update(material: 'Copy paper')
          @project2.leafs[5].update(material: 'Copy paper')
          @parameters = {
            "queries": [
              {
                "type": "leaf",
                "attribute": "material",
                "condition": "not equals",
                "values": [ 'Copy paper' ]
              }
            ]
          }
          put "/projects/#{@project1.id}/filter", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        end
        
        it 'returns 200' do
          expect(response).to have_http_status(:ok)
        end
        
        it 'contains the expected entries' do
          body = JSON.parse(response.body)
          expect(body['Leafs'].count).to eq @project1.leafs.count-1
          expect(body['Leafs']).not_to include(@project1.leafs[5].id.to_s)
          expect(body['Leafs']).not_to include(@project2.leafs[5].id.to_s)
        end
      end
      
      context 'not equals multiple' do
        before do
          @project1.leafs[5].update(material: 'Copy paper')
          @project1.leafs[13].update(material: 'Copy paper')
          @project1.leafs[16].update(material: 'Plastic')
          @project2.leafs[5].update(material: 'Copy paper')
          @project2.leafs[13].update(material: 'Copy paper')
          @project2.leafs[16].update(material: 'Plastic')
          @parameters = {
            "queries": [
              {
                "type": "leaf",
                "attribute": "material",
                "condition": "not equals",
                "values": [ 'Copy paper', 'Plastic' ]
              }
            ]
          }
          put "/projects/#{@project1.id}/filter", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        end
        
        it 'returns 200' do
          expect(response).to have_http_status(:ok)
        end
        
        it 'contains the expected entries' do
          body = JSON.parse(response.body)
          expect(body['Leafs'].count).to eq @project1.leafs.count-3
          expect(body['Leafs']).not_to include(@project1.leafs[5].id.to_s)
          expect(body['Leafs']).not_to include(@project1.leafs[13].id.to_s)
          expect(body['Leafs']).not_to include(@project1.leafs[16].id.to_s)
          expect(body['Leafs']).not_to include(@project2.leafs[5].id.to_s)
          expect(body['Leafs']).not_to include(@project2.leafs[13].id.to_s)
          expect(body['Leafs']).not_to include(@project2.leafs[16].id.to_s)
        end
      end
      
      context 'with legacy conjoined_leaf_order attribute' do
        before do
          @parameters = {
            "queries": [
              {
                "type": "leaf",
                "attribute": "conjoined_leaf_order",
                "condition": "equals",
                "values": [ @project1.leafs[-1].conjoined_to ]
              }
            ]
          }
          put "/projects/#{@project1.id}/filter", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        end
        
        it 'returns 200' do
          expect(response).to have_http_status(:ok)
        end
        
        it 'contains the expected entries' do
          body = JSON.parse(response.body)
          expect(body['Leafs']).to eq [@project1.leafs[-1].id.to_s]
        end
      end
    end
    
    context 'and side-based queries' do
      context 'equals one' do
        before do
          @project1.sides[7].update(script_direction: 'Top-To-Bottom')
          @project2.sides[7].update(script_direction: 'Top-To-Bottom')
          @parameters = {
            "queries": [
              {
                "type": "side",
                "attribute": "script_direction",
                "condition": "equals",
                "values": [ 'Top-To-Bottom' ]
              }
            ]
          }
          put "/projects/#{@project1.id}/filter", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        end
        
        it 'returns 200' do
          expect(response).to have_http_status(:ok)
        end
        
        it 'contains the expected entries' do
          body = JSON.parse(response.body)
          expect(body['Sides']).to eq [@project1.sides[7].id.to_s]
        end
      end
      
      context 'equals multiple' do
        before do
          @project1.sides[7].update(script_direction: 'Top-To-Bottom')
          @project1.sides[10].update(script_direction: 'Left-To-Right')
          @project2.sides[7].update(script_direction: 'Top-To-Bottom')
          @parameters = {
            "queries": [
              {
                "type": "side",
                "attribute": "script_direction",
                "condition": "equals",
                "values": [ 'Top-To-Bottom', 'Left-To-Right' ]
              }
            ]
          }
          put "/projects/#{@project1.id}/filter", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        end
        
        it 'returns 200' do
          expect(response).to have_http_status(:ok)
        end
        
        it 'contains the expected entries' do
          body = JSON.parse(response.body)
          expect(body['Sides'].count).to eq 2
          expect(body['Sides']).to include @project1.sides[7].id.to_s
          expect(body['Sides']).to include @project1.sides[10].id.to_s
        end
      end
      
      context 'not equals one' do
        before do
          @project1.sides[7].update(script_direction: 'Top-To-Bottom')
          @project2.sides[7].update(script_direction: 'Top-To-Bottom')
          @parameters = {
            "queries": [
              {
                "type": "side",
                "attribute": "script_direction",
                "condition": "not equals",
                "values": [ 'Top-To-Bottom' ]
              }
            ]
          }
          put "/projects/#{@project1.id}/filter", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        end
        
        it 'returns 200' do
          expect(response).to have_http_status(:ok)
        end
        
        it 'contains the expected entries' do
          body = JSON.parse(response.body)
          expect(body['Sides'].count).to eq @project1.sides.count-1
          expect(body['Sides']).not_to include @project1.sides[7].id.to_s
        end
      end
      
      context 'not equals multiple' do
        before do
          @project1.sides[7].update(script_direction: 'Top-To-Bottom')
          @project1.sides[10].update(script_direction: 'Left-To-Right')
          @project2.sides[7].update(script_direction: 'Top-To-Bottom')
          @parameters = {
            "queries": [
              {
                "type": "side",
                "attribute": "script_direction",
                "condition": "not equals",
                "values": [ 'Top-To-Bottom', 'Left-To-Right' ]
              }
            ]
          }
          put "/projects/#{@project1.id}/filter", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        end
        
        it 'returns 200' do
          expect(response).to have_http_status(:ok)
        end
        
        it 'contains the expected entries' do
          body = JSON.parse(response.body)
          expect(body['Sides'].count).to eq @project1.sides.count-2
          expect(body['Sides']).not_to include @project1.sides[7].id.to_s
          expect(body['Sides']).not_to include @project1.sides[10].id.to_s
        end
      end
      
      context 'contains one' do
        before do
          @project1.sides[9].update(page_number: 'PN0')
          @parameters = {
            "queries": [
              {
                "type": "side",
                "attribute": "page_number",
                "condition": "contains",
                "values": [ 'PN' ]
              }
            ]
          }
          put "/projects/#{@project1.id}/filter", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        end
        
        it 'returns 200' do
          expect(response).to have_http_status(:ok)
        end
        
        it 'contains the expected entries' do
          body = JSON.parse(response.body)
          expect(body['Sides']).to eq [@project1.sides[9].id.to_s]
        end
      end
      
      context 'contains multiple' do
        before do
          @project1.sides[6].update(page_number: 'PN0')
          @project1.sides[11].update(page_number: 'QR1')
          @project2.sides[7].update(page_number: 'PN0')
          @parameters = {
            "queries": [
              {
                "type": "side",
                "attribute": "page_number",
                "condition": "contains",
                "values": [ 'PN', 'QR' ]
              }
            ]
          }
          put "/projects/#{@project1.id}/filter", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        end
        
        it 'returns 200' do
          expect(response).to have_http_status(:ok)
        end
        
        it 'contains the expected entries' do
          body = JSON.parse(response.body)
          expect(body['Sides'].count).to eq 2
          expect(body['Sides']).to include @project1.sides[6].id.to_s
          expect(body['Sides']).to include @project1.sides[11].id.to_s
        end
      end
      
      context 'not contains one' do
        before do
          @project1.sides[9].update(page_number: 'PN0')
          @parameters = {
            "queries": [
              {
                "type": "side",
                "attribute": "page_number",
                "condition": "not contains",
                "values": [ 'PN' ]
              }
            ]
          }
          put "/projects/#{@project1.id}/filter", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        end
        
        it 'returns 200' do
          expect(response).to have_http_status(:ok)
        end
        
        it 'contains the expected entries' do
          body = JSON.parse(response.body)
          expect(body['Sides'].count).to eq @project1.sides.count-1
          expect(body['Sides']).not_to include @project1.sides[9].id.to_s
        end
      end
      
      context 'not contains multiple' do
        before do
          @project1.sides[6].update(page_number: 'PN0')
          @project1.sides[11].update(page_number: 'QR1')
          @project2.sides[7].update(page_number: 'PN0')
          @parameters = {
            "queries": [
              {
                "type": "side",
                "attribute": "page_number",
                "condition": "not contains",
                "values": [ 'PN', 'QR' ]
              }
            ]
          }
          put "/projects/#{@project1.id}/filter", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        end
        
        it 'returns 200' do
          expect(response).to have_http_status(:ok)
        end
        
        it 'contains the expected entries' do
          body = JSON.parse(response.body)
          expect(body['Sides'].count).to eq @project1.sides.count-2
          expect(body['Sides']).not_to include @project1.sides[6].id.to_s
          expect(body['Sides']).not_to include @project1.sides[11].id.to_s
          expect(body['Sides']).not_to include @project2.sides[7].id.to_s
        end
      end
    end
    
    context 'and note-based queries' do
      before do
        @note1 = FactoryGirl.create(:note, project_id: @project1.id, attachments: [@project1.groups[1], @project1.leafs[5], @project1.sides[14], @project1.sides[15]], title: "ULTRA WAAHOO")
        @note2 = FactoryGirl.create(:note, project_id: @project1.id, attachments: [@project1.groups[2], @project1.leafs[7], @project1.sides[2], @project1.sides[3]], title: "XTREME FOOBAR")
        @note3 = FactoryGirl.create(:note, project_id: @project1.id, attachments: [@project1.groups[3], @project1.leafs[3], @project1.sides[10], @project1.sides[11]], title: "CREEPY WAAHOO")
        @notebad = FactoryGirl.create(:note, project_id: @project2.id, attachments: [@project2.groups[1], @project2.leafs[5], @project2.sides[14], @project2.sides[15]], title: "ULTRA WAAHOO")
      end
      
      context "equals one" do
        before do
          @parameters = {
            "queries": [
              {
                "type": "note",
                "attribute": "title",
                "condition": "equals",
                "values": [ 'ULTRA WAAHOO' ]
              }
            ]
          }
          put "/projects/#{@project1.id}/filter", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        end
        
        it 'returns 200' do
          expect(response).to have_http_status(:ok)
        end
        
        it 'contains the expected entries' do
          body = JSON.parse(response.body)
          expect(body['Notes']).to eq [@note1.id.to_s]
        end
      end
      
      context "equals multiple" do
        before do
          @parameters = {
            "queries": [
              {
                "type": "note",
                "attribute": "title",
                "condition": "equals",
                "values": [ 'CREEPY WAAHOO', 'XTREME FOOBAR' ]
              }
            ]
          }
          put "/projects/#{@project1.id}/filter", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        end
        
        it 'returns 200' do
          expect(response).to have_http_status(:ok)
        end
        
        it 'contains the expected entries' do
          body = JSON.parse(response.body)
          expect(body['Notes'].count).to eq 2
          expect(body['Notes']).to include @note2.id.to_s
          expect(body['Notes']).to include @note3.id.to_s
        end
      end
      
      context "not equals one" do
        before do
          @parameters = {
            "queries": [
              {
                "type": "note",
                "attribute": "title",
                "condition": "not equals",
                "values": [ 'ULTRA WAAHOO' ]
              }
            ]
          }
          put "/projects/#{@project1.id}/filter", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        end
        
        it 'returns 200' do
          expect(response).to have_http_status(:ok)
        end
        
        it 'contains the expected entries' do
          body = JSON.parse(response.body)
          expect(body['Notes'].count).to eq @project1.notes.count-1
          expect(body['Notes']).not_to include @note1.id.to_s
          expect(body['Notes']).not_to include @notebad.id.to_s
        end
      end
      
      context "not equals multiple" do
        before do
          @parameters = {
            "queries": [
              {
                "type": "note",
                "attribute": "title",
                "condition": "not equals",
                "values": [ 'ULTRA WAAHOO', 'CREEPY WAAHOO' ]
              }
            ]
          }
          put "/projects/#{@project1.id}/filter", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        end
        
        it 'returns 200' do
          expect(response).to have_http_status(:ok)
        end
        
        it 'contains the expected entries' do
          body = JSON.parse(response.body)
          expect(body['Notes'].count).to eq @project1.notes.count-2
          expect(body['Notes']).not_to include @note1.id.to_s
          expect(body['Notes']).not_to include @note3.id.to_s
          expect(body['Notes']).not_to include @notebad.id.to_s
        end
      end
      
      context "contains one" do
        before do
          @parameters = {
            "queries": [
              {
                "type": "note",
                "attribute": "title",
                "condition": "contains",
                "values": [ 'ULTRA' ]
              }
            ]
          }
          put "/projects/#{@project1.id}/filter", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        end
        
        it 'returns 200' do
          expect(response).to have_http_status(:ok)
        end
        
        it 'contains the expected entries' do
          body = JSON.parse(response.body)
          expect(body['Notes']).to eq [@note1.id.to_s]
        end
      end
      
      context "contains multiple" do
        before do
          @parameters = {
            "queries": [
              {
                "type": "note",
                "attribute": "title",
                "condition": "contains",
                "values": [ 'CREEPY', 'XTREME' ]
              }
            ]
          }
          put "/projects/#{@project1.id}/filter", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        end
        
        it 'returns 200' do
          expect(response).to have_http_status(:ok)
        end
        
        it 'contains the expected entries' do
          body = JSON.parse(response.body)
          expect(body['Notes'].count).to eq 2
          expect(body['Notes']).to include @note2.id.to_s
          expect(body['Notes']).to include @note3.id.to_s
        end
      end
      
      context "not contains one" do
        before do
          @parameters = {
            "queries": [
              {
                "type": "note",
                "attribute": "title",
                "condition": "not contains",
                "values": [ 'ULTRA' ]
              }
            ]
          }
          put "/projects/#{@project1.id}/filter", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        end
        
        it 'returns 200' do
          expect(response).to have_http_status(:ok)
        end
        
        it 'contains the expected entries' do
          body = JSON.parse(response.body)
          expect(body['Notes'].count).to eq @project1.notes.count-1
          expect(body['Notes']).not_to include @note1.id.to_s
        end
      end
      
      context "not contains multiple" do
        before do
          @parameters = {
            "queries": [
              {
                "type": "note",
                "attribute": "title",
                "condition": "not contains",
                "values": [ 'CREEPY', 'XTREME' ]
              }
            ]
          }
          put "/projects/#{@project1.id}/filter", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        end
        
        it 'returns 200' do
          expect(response).to have_http_status(:ok)
        end
        
        it 'contains the expected entries' do
          body = JSON.parse(response.body)
          expect(body['Notes'].count).to eq @project1.notes.count-2
          expect(body['Notes']).not_to include @note2.id.to_s
          expect(body['Notes']).not_to include @note3.id.to_s
        end
      end
    end
    
    context 'and compound conditions' do
      context 'using AND' do
        before do
          @parameters = {
            "queries": [
              {
                "type": "group",
                "attribute": "title",
                "condition": "contains",
                "values": [ 'Quire' ],
                "conjunction": "AND"
              },
              {
                "type": "group",
                "attribute": "title",
                "condition": "contains",
                "values": [ @project1.groups[0].title[5..-1] ]
              }
            ]
          }
          put "/projects/#{@project1.id}/filter", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        end
        
        it 'returns 200' do
          expect(response).to have_http_status(:ok)
        end
        
        it 'contains the expected entries' do
          body = JSON.parse(response.body)
          expect(body['Groups']).to include(@project1.groups[0].id.to_s)
          expect(body['Groups']).not_to include(@project2.groups[0].id.to_s)
        end
      end
      
      context 'using OR' do
        before do
          @parameters = {
            "queries": [
              {
                "type": "group",
                "attribute": "title",
                "condition": "contains",
                "values": [ 'Quire' ],
                "conjunction": "OR"
              },
              {
                "type": "group",
                "attribute": "title",
                "condition": "contains",
                "values": [ 'asdf' ],
                "conjunction": "OR"
              },
              {
                "type": "group",
                "attribute": "title",
                "condition": "contains",
                "values": [ '4' ]
              },
            ]
          }
          put "/projects/#{@project1.id}/filter", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        end
        
        it 'returns 200' do
          expect(response).to have_http_status(:ok)
        end
        
        it 'contains the expected entries' do
          body = JSON.parse(response.body)
          expect(body['Groups'].count).to eq @project1.groups.count
          @project1.groups.each do |grp|
            expect(body['Groups']).to include grp.id.to_s
          end
        end
      end
    end

    context 'and inexistent params' do
      before do
        @parameters = {
          "queries": []
        }
        put "/projects/#{@project1.id}/filter", params: @parameters.to_json, headers: {'Authorization' => @authToken}
      end

      it 'returns 422' do
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context 'and missing project' do
      before do
        put "/projects/#{@project1.id}missing/filter", params: @parameters.to_json, headers: {'Authorization' => @authToken}
      end
    
      it 'returns 404' do
        expect(response).to have_http_status(:not_found)
      end
    end

    context 'and unauthorized params' do
      before do
        put "/projects/#{@project2.id}/filter", params: @parameters.to_json, headers: {'Authorization' => @authToken}
      end
    
      it 'returns 401' do
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  context 'with corrupted authorization' do
    before do
      put "/projects/#{@project1.id}/filter", params: @parameters.to_json, headers: {'Authorization' => @authToken+"invalid"}
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
      put "/projects/#{@project1.id}/filter", params: @parameters.to_json, headers: {'Authorization' => ""}
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
      put "/projects/#{@project1.id}/filter", params: @parameters.to_json, headers: {'Authorization' => "123456789"}
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
      put "/projects/#{@project1.id}/filter"
    end

    it 'returns an unauthorized action error' do
      expect(response).to have_http_status(:unauthorized)
    end
  end
end

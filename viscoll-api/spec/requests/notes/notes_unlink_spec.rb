require 'rails_helper'

describe "PUT /notes/id/unlink", :type => :request do
  before do
    @user = FactoryGirl.create(:user, {:password => "user"})
    put '/confirmation', params: {:confirmation_token => @user.confirmation_token}
    post '/session', params: {:session => { :email => @user.email, :password => "user" }}
    @authToken = JSON.parse(response.body)['session']['jwt']
  end

  before :each do
    @project = FactoryGirl.create(:project, {user: @user, noteTypes: ["Ink"]})
    @defaultGroup = FactoryGirl.create(:quire, project: @project)
    @project.add_groupIDs([@defaultGroup.id.to_s], 0)
    @note = FactoryGirl.create(:note, {
      project: @project,
      title: "some title for note",
      type: "Ink",
      description: "blue ink"
    })
    @parameters = {
      objects: [
        {
          id: "something",
          type: "Group"
        }
      ]
    }
  end

  context 'with valid authorization' do
    context 'and correct group target' do
      before do
        @group = FactoryGirl.create(:group, { project: @project, notes: [@note] })
        @project.add_groupIDs([@group.id.to_s], 0)
        @parameters = {
          objects: [
            {
              id: @group.id.to_str,
              type: "Group"
            }
          ]
        }
        put '/notes/'+@note.id+'/unlink', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @group.reload
      end

      it 'should return 200' do
        expect(response).to have_http_status(:ok)
      end

      it 'should remove the note from the target' do
        expect(@group.notes).to be_empty
      end
    end
    context 'and correct leaf target' do
      before do
        @leaf = FactoryGirl.create(:leaf, { project: @project, notes: [@note] })
        @defaultGroup.add_members([@leaf.id.to_s], 1)
        @parameters = {
          objects: [
            {
              id: @leaf.id.to_str,
              type: "Leaf"
            }
          ]
        }
        put '/notes/'+@note.id+'/unlink', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @leaf.reload
      end

      it 'should return 200' do
        expect(response).to have_http_status(:ok)
      end

      it 'should remove the note from the target' do
        expect(@leaf.notes).to be_empty
      end
    end
    context 'and correct side target' do
      before do
        @leaf = FactoryGirl.create(:leaf, { project: @project, notes: [@note] })
        @defaultGroup.add_members([@leaf.id.to_s], 1)
        @side = @project.sides.find(@leaf.rectoID)
        @side.notes << @note
        @side.save
        @parameters = {
          objects: [
            {
              id: @side.id.to_str,
              type: "Recto"
            }
          ]
        }
        put '/notes/'+@note.id+'/unlink', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @side.reload
      end

      it 'should return 200' do
        expect(response).to have_http_status(:ok)
      end

      it 'should remove the note from the target' do
        expect(@side.notes).to be_empty
      end
    end
    context 'and a project belonging to another user' do
      before :each do
        @user2 = FactoryGirl.create(:user)
        @project2 = FactoryGirl.create(:project, { user: @user2, noteTypes: ["Ink"] })
      end
      context 'and group target' do
        before do
          @group2 = FactoryGirl.create(:group, { project: @project2 })
          @parameters2 = {
            objects: [
              {
                id: @group2.id.to_str,
                type: "Group"
              }
            ]
          }
          put '/notes/'+@note.id+'/unlink', params: @parameters2.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
          @group2.reload
        end

        it 'should return 401' do
          expect(response).to have_http_status(:unauthorized)
        end

        it 'should leave the group alone' do
          expect(@group2.notes).to be_empty
        end
      end
      context 'and a leaf target' do
        before do
          @leaf2 = FactoryGirl.create(:leaf, { project: @project2 })
          @defaultGroup.add_members([@leaf2.id.to_s], 1)
          @parameters2 = {
            objects: [
              {
                id: @leaf2.id.to_str,
                type: "Leaf"
              }
            ]
          }
          put '/notes/'+@note.id+'/unlink', params: @parameters2.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
          @leaf2.reload
        end

        it 'should return 401' do
          expect(response).to have_http_status(:unauthorized)
        end

        it 'should leave the leaf alone' do
          expect(@leaf2.notes).to be_empty
        end
      end
      context 'and a side target' do
        before do
          @side2 = FactoryGirl.create(:side, { project: @project2 })
          @parameters2 = {
            objects: [
              {
                id: @side2.id.to_str,
                type: "Recto"
              }
            ]
          }
          put '/notes/'+@note.id+'/unlink', params: @parameters2.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
          @side2.reload
        end

        it 'should return 401' do
          expect(response).to have_http_status(:unauthorized)
        end

        it 'should leave the side alone' do
          expect(@side2.notes).to be_empty
        end
      end
    end
    context 'and unknown target type' do
      before do
        @parameters[:objects][0][:type] = "unknown"
        put '/notes/'+@note.id+'/unlink', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @body = JSON.parse(response.body)
      end

      it 'should return 422' do
        expect(response).to have_http_status :unprocessable_entity
      end

      it 'should give the right error message' do
        expect(@body['type']).to eq "object not found with type unknown"
      end
    end
    context 'and missing note' do
      before do
        put '/notes/'+@note.id+'missing/unlink', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @body = JSON.parse(response.body)
      end

      it 'should return 404' do
        expect(response).to have_http_status :not_found
      end
    end
    context 'and missing target' do
      before do
        @group = FactoryGirl.create(:group, { project: @project })
        @parameters = {
          objects: [
            {
              id: @group.id.to_str+"weird",
              type: "Group"
            }
          ]
        }
        put '/notes/'+@note.id+'/unlink', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @group.reload
        @body = JSON.parse(response.body)
      end

      it 'should return 422' do
        expect(response).to have_http_status :unprocessable_entity
      end

      it 'should give the right error message' do
        expect(@body['id']).to eq "Group object not found with id #{@group.id.to_str}weird"
      end
    end
    context 'and uncaught exception' do
      before do
        allow_any_instance_of(Note).to receive(:save).and_raise("Exception!")
        @group = FactoryGirl.create(:group, { project: @project })
        @parameters = {
          objects: [
            {
              id: @group.id.to_str,
              type: "Group"
            }
          ]
        }
        put '/notes/'+@note.id+'/unlink', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @group.reload
        @body = JSON.parse(response.body)
      end

      it 'should return 422' do
        expect(response).to have_http_status :unprocessable_entity
      end
    end
  end

  context 'with corrupted authorization' do
    before do
      put '/notes/'+@note.id+'/unlink', params: @parameters.to_json, headers: {'Authorization' => @authToken+'asdf', 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
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
      put '/notes/'+@note.id+'/unlink', params: @parameters.to_json, headers: {'Authorization' => ""}
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
      put '/notes/'+@note.id+'/unlink', params: @parameters.to_json, headers: {'Authorization' => "123456789"}
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
      put '/notes/'+@note.id+'/unlink'
    end

    it 'returns an unauthorized action error' do
      expect(response).to have_http_status(:unauthorized)
    end
  end
end

require 'rails_helper'

describe "DELETE /groups", :type => :request do
  before do
    @user = FactoryGirl.create(:user, {:password => "user"})
    put '/confirmation', params: {:confirmation_token => @user.confirmation_token}
    post '/session', params: {:session => { :email => @user.email, :password => "user" }}
    @authToken = JSON.parse(response.body)['session']['jwt']
  end

  before :each do
    @project = FactoryGirl.create(:project, {
      user: @user,
      noteTypes: ["Ink"],
    })
    groupIDs = []
    5.times do |n|
      group = (FactoryGirl.create(:quire, { 
        project: @project, 
        title: "QUIRE #{n+1}"
      }))
      groupIDs.push(group.id.to_s)
    end
    @project.add_groupIDs(groupIDs, 0)
    @project.save
    @parameters = {
      projectID: @project.id.to_s,
      groups: [
          @project.groups[1].id.to_str,
          @project.groups[2].id.to_str,
      ],
    }
  end
  
  context 'with valid authorization' do
    context 'and standard group specs' do
      before do
        delete '/groups', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @project.reload
        @body = JSON.parse(response.body)
      end

      it 'returns 200' do
        expect(response).to have_http_status(:ok)
      end

      it 'deletes only the specified groups' do
        expect(@project.groups).to include an_object_having_attributes(title: "QUIRE 1")
        expect(@project.groups).not_to include an_object_having_attributes(title: "QUIRE 2")
        expect(@project.groups).not_to include an_object_having_attributes(title: "QUIRE 3")
        expect(@project.groups).to include an_object_having_attributes(title: "QUIRE 4")
        expect(@project.groups).to include an_object_having_attributes(title: "QUIRE 5")
      end
    end
    
    context 'and missing group' do
      before do
        @parameters[:groups][0] += 'missing'
        @parameters[:groups][1] += 'missing'
        put "/groups", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @body = JSON.parse(response.body)
      end
      
      it 'returns 422' do
        expect(response).to have_http_status(:unprocessable_entity)
      end
      
      it 'leaves the groups alone' do
        expect(@project.groups).to include an_object_having_attributes(title: "QUIRE 1")
        expect(@project.groups).to include an_object_having_attributes(title: "QUIRE 2")
        expect(@project.groups).to include an_object_having_attributes(title: "QUIRE 3")
        expect(@project.groups).to include an_object_having_attributes(title: "QUIRE 4")
        expect(@project.groups).to include an_object_having_attributes(title: "QUIRE 5")
      end
    end
    
    context 'and unauthorized group' do
      before do
        @project.user = FactoryGirl.create(:user)
        @project.save
        delete '/groups', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @project.reload
      end
      
      it 'returns 401' do
        expect(response).to have_http_status(:unauthorized)
      end
      
      it 'leaves the groups alone' do
        expect(@project.groups).to include an_object_having_attributes(title: "QUIRE 1")
        expect(@project.groups).to include an_object_having_attributes(title: "QUIRE 2")
        expect(@project.groups).to include an_object_having_attributes(title: "QUIRE 3")
        expect(@project.groups).to include an_object_having_attributes(title: "QUIRE 4")
        expect(@project.groups).to include an_object_having_attributes(title: "QUIRE 5")
      end
    end
  end
  
  context 'with corrupted authorization' do
    before do
      delete '/groups', params: @parameters.to_json, headers: {'Authorization' => @authToken+'asdf', 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
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
      delete '/groups', params: @parameters.to_json, headers: {'Authorization' => ""}
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
      delete '/groups', params: @parameters.to_json, headers: {'Authorization' => "123456789"}
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
      delete '/groups'
    end

    it 'returns an unauthorized action error' do
      expect(response).to have_http_status(:unauthorized)
    end
  end
end

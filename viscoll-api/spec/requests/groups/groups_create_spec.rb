require 'rails_helper'

describe "POST /groups", :type => :request do
  before do
    @user = FactoryGirl.create(:user, {:password => "user"})
    put '/confirmation', params: {:confirmation_token => @user.confirmation_token}
    post '/session', params: {:session => { :email => @user.email, :password => "user" }}
    @authToken = JSON.parse(response.body)['session']['jwt']
  end

  before :each do
    @project = FactoryGirl.create(:project, {user: @user, taxonomies: ["Ink"]})
    @parameters = {
      "group": {
        "project_id": @project.id.to_str,
        "title": "New Quire",
        "type": "Quire",
      },
      "additional": {
        "order": 1, 
        "memberOrder": 1,
        "noOfGroups": 1,
        "noOfLeafs": 5,
        "conjoin": true,
        "oddMemberLeftOut": 2
      }
    }
  end

  context 'and valid authorization' do
    context 'and standard group' do
      before do
        post '/groups', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
      end

      it 'returns 204' do
        expect(response).to have_http_status(:no_content)
      end

      it 'adds a group to the project' do
        expect(@project.groups).to include an_object_having_attributes(title: "New Quire")
      end
    end
    
    context 'and as a sub-group' do
      before do
        @group2 = FactoryGirl.create(:quire, { title: "Existing Quire", project: @project })
        @project.add_groupIDs([@group2.id.to_s], 0)
        @parameters[:additional][:parentGroupID] = @group2.id.to_s
        @parameters[:additional][:order] = 2
        post '/groups', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @group2.reload
      end

      it 'returns 204' do
        expect(response).to have_http_status(:no_content)
      end

      it 'adds a group to the project' do
        expect(@group2.memberIDs.length).to eq 1
        expect(@project.groups).to include an_object_having_attributes(title: "New Quire")
      end
    end
    
    context 'and missing parameter' do
      before do
        @parameters[:group].delete(:project_id)
        post '/groups', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @body = JSON.parse(response.body)
      end
      
      it 'returns 422' do
        expect(response).to have_http_status(:unprocessable_entity)
      end
      
      it 'returns the error message' do
        expect(@body['group']['project_id']).to include("not found")
      end
    end
    
    context 'and missing project' do
      before do
        @parameters[:group][:project_id] += 'missing'
        post '/groups', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @body = JSON.parse(response.body)
      end
      
      it 'returns 422' do
        expect(response).to have_http_status(:unprocessable_entity)
      end
      
      it 'returns the error message' do
        expect(@body['group']['project_id']).to include("project not found with id #{@project.id.to_str}missing")
      end
    end

    context 'and failing params for the term' do
      before do
        allow_any_instance_of(Group).to receive(:save).and_return(false)
        post '/groups', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
      end

      it 'returns 422' do
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context 'and uncaught exception' do
      before do
        allow_any_instance_of(Group).to receive(:save).and_raise("Exception")
        post '/groups', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @body = JSON.parse(response.body)
      end

      it 'returns 422' do
        expect(response).to have_http_status(:unprocessable_entity)
        @body = JSON.parse(response.body)
      end
      
      it 'returns the error message' do
        expect(@body['error']).to eq "Exception"
      end
    end
  end

  context 'with corrupted authorization' do
    before do
      post '/groups', params: @parameters.to_json, headers: {'Authorization' => @authToken+'asdf', 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
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
      post '/groups', params: @parameters.to_json, headers: {'Authorization' => ""}
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
      post '/groups', params: @parameters.to_json, headers: {'Authorization' => "123456789"}
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
      post '/groups'
    end

    it 'returns an unauthorized action error' do
      expect(response).to have_http_status(:unauthorized)
    end
  end
end

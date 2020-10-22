require 'rails_helper'

describe "PUT /groups", :type => :request do
  before do
    @user = FactoryGirl.create(:user, {:password => "user"})
    put '/confirmation', params: {:confirmation_token => @user.confirmation_token}
    post '/session', params: {:session => { :email => @user.email, :password => "user" }}
    @authToken = JSON.parse(response.body)['session']['jwt']
  end

  before :each do
    @project = FactoryGirl.create(:project, {
      user: @user,
      taxonomies: ["Ink"],
    })
    5.times do |n|
      @project.groups << FactoryGirl.create(:quire, { 
        project: @project, 
      })
    end
    @project.save
    @parameters = {
      groups: [
        {
          id: @project.groups[1].id.to_str,
          attributes: {
            title: "Changed title 1"
          }
        },
        {
          id: @project.groups[2].id.to_str,
          attributes: {
            title: "Changed title 2"
          }
        }
      ],
    }
  end
  
  context 'with valid authorization' do
    context 'and standard group specs' do
      before do
        put '/groups', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @project.reload
      end

      it 'returns 204' do
        expect(response).to have_http_status(:no_content)
      end

      it 'edits the group' do
        expect(@project.groups[1].title).to eq "Changed title 1"
        expect(@project.groups[2].title).to eq "Changed title 2"
      end
    end
    
    context 'and missing group' do
      before do
        @parameters[:groups][0][:id] += 'missing'
        @parameters[:groups][1][:id] += 'missing'
        put "/groups", params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @body = JSON.parse(response.body)
      end
      
      it 'returns 422' do
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
    
    context 'and unauthorized group' do
      before do
        @project.user = FactoryGirl.create(:user)
        @project.save
        put '/groups', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @project.reload
      end
      
      it 'returns 401' do
        expect(response).to have_http_status(:unauthorized)
      end
      
      it 'leaves the targets unaltered' do
        expect(@project.groups[1].title).not_to eq "Changed title 1"
        expect(@project.groups[2].title).not_to eq "Changed title 2"
      end
    end
    
    context 'and failed update' do
      before do
        allow_any_instance_of(Group).to receive(:update).and_return(false)
        put '/groups', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @body = JSON.parse(response.body)
      end

      it 'returns 422' do
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
    
    context 'and raised exception' do
      before do
        allow_any_instance_of(Group).to receive(:update).and_raise('MyException')
        put '/groups', params: @parameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @body = JSON.parse(response.body)
      end

      it 'returns 422' do
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'shows the exception' do
        expect(@body['error']).to eq 'MyException'
      end
    end
  end
  
  context 'with corrupted authorization' do
    before do
      put '/groups', params: @parameters.to_json, headers: {'Authorization' => @authToken+'asdf', 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
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
      put '/groups', params: @parameters.to_json, headers: {'Authorization' => ""}
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
      put '/groups', params: @parameters.to_json, headers: {'Authorization' => "123456789"}
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
      put '/groups'
    end

    it 'returns an unauthorized action error' do
      expect(response).to have_http_status(:unauthorized)
    end
  end
end

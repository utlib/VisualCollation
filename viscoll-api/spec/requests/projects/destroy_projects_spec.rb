require 'rails_helper'

describe "DELETE /projects/id", :type => :request do
  before do
    @user = FactoryGirl.create(:user, {:password => "user"})
    put '/confirmation', params: {:confirmation_token => @user.confirmation_token}
    post '/session', params: {:session => { :email => @user.email, :password => "user" }}
    @authToken = JSON.parse(response.body)['session']['jwt']
  end

  before :each do
    @user2 = FactoryGirl.create(:user)
    @project1 = FactoryGirl.create(:project, {:user => @user})
    @project2 = FactoryGirl.create(:project, {:user => @user})
    @project3 = FactoryGirl.create(:project, {:user => @user2})
    @deleteParameters = {
      deleteUnlinkedImages: false,
    }
  end

  context 'with correct authorization' do
    context 'and standard params' do
      before do
        delete '/projects/'+@project1.id, params: @deleteParameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @body = JSON.parse(response.body)
      end

      it 'returns 200' do
        expect(response).to have_http_status(:ok)
      end

      it 'returns the remaining project' do
        expect(@body["projects"].length).to equal 1
        expect(@body["projects"][0]['id']).to eq @project2.id.to_str
      end

      it 'leaves only the undeleted projects' do
        expect(Project.where(id: @project1.id).exists?).to be false
        expect(Project.where(id: @project2.id).exists?).to be true
        expect(Project.where(id: @project3.id).exists?).to be true
      end
    end

    context 'and inexistent project' do
      before do
        delete '/projects/NONEXISTENT', params: @deleteParameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @body = JSON.parse(response.body)
      end

      it 'returns 404' do
        expect(response).to have_http_status(:not_found)
      end

      it 'should not remove anything' do
        expect(Project.where(id: @project1.id).exists?).to be true
        expect(Project.where(id: @project2.id).exists?).to be true
        expect(Project.where(id: @project3.id).exists?).to be true
      end
    end

    context "and somebody else's project" do
      before do
        delete '/projects/'+@project3.id, params: @deleteParameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
      end

      it 'returns 401' do
        expect(response).to have_http_status(:unauthorized)
      end

      it 'should not remove anything' do
        expect(Project.where(id: @project1.id).exists?).to be true
        expect(Project.where(id: @project2.id).exists?).to be true
        expect(Project.where(id: @project3.id).exists?).to be true
      end
    end

    context 'and a failed delete' do
      before do
        allow_any_instance_of(Project).to receive(:destroy).and_raise("Exception")
        delete '/projects/'+@project1.id, params: @deleteParameters.to_json, headers: {'Authorization' => @authToken, 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
        @body = JSON.parse(response.body)
      end

      it 'returns 401' do
        expect(response).to have_http_status(:bad_request)
      end

      it 'includes the exception' do
        expect(@body['errors']).to eq "Exception"
      end
    end
  end

  context 'with corrupted authorization' do
    before do
      delete '/projects/'+@project1.id, params: @deleteParameters.to_json, headers: {'Authorization' => @authToken+'asdf', 'CONTENT_TYPE' => 'application/json', 'ACCEPT' => 'application/json'}
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
      delete '/projects/'+@project1.id, params: @deleteParameters.to_json, headers: {'Authorization' => ""}
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
      delete '/projects/'+@project1.id, params: @deleteParameters.to_json, headers: {'Authorization' => "123456789"}
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
      delete '/projects/'+@project1.id
    end

    it 'returns an unauthorized action error' do
      expect(response).to have_http_status(:unauthorized)
    end
  end
end

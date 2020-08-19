require 'rails_helper'

RSpec.describe Project, type: :model do
  it { is_expected.to be_mongoid_document }
  
  it { is_expected.to have_field(:title).of_type(String) }
  it { is_expected.to have_field(:shelfmark).of_type(String) }
  it { is_expected.to have_field(:notationStyle).of_type(String) }
  it { is_expected.to have_field(:metadata).of_type(Hash) }
  it { is_expected.to have_field(:manifests).of_type(Hash) }
  it { is_expected.to have_field(:noteTypes).of_type(Array) }
  it { is_expected.to have_field(:preferences).of_type(Hash) }
  it { is_expected.to have_field(:groupIDs).of_type(Array) }
  
  it { is_expected.to belong_to(:user) }
  it { is_expected.to have_many(:groups) }
  it { is_expected.to have_many(:leafs) }
  it { is_expected.to have_many(:sides) }
  it { is_expected.to have_many(:notes) }

  before(:each) do
    @user = FactoryGirl.create(:user)
    @project = FactoryGirl.create(:project, user: @user)
  end
  
  describe "Validations" do
    it "should require a title" do
      @project.title = ''
      expect(@project).not_to be_valid
    end
    
    it "should be unique to the same user" do
      @duplicated_project = FactoryGirl.create(:project, user: @user)
      @project.title = @duplicated_project.title
      expect(@project).not_to be_valid
    end
    
    it "can be duplicated for different users" do
      @user2 = FactoryGirl.create(:user)
      @duplicated_project = FactoryGirl.create(:project, user: @user2)
      @project.title = @duplicated_project.title
      expect(@project).to be_valid
    end
  end
  
  describe "Group IDs" do
    it "should add group IDs properly" do
      @project.add_groupIDs(['abcd', 'efgh'], 0)
      expect(@project.groupIDs).to eq ['abcd', 'efgh']
    end
    
    it "should insert group IDs properly" do
      @project.add_groupIDs(['abcd', 'efgh', 'ijkl'], 0)
      @project.add_groupIDs(['1234', '5678'], 1)
      expect(@project.groupIDs).to eq ['abcd', '1234', '5678', 'efgh', 'ijkl']
    end
    
    it "should remove group IDs properly" do
      @project.add_groupIDs(['abcd', 'efgh', 'ijkl'], 0)
      @project.remove_groupID('efgh')
      expect(@project.groupIDs).to eq ['abcd', 'ijkl']
    end
  end
  
  describe "Image unlinking hook" do
    before do
      @project1 = FactoryGirl.create(:codex_project, user: @user, quire_structure: [[1,2]])
      @project2 = FactoryGirl.create(:codex_project, user: @user, quire_structure: [[1,2]])
      @image = FactoryGirl.create(:pixel, user: @user, projectIDs: [@project1.id.to_s, @project2.id.to_s], sideIDs: [@project1.sides[0].id.to_s, @project2.sides[0].id.to_s])
    end
    
    it 'should unhook from deleted project and sides' do
      @project2.destroy!
      @image.reload
      expect(@image.projectIDs).to eq [@project1.id.to_s]
      expect(@image.sideIDs).to eq [@project1.sides[0].id.to_s]
    end
  end
end

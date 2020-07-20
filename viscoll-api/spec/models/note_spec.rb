require 'rails_helper'

RSpec.describe Note, type: :model do
  it { is_expected.to be_mongoid_document }
  
  it { is_expected.to have_field(:title).of_type(String) }
  it { is_expected.to have_field(:type).of_type(String) }
  it { is_expected.to have_field(:description).of_type(String) }
  it { is_expected.to have_field(:uri).of_type(String) }
  it { is_expected.to have_field(:objects).of_type(Hash) }
  it { is_expected.to have_field(:show).of_type(Mongoid::Boolean) }
  
  it { is_expected.to belong_to(:project) }

  before :each do
    @project = FactoryGirl.create(:project, noteTypes: ['Ink'])
    @group = FactoryGirl.create(:group, project: @project)
    @leaf = FactoryGirl.create(:leaf, project: @project, parentID: @group.id.to_s)
    @side1 = Side.find(id: @leaf.rectoID)
    @side2 = Side.find(id: @leaf.versoID)
    @project.add_groupIDs([@group.id.to_s], 0)
    @group.add_members([@leaf.id.to_s], 0)
    @note = FactoryGirl.create(:note, project: @project, type: ['Ink'], objects: {Group: [@group.id.to_s], Leaf: [@leaf.id.to_s], Recto: [@side1.id.to_s], Verso: [@side2.id.to_s]} )
    @group.notes << @note
    @group.save
    @leaf.notes << @note
    @leaf.save
    @side1.notes << @note
    @side1.save
    @side2.notes << @note
    @side2.save
  end

  describe "Validations" do
    it "should require a title" do
      @note.title = ''
      expect(@note).not_to be_valid
    end
    it "should be unique within the project" do
      duplicate_note = FactoryGirl.create(:note, project: @project, type: ['Ink'], objects: {Group: [@group.id.to_s], Leaf: [], Recto: [], Verso: []} )
      duplicate_note.title = @note.title
      expect(duplicate_note).not_to be_valid
    end
    it "should not need to be unique globally" do
      project2 = FactoryGirl.create(:project)
      group2 = FactoryGirl.create(:group, project: project2)
      project2.add_groupIDs([group2.id.to_s], 0)
      note2 = FactoryGirl.create(:note, project: project2, type: ['Ink'], objects: {Group: [group2.id.to_s], Leaf: [], Recto: [], Verso: []})
      expect(note2).to be_valid
    end
    it "should require a type" do
      @note.type = ''
      expect(@note).not_to be_valid
    end
  end
  
  describe "Destroy hooks" do
    before do
      @note.destroy
    end
    it "updates linked group" do
      @group.reload
      expect(@group.notes).to be_empty
    end
    it "updates linked leaf" do
      @leaf.reload
      expect(@leaf.notes).to be_empty
    end
    it "updates linked recto side" do
      @side1.reload
      expect(@side1.notes).to be_empty
    end
    it "updates linked verso side" do
      @side2.reload
      expect(@side2.notes).to be_empty
    end
  end
end

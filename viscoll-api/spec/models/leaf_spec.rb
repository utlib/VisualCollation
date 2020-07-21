require 'rails_helper'

RSpec.describe Leaf, type: :model do
  it { is_expected.to be_mongoid_document }
  
  it { is_expected.to have_field(:folio_number).of_type(String) }
  it { is_expected.to have_field(:material).of_type(String) }
  it { is_expected.to have_field(:type).of_type(String) }
  it { is_expected.to have_field(:conjoined_to).of_type(String) }
  it { is_expected.to have_field(:attached_above).of_type(String) }
  it { is_expected.to have_field(:attached_below).of_type(String) }
  it { is_expected.to have_field(:stubType).of_type(String) }
  it { is_expected.to have_field(:parentID).of_type(String) }
  it { is_expected.to have_field(:nestLevel).of_type(Integer) }
  it { is_expected.to have_field(:rectoID).of_type(String) }
  it { is_expected.to have_field(:versoID).of_type(String) }
  
  it { is_expected.to belong_to(:project) }
  it { is_expected.to have_and_belong_to_many(:notes) }

  before(:each) do
    @project = FactoryGirl.create(:project)
    @leaf = FactoryGirl.create(:leaf, project: @project)
    @group = FactoryGirl.create(:group, project: @project)
    @group.add_members([@leaf.id.to_s], 0)
    @leaf.parentID = @group.id
    @leaf.save
  end

  describe "Initialization" do
    it "should have a prefixed ID" do
      expect(@leaf.id.to_s[0..4]).to eq "Leaf_"
    end
    
    it "should add two sides" do
      expect(Side.where(id: @leaf.rectoID).exists?).to be true
      expect(Side.where(id: @leaf.versoID).exists?).to be true
    end
  end
  
  it "should be able to unlink itself from a group" do
    @group = FactoryGirl.create(:group, project: @project)
    @group.add_members([@leaf.id.to_s], 0)
    @leaf.parentID = @group.id
    @leaf.save
    expect(@group.memberIDs).to include(@leaf.id.to_s)
    @leaf.remove_from_group
    @group.reload
    expect(@group.memberIDs).not_to include(@leaf.id.to_s)
  end
  
  describe "Destruction" do
    it "should unlink its notes" do
      subnote = FactoryGirl.create(:note, project: @project, objects: {Group: [], Leaf: [@leaf.id], Recto: [], Verso: []})
      @leaf.notes << subnote
      @leaf.save
      @leaf.destroy
      expect(subnote.objects[:Leaf]).to be_empty
    end
    
    it "should destroy its sides" do
      rectoId = @leaf.rectoID
      versoId = @leaf.versoID
      @leaf.destroy
      expect(Side.where(id: rectoId).exists?).to be false
      expect(Side.where(id: versoId).exists?).to be false
    end
  end
end

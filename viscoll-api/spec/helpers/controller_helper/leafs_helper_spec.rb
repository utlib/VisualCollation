require 'rails_helper'

RSpec.describe ControllerHelper::LeafsHelper, type: :helper do
  describe 'autoConjoinLeaves' do
    describe 'even leaves' do
      before :each do
        @project = FactoryGirl.create(:project)
        @group = FactoryGirl.create(:quire, project: @project)
        @project.add_groupIDs([@group.id.to_s], 0)
        @leaves = 4.times.collect { FactoryGirl.create(:leaf, project: @project) }
        @group.add_members(@leaves.collect { |leaf| leaf.id.to_s }, 0)
        @project.update({ leafs: @leaves })
      end
      
      it 'conjoins new leaves' do
        autoConjoinLeaves(@leaves, nil)
        @project.reload
        @leaves = @project.leafs
        expect(@leaves[0].conjoined_to).to eq @leaves[3].id.to_s
        expect(@leaves[1].conjoined_to).to eq @leaves[2].id.to_s
        expect(@leaves[2].conjoined_to).to eq @leaves[1].id.to_s
        expect(@leaves[3].conjoined_to).to eq @leaves[0].id.to_s
      end
      
      it 'reconfigures existing leaves' do
        @leaves[0].conjoined_to = @leaves[1].id.to_s
        @leaves[1].conjoined_to = @leaves[0].id.to_s
        @leaves[2].conjoined_to = @leaves[3].id.to_s
        @leaves[3].conjoined_to = @leaves[2].id.to_s
        @leaves.each { |leaf| leaf.save }
        autoConjoinLeaves(@leaves, nil)
        @project.reload
        @leaves = @project.leafs
        expect(@leaves[0].conjoined_to).to eq @leaves[3].id.to_s
        expect(@leaves[1].conjoined_to).to eq @leaves[2].id.to_s
        expect(@leaves[2].conjoined_to).to eq @leaves[1].id.to_s
        expect(@leaves[3].conjoined_to).to eq @leaves[0].id.to_s
      end
    end
    
    describe 'odd leaves' do
      before :each do
        @project = FactoryGirl.create(:project)
        @group = FactoryGirl.create(:quire, project: @project)
        @project.add_groupIDs([@group.id.to_s], 0)
        @leaves = 5.times.collect { FactoryGirl.create(:leaf, project: @project) }
        @group.add_members(@leaves.collect { |leaf| leaf.id.to_s }, 0)
        @project.update({ leafs: @leaves })
      end
      
      it 'conjoins new leaves' do
        autoConjoinLeaves(@leaves, 2)
        @project.reload
        @leaves = @project.leafs
        expect(@leaves[0].conjoined_to).to eq @leaves[4].id.to_s
        expect(@leaves[1].conjoined_to).to be_blank
        expect(@leaves[2].conjoined_to).to eq @leaves[3].id.to_s
        expect(@leaves[3].conjoined_to).to eq @leaves[2].id.to_s
        expect(@leaves[4].conjoined_to).to eq @leaves[0].id.to_s
      end
      
      it 'reconfigures existing leaves' do
        @leaves[0].conjoined_to = @leaves[1].id.to_s
        @leaves[1].conjoined_to = @leaves[0].id.to_s
        @leaves[3].conjoined_to = @leaves[4].id.to_s
        @leaves[4].conjoined_to = @leaves[3].id.to_s
        @leaves.each { |leaf| leaf.save }
        autoConjoinLeaves(@leaves, 4)
        @project.reload
        @leaves = @project.leafs
        expect(@leaves[0].conjoined_to).to eq @leaves[4].id.to_s
        expect(@leaves[1].conjoined_to).to eq @leaves[2].id.to_s
        expect(@leaves[2].conjoined_to).to eq @leaves[1].id.to_s
        expect(@leaves[3].conjoined_to).to be_blank
        expect(@leaves[4].conjoined_to).to eq @leaves[0].id.to_s
      end
    end
    
    describe 'reconjoin odd subleaves' do
      before do
        @project = FactoryGirl.create(:codex_project, quire_structure: [[1,8]])
        @leaves = @project.leafs
      end
      
      it 'reconfigures leaves properly when conjoining first 5' do
        expect(@leaves[2].conjoined_to).to eq @leaves[5].id.to_s
        autoConjoinLeaves(@leaves[0..4], 3)
        @project.reload
        @leaves = @project.leafs
        expect(@leaves[0].conjoined_to).to eq @leaves[4].id.to_s
        expect(@leaves[1].conjoined_to).to eq @leaves[3].id.to_s
        expect(@leaves[2].conjoined_to).to be_blank
        expect(@leaves[3].conjoined_to).to eq @leaves[1].id.to_s
        expect(@leaves[4].conjoined_to).to eq @leaves[0].id.to_s
        expect(@leaves[5].conjoined_to).to be_blank
        expect(@leaves[6].conjoined_to).to be_blank
        expect(@leaves[7].conjoined_to).to be_blank
      end
    end
  end
  
  describe 'update_attached_to' do
    before :each do
      @project = FactoryGirl.create(:project)
      @group = FactoryGirl.create(:quire, project: @project)
      @project.add_groupIDs([@group.id.to_s], 0)
      @leaves = 5.times.collect { FactoryGirl.create(:leaf, project: @project, parentID: @group.id.to_s) }
      @group.add_members(@leaves.collect { |leaf| leaf.id.to_s }, 0)
      @project.update({ leafs: @leaves })
    end
    
    it 'correctly handles first leaf' do
      @leaves[0].attached_below = 'Glued'
      @leaves[0].save
      @leaf = @leaves[0]
      update_attached_to
      @project.reload
      @leaves = @project.leafs
      expect(@leaves[1].attached_above).to eq 'Glued'
    end
    
    it 'correctly handles last leaf' do
      @leaves[-1].attached_above = 'Sewn'
      @leaves[-1].save
      @leaf = @leaves[-1]
      update_attached_to
      @project.reload
      @leaves = @project.leafs
      expect(@leaves[-2].attached_below).to eq 'Sewn'
    end
    
    it 'correctly handles middle leaf' do
      @leaves[2].update({ attached_above: 'Glued', attached_below: 'Sewn' })
      @leaf = @leaves[2]
      update_attached_to
      @project.reload
      @leaves = @project.leafs
      expect(@leaves[1].attached_below).to eq 'Glued'
      expect(@leaves[3].attached_above).to eq 'Sewn'
    end
  end
  
  describe 'update_conjoined_partner' do
    let(:helpers) { ApplicationController.helpers }
    
    before :each do
      @project = FactoryGirl.create(:project)
      @group = FactoryGirl.create(:quire, project: @project)
      @project.add_groupIDs([@group.id.to_s], 0)
      @leaves = 3.times.collect { FactoryGirl.create(:leaf, project: @project, parentID: @group.id.to_s) }
      @group.add_members(@leaves.collect { |leaf| leaf.id.to_s }, 0)
      @project.update({ leafs: @leaves })
    end
    
    it 'should reattach 1-2 to 1-3' do
      @leaves[0].update({ conjoined_to: @leaves[1].id.to_s })
      @leaves[1].update({ conjoined_to: @leaves[0].id.to_s }) 
      @leaf = @leaves[0]
      update_conjoined_partner(@leaves[2].id.to_s)
      @project.reload
      @leaves = @project.leafs
      expect(@leaves[1].conjoined_to).to be_blank
      expect(@leaves[2].conjoined_to).to eq @leaves[0].id.to_s
    end
    
    it 'should reattach 2-3 to 1-3' do
      @leaves[1].update({ conjoined_to: @leaves[2].id.to_s })
      @leaves[2].update({ conjoined_to: @leaves[1].id.to_s }) 
      @leaf = @leaves[0]
      update_conjoined_partner(@leaves[2].id.to_s)
      @project.reload
      @leaves = @project.leafs
      expect(@leaves[1].conjoined_to).to be_blank
      expect(@leaves[2].conjoined_to).to eq @leaves[0].id.to_s
    end
  end
end

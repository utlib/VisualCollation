module ControllerHelper
  module GroupsHelper
    
    def addLeavesInside(project_id, group, noOfLeafs, conjoin, oddMemberLeftOut)
      newlyAddedLeafs = []
      newlyAddedLeafIDs = []
      noOfLeafs.times do |i|
        leaf = Leaf.new({project_id: project_id, parentID:group.id.to_s, nestLevel: group.nestLevel})
        leaf.save()
        newlyAddedLeafs.push(leaf)
        newlyAddedLeafIDs.push(leaf.id.to_s)
      end
      # Add newly created leaves to this group
      group.add_members(newlyAddedLeafIDs, 1)
      # Auto-Conjoin newly added leaves in this group
      if conjoin
        autoConjoinLeaves(newlyAddedLeafs, oddMemberLeftOut)
      end
    end

  end
end
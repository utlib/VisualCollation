module ControllerHelper
  module GroupsHelper
    include ControllerHelper::LeafsHelper
    
    def addLeavesInside(project_id, group, noOfLeafs, conjoin, oddMemberLeftOut, leafIDs=false, sideIDs=false)
      begin
        if (leafIDs and sideIDs)
          Leaf.skip_callback(:create, :before, :create_sides)
        end
        newlyAddedLeafs = []
        newlyAddedLeafIDs = []
        sideIDIndex = 0
        noOfLeafs.times do |leafIDIndex|
          leaf = Leaf.new({project_id: project_id, parentID:group.id.to_s, nestLevel: group.nestLevel})
          if (leafIDs and sideIDs)
            leaf.id = leafIDs[leafIDIndex]
          end
          leaf.save()
          newlyAddedLeafs.push(leaf)
          newlyAddedLeafIDs.push(leaf.id.to_s)
          # Create new sides for this leaf with given SideIDs
          if (leafIDs and sideIDs)
            recto = Side.new({parentID: leaf.id.to_s, project: leaf.project, texture: "Hair", id: sideIDs[sideIDIndex]})
            verso = Side.new({parentID: leaf.id.to_s, project: leaf.project, texture: "Flesh", id: sideIDs[sideIDIndex+1] })
            recto.id = "Recto_"+recto.id.to_s
            verso.id = "Verso_"+verso.id.to_s
            recto.save
            verso.save
            leaf.rectoID = recto.id
            leaf.versoID = verso.id
            leaf.save
          end
          sideIDIndex += 2
        end
        # Add newly created leaves to this group
        group.add_members(newlyAddedLeafIDs, 1)
        # Auto-Conjoin newly added leaves in this group
        if conjoin
          autoConjoinLeaves(newlyAddedLeafs, oddMemberLeftOut)
        end
      rescue
      ensure
        if (leafIDs and sideIDs)
          Leaf.set_callback(:create, :before, :create_sides)
        end
      end
    end
  end
end

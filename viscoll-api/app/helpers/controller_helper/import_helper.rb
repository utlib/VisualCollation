module ControllerHelper
  module ImportHelper

    # JSON IMPORT
    def handleJSONImport(data)
      # Create the Project
      begin
        Project.find_by(title: data["project"]["title"])
        data["project"]["title"] = "Copy of " + data["project"]["title"]+" @ " + Time.now.to_s
      rescue Exception => e
      end
      data["project"]["user_id"] = current_user.id
      project = Project.create(data["project"])
    
      allLeafsInOrder = []
      # Create all Leafs
      data["leafs"].each do |leafID, leafParams|
        leafParams["project_id"] = project.id
        leaf = Leaf.create(leafParams)
        allLeafsInOrder.push(leaf)
      end

      allGroupsInOrder = []
      # Create all Groups
      data["groups"].each do |groupID, groupParams|
        if groupParams["tacketed"] != ""
          groupParams["tacketed"] = allLeafsInOrder[groupParams["tacketed"]].id.to_s
        end
        groupParams["project_id"] = project.id
        group = Group.create(groupParams["group"])
        allGroupsInOrder.push(group)
      end

      # Update all leafs with correct conjoinedTo leaf IDs
      data["leafs"].each do |leafID, leafParams|
        if leafParams[:conjoined_to]
          leafConjoinedTo = allLeafsInOrder[leafParams[:conjoined_leaf_order]]
          leaf.update(conjoined_to: leafConjoinedTo.id.to_s)
        end      
      end

      # Create all Sides
      sides = []
      data["sides"].each do |sideParams|
        sideParams["side"]["leaf_id"] = project.leafs.find_by(order: sideParams["parentLeafOrder"]).id
        side = Side.create(sideParams["side"])
        sides.push(side)
      end

      # Create all Notes
      data["notes"].each do |noteParams|
        noteParams["note"]["project_id"] = project.id
        note = Note.create(noteParams["note"])
        # Generate objectIDs of Groups with this note
        groupIDs = []
        noteParams["groupOrders"].each do |order|
          group = project.groups.find_by(order: order)
          group.notes.push(note)
          group.save
          groupIDs.push(group.id.to_s)
        end
        leafIDs = []
        noteParams["leafOrders"].each do |order|
          leaf = project.leafs.find_by(order: order)
          leaf.notes.push(note)
          leaf.save
          leafIDs.push(leaf.id.to_s)
        end
        sideIDs = []
        noteParams["sideOrders"].each do |order|
          side = sides[order-1]
          side.notes.push(note)
          side.save
          sideIDs.push(side.id.to_s)
        end
        note.objects["Group"] = groupIDs
        note.objects["Leaf"] = leafIDs
        note.objects["Side"] = sideIDs
      end

      # Create all Groupings
      data["groupings"].each do |groupingParams|
        group = project.groups.find_by(order: groupingParams["groupOrder"])
        memberOrder = groupingParams["memberOrder"]
        if (groupingParams["memberType"]=="Group")
          newMember =  project.groups.find_by(order: groupingParams["objectOrder"])
          group.add_members([newMember], memberOrder)
        elsif (groupingParams["memberType"]=="Leaf")
          newMember = project.leafs.find_by(order: groupingParams["objectOrder"])
          group.add_members([newMember], memberOrder)
        end
      end
    end



    # XML IMPORT
    def handleXMLImport(data)
      # Create the Project
      # title = data["manuscript"]["title"]
      # begin
      #   Project.find_by(title: title)
      #   title = "Copy of " + title + " @ " + Time.now.to_s
      # rescue Exception => e
      # end
      # @project = Project.create(title: title, user_id: current_user.id)

      # # Create the Manuscript
      # shelfmark = data["manuscript"]["shelfmark"]
      # @project = Manuscript.create(shelfmark: shelfmark, project_id: @project.id)

      # # Create None & Binding Leafs
      # Leaf.create({project_id: @project.id, order: -1})
      # Leaf.create({project_id: @project.id, order: 0})
      # # Create all Groups
      # data["manuscript"]["quire"].each do |quire|
      #   p quire
      #   groupOrder = quire["n"]
      #   nestLevel = quire["level"]
      #   groupParams["group"]["project_id"] = @project.id
      #   @group = Group.create(project_id: @project.id, type: "Quire", order: groupOrder)
      #   # First, create all Leafs in this Group without attributes
      #   if (quire["leaf"])
      #     quire["leaf"].each do |leaf|
      #       leafOrder = leaf["folio_number"]
      #       Leaf.create(project_id: @project.id, order: leafOrder)
      #     end
      #   end
      # end
    end


  end
end
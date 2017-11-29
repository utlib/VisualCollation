module ControllerHelper
  module ImportHelper

    # JSON IMPORT
    def handleJSONImport(data)
      # reference variables
      allGroupsIDsInOrder = []
      allLeafsIDsInOrder = []
      allRectosIDsInOrder = []
      allVersosIDsInOrder = []

      # Create the Project
      begin
        Project.find_by(title: data["project"]["title"])
        data["project"]["title"] = "Copy of " + data["project"]["title"]+" @ " + Time.now.to_s
      rescue Exception => e
      end
      data["project"]["user_id"] = current_user.id
      project = Project.create(data["project"])
    
      # Create all Leafs
      data["Leafs"].each do |leafOrder, data|
        data["params"]["project_id"] = project.id
        leaf = Leaf.create(data["params"])
        allLeafsIDsInOrder.push(leaf.id.to_s)
        allRectosIDsInOrder.push(leaf.rectoID)
        allVersosIDsInOrder.push(leaf.versoID)
      end

      # Create all Groups
      data["Groups"].each do |groupOrder, data|
        tacketed, sewing = [], []
        data["tacketed"].each do |leafOrder|
          tacketed.push(allLeafsIDsInOrder[leafOrder-1])
        end
        data["sewing"].each do |leafOrder|
          sewing.push(allLeafsIDsInOrder[leafOrder-1])
        end
        data["params"]["tacketed"] = tacketed
        data["params"]["sewing"] = sewing
        data["params"]["project_id"] = project.id
        group = Group.create(data["params"])
        allGroupsIDsInOrder.push(group.id.to_s)
      end

      project.reload
      # Update all Group membersIDs and parentID
      data["Groups"].each do |groupOrder, data|
        group = project.groups.find(allGroupsIDsInOrder[groupOrder.to_i-1])
        parentID = data["parentOrder"] ? allGroupsIDsInOrder[data["parentOrder"]-1] : nil
        memberIDs = []
        data["memberOrders"].each do |memberOrder|
          memberType, memberOrder = memberOrder.split("_")
          if memberType=="Group"
            memberIDs.push(allGroupsIDsInOrder[memberOrder.to_i-1])
          else
            memberIDs.push(allLeafsIDsInOrder[memberOrder.to_i-1])
            leaf = project.leafs.find(allLeafsIDsInOrder[memberOrder.to_i-1])
            leaf.update(parentID: group.id.to_s)
          end
        end
        group.update(parentID: parentID, memberIDs: memberIDs)
      end

      # Update all leafs with correct conjoinedTo leafID
      data["Leafs"].each do |leafOrder, data|
        if data["conjoined_leaf_order"]
          leafIDConjoinedTo = allLeafsIDsInOrder[data["conjoined_leaf_order"]-1]
          leaf = project.leafs.find(allLeafsIDsInOrder[leafOrder.to_i-1])
          leaf.update(conjoined_to: leafIDConjoinedTo)
        end      
      end

      # Update all Rectos
      allRectosIDsInOrder.each_with_index do |rectoID, order|
        recto = project.sides.find(rectoID)
        rectoParams = data["Rectos"][(order+1).to_s]["params"]
        recto.update(rectoParams)
      end

      # Update all Verso
      allVersosIDsInOrder.each_with_index do |versoID, order|
        verso = project.sides.find(versoID)
        versoParams = data["Versos"][(order+1).to_s]["params"]
        verso.update(versoParams)
      end

      project.reload
      # Create all Notes
      data["Notes"].each do |noteOrder, data|
        data["params"]["project_id"] = project.id
        note = Note.new(data["params"])
        # Generate objectIDs of Groups, Leafs, Rectos, Versos with this note
        groupIDs = []
        data["objects"]["Group"].each do |groupOrder|
          groupID = allGroupsIDsInOrder[groupOrder-1]
          group = project.groups.find(groupID)
          group.notes.push(note)
          group.save
          groupIDs.push(groupID)
        end
        leafIDs = []
        data["objects"]["Leaf"].each do |leafOrder|
          leafID = allLeafsIDsInOrder[leafOrder-1]
          leaf = project.leafs.find(leafID)
          leaf.notes.push(note)
          leaf.save
          leafIDs.push(leafID)
        end
        rectoIDs = []
        data["objects"]["Recto"].each do |rectoOrder|
          rectoID = allRectosIDsInOrder[rectoOrder-1]
          recto = project.sides.find(rectoID)
          recto.notes.push(note)
          recto.save
          rectoIDs.push(rectoID)
        end
        versoIDs = []
        data["objects"]["Verso"].each do |versoOrder|
          versoID = allVersosIDsInOrder[versoOrder-1]
          verso = project.sides.find(versoID)
          verso.notes.push(note)
          verso.save
          versoIDs.push(versoID)
        end
        note.objects[:Group] = groupIDs
        note.objects[:Leaf] = leafIDs
        note.objects[:Recto] = rectoIDs
        note.objects[:Verso] = versoIDs
        note.save
      end

      # Update project groupIDs
      project.groupIDs = allGroupsIDsInOrder
      project.save
    end



    # XML IMPORT
    def handleXMLImport(data, xml)
      # reference variables
      allGroupsIDsInOrder = []
      allLeafsIDsInOrder = []
      allRectosIDsInOrder = []
      allVersosIDsInOrder = []
      @groups = {}
      @leafs = {}
      @rectos = {}
      @versos = {}

      allGroups = xml.xpath('//x:quire', "x" => "http://schoenberginstitute.org/schema/collation")
      allLeaves = xml.xpath('//x:leaf', "x" => "http://schoenberginstitute.org/schema/collation")
      allNotes = xml.xpath('//x:note', "x" => "http://schoenberginstitute.org/schema/collation")

      # Create the Project
      projectInformation = {}
      projectInformation[:title] = data["title"]
      if not projectInformation[:title]
        projectInformation[:title] = "XML_Import_@_" + Time.now.to_s
      end
      begin
        Project.find_by(title: projectInformation[:title])
        projectInformation[:title] = "Copy of " + projectInformation[:title] + " @ " + Time.now.to_s
      rescue Exception => e
      end
      projectInformation[:shelfmark] = data["shelfmark"]
      projectInformation[:metadata] = {date: data["date"]}

      # p projectInformation
      # @project = Project.create(projectInformation)
      allLeaves.each do |leaf|
        leafID = nil
        leafAttributes = {}
        leaf.attributes.each do |attr|
          if attr[1].name == "id"
            leafID = attr[1].value
          end
          leafAttributes[attr[1].name] = attr[1].value
        end
        leafChildren = {}
        leaf.getChildren.each do |child|
          childAttributes = {}
          child.attributes.each do |attr|
            if attr[1].name == "id"
              leafID = attr[1].value
            end
            childAttributes[attr[1].name] = attr[1].value
          end
        end
        @leafs[leafID] = leafAttributes
      end
      p @leafs

    end

    def getAttributes(node)
      attributes = node.attributes.dup
      attributes.keys.each do |key|
        attributes[key.to_sym] = attributes.delete(key).to_s
      end
      return attributes
    end

    def getChildren(node)
      return node.children.filter { |child| child.next_element.class != 'Nokogiri::XML::Text' }
    end

    def getNodeID(node)
      node.attributes.each do |attr|
        if attr[1].name == "id"
          return attr[1].value
        end
      end
    end


  end
end
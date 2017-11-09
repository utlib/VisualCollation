require 'net/http'
module ControllerHelper
  module ProjectsHelper
    def addGroupsLeafsConjoin(project, allGroups)
      groupIDs = []
      allGroups.each do |groupInfo|
        group = Group.new({project_id: project, title:"Default", type:"Quire"})
        
        # Create leaves
        newlyAddedLeafs = []
        newlyAddedLeafIDs = []
        groupInfo["leaves"].times do |i|
          leaf = Leaf.new({project_id: project, parentID: "Group_" + group.id.to_s})
          leaf.save()
          newlyAddedLeafs.push(leaf)
          newlyAddedLeafIDs.push(leaf.id.to_s)
        end
        # Add newly created leaves to this group
        group = group.add_members(newlyAddedLeafIDs, 1, false)
        # Auto-Conjoin newly added leaves in this group
        if groupInfo["conjoin"]
          autoConjoinLeaves(newlyAddedLeafs, groupInfo["oddLeaf"])
        end
        group.save
        groupIDs.push(group.id.to_s)
      end
      # Add groups to project
      project.add_groupIDs(groupIDs, 0)
    end


    def getManifestInformation(url)
      images = []
      response = JSON.parse(Net::HTTP.get(URI(url)))
      response["sequences"][0]["canvases"].each do |canvas|
        images.push({label: canvas["label"], url: canvas["images"][0]["resource"]["service"]["@id"]})
      end
      return {name: response["label"][0..150], images: images}
    end

    def generateResponse() 
      @project.reload
      @projectInformation = {}
      @groupIDs = @project.groupIDs
      @leafIDs = []
      @rectoIDs = []
      @versoIDs = []
      @groups = {}
      @leafs = {}
      @rectos = {}
      @versos = {}
      @notes = {}

      @projectInformation = {
        "id": @project.id.to_s,
        "title": @project.title,
        "shelfmark": @project.shelfmark,
        "metadata": @project.metadata,
        "preferences": @project.preferences,
        "manifests": @project.manifests,
        "noteTypes": @project.noteTypes
      }
      @project.manifests.each do |manifestID, manifest|
        manifestInformation = getManifestInformation(manifest[:url])
        manifestName = manifestInformation[:name]
        if manifestName.length>50 
          manifestName = manifestName[0,47] + "..."
        end
        @projectInformation[:manifests][manifestID][:images] = manifestInformation[:images]
        @projectInformation[:manifests][manifestID][:name] = manifestName
      end

      rootMemberOrder = 1
      @groupIDs.each_with_index do | groupID, index|
        group = @project.groups.find(groupID)
        # group = Group.find(groupID)
        @groups[group.id.to_s] = { 
          "id": group.id.to_s, 
          "order": index + 1,
          "type": group.type,
          "title": group.title,
          "tacketed": group.tacketed,
          "nestLevel": group.nestLevel,
          "parentID": group.parentID,
          "notes": [],
          "memberIDs": group.memberIDs,
          "memberType": "Group",
          "memberOrder": group.parentID ? nil : rootMemberOrder
        }
        if group.nestLevel == 1
          rootMemberOrder += 1
        end
      end
      @groups.each do | group | 
        if group[1][:nestLevel] == 1
          getLeafMembers(group[1][:memberIDs])
        end
      end
      @project.leafs.each do | leaf |
        @leafs[leaf.id.to_s] = {
          "id": leaf.id.to_s,
          "order": @leafIDs.index(leaf.id.to_s) + 1,
          "material": leaf.material,
          "type": leaf.type,
          "attachment_method": leaf.attachment_method,
          "conjoined_to": leaf.conjoined_to,
          "conjoined_leaf_order": leaf.conjoined_to ? @leafIDs.index(leaf.conjoined_to) + 1 : nil,
          "attached_above": leaf.attached_above,
          "attached_below": leaf.attached_below,
          "stub": leaf.stub,
          "nestLevel": leaf.nestLevel,
          "parentID": leaf.parentID,
          "rectoID": leaf.rectoID,
          "versoID": leaf.versoID,
          "notes": [],
          "memberType": "Leaf",
          "memberOrder": @leafs[leaf.id.to_s][:memberOrder]
        }
      end
      
      @leafIDs.each do | leafID |
        leaf = @leafs[leafID]
        @rectoIDs.push(leaf[:rectoID])
        @versoIDs.push(leaf[:versoID])
      end

      @project.sides.each do | side | 
        parentOrder =  @leafIDs.index(side.parentID) + 1
        obj = {
          "id": side.id.to_s,
          "parentID": side.parentID,
          "parentOrder": parentOrder,
          "folio_number": side.folio_number ? side.folio_number : parentOrder.to_s + side.id[0],
          "texture": side.texture, 
          "image": side.image,
          "script_direction": side.script_direction,
          "notes": [],
          "memberType": side.id[0] == "R" ? "Recto" : "Verso"
        }
        if side.id[0] == "R"
          @rectos[side.id.to_s] = obj
        elsif side.id[0] == "V"
          @versos[side.id.to_s] = obj
        end
      end

      @project.notes.each do | note | 
        @notes[note.id.to_s] = {
          "id": note.id.to_s,
          "title": note.title,
          "type": note.type,
          "description": note.description,
          "show": note.show,
          "objects": note.objects,
        }
        note.objects["Group"].each do | id | 
          @groups[id][:notes].append(note.id.to_s)
        end
        note.objects["Leaf"].each do | id | 
          @leafs[id][:notes].append(note.id.to_s)
        end
        note.objects["Recto"].each do | id | 
          @rectos[id][:notes].append(note.id.to_s)
        end
        note.objects["Verso"].each do | id | 
          @versos[id][:notes].append(note.id.to_s)
        end
      end

      return {
        "project": @projectInformation,
        "groupIDs": @groupIDs,
        "leafIDs": @leafIDs,
        "rectoIDs": @rectoIDs,
        "versoIDs": @versoIDs,
        "groups": @groups,
        "leafs": @leafs,
        "rectos": @rectos,
        "versos": @versos,
        "notes": @notes,
      }
    end

    # Populate @leafIDs recursively
    def getLeafMembers(memberIDs)
      memberIDs.each_with_index do | memberID, index | 
        if memberID[0] == "G"
          getLeafMembers(@groups[memberID][:memberIDs])
          @groups[memberID][:memberOrder] = index + 1
        elsif memberID[0] == "L"
          @leafIDs.push(memberID)
          @leafs[memberID] = {"memberOrder": index + 1}
        end
      end
    end

  end
end
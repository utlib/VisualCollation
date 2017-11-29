require 'net/http'
module ControllerHelper
  module ProjectsHelper
    include ControllerHelper::LeafsHelper
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
        @projectInformation[:manifests][manifestID][:images] = manifestInformation[:images].map { |image| image.merge({manifestID: manifestID})}
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
          "sewing": group.sewing,
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
      @groups.each do | groupID, group | 
        if group[:nestLevel] == 1
          getLeafMembers(group[:memberIDs])
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
      
      

      @project.sides.each do | side | 
        parentOrder =  @leafIDs.index(side.parentID) + 1
        obj = {
          "id": side.id.to_s,
          "parentID": side.parentID,
          "parentOrder": parentOrder,
          "folio_number": side.folio_number,
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

      # Generate list of recto and verso ID's
      # Generate folio numbers for sides that do not have folio numbers parentOrder.to_s + side.id[0]
      endleafCount = 0
      folioNumberCount = 0
      @leafIDs.each do | leafID |
        leaf = @leafs[leafID]
        @rectoIDs.push(leaf[:rectoID])
        @versoIDs.push(leaf[:versoID])
        recto = @rectos[leaf[:rectoID]]
        verso = @versos[leaf[:versoID]]
        if leaf[:type] == "Endleaf"
          endleafCount += 1
          if recto[:folio_number] == nil
            recto[:folio_number] = to_roman(endleafCount) + recto[:id][0]
          end
          if verso[:folio_number] == nil
            verso[:folio_number] = to_roman(endleafCount) + verso[:id][0]
          end
        else
          if (recto[:folio_number] == nil) || (verso[:folio_number] == nil)
            folioNumberCount += 1
          end
          if recto[:folio_number] == nil
            recto[:folio_number] = (folioNumberCount).to_s + recto[:id][0]
          end
          if verso[:folio_number] == nil
            verso[:folio_number] = (folioNumberCount).to_s + verso[:id][0]
          end
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

    def roman_mapping
      {
        1000 => "m",
        900 => "cm",
        500 => "d",
        400 => "cd",
        100 => "c",
        90 => "xc",
        50 => "l",
        40 => "xl",
        10 => "x",
        9 => "ix",
        5 => "v",
        4 => "iv",
        1 => "i"
      }
    end

    def to_roman(value)
      result = ""
      number = value
      roman_mapping.keys.each do |divisor|
        quotient, modulus = number.divmod(divisor)
        result << roman_mapping[divisor] * quotient
        number = modulus
      end
      result
    end

  end
end

require 'net/http'
module ControllerHelper
  module ProjectsHelper
    include ControllerHelper::LeafsHelper
    def addGroupsLeafsConjoin(project, allGroups, folioNumber, pageNumber, startingTexture)
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
        # Add folio numbers 
        if folioNumber
          newlyAddedLeafs.each do |leaf|
            leaf.update_attribute(:folio_number, folioNumber.to_s)
            folioNumber += 1
          end
        elsif pageNumber
          newlyAddedLeafs.each do |leaf|
            recto = Side.find(leaf.rectoID)
            verso = Side.find(leaf.versoID)
            recto.update_attribute(:page_number, pageNumber.to_s)
            pageNumber += 1
            verso.update_attribute(:page_number, pageNumber.to_s)
            pageNumber += 1
          end
        end
        # Assign side texture
        assignTexture(newlyAddedLeafs, startingTexture)
      end
      # Add groups to project
      project.add_groupIDs(groupIDs, 0)
    end

    def getManifestInformation(url)
      images = []
      begin
        response = JSON.parse(Net::HTTP.get(URI(url)))
        response["sequences"][0]["canvases"].each do |canvas|
          images.push({label: canvas["label"], url: canvas["images"][0]["resource"]["service"]["@id"]})
        end
      rescue
        return {name: "Unparseable manifest URL", images: images}
      end
      return {name: response["label"][0..150], images: images}
    end

    def assignTexture(leaves, startingTexture) 
      # Create pattern of hair and flesh depending on starting texture value
      textures = [startingTexture]
      textureOptions = []
      if startingTexture == "Hair"
        textureOptions += ["Flesh", "Hair"]
      else 
        textureOptions += ["Hair", "Flesh"]
      end
      leaves.count.times do |i|
        textures += [textureOptions[i%2], textureOptions[i%2]]
      end
      # Update sides to have hair/flesh
      i = 0
      leaves.each do | leaf|
        recto = Side.find(leaf.rectoID)
        verso = Side.find(leaf.versoID)
        if leaf.conjoined_to != nil
          recto.update_attribute(:texture, textures[i])
          i += 1
          verso.update_attribute(:texture, textures[i])
          i += 1
        else 
          recto.update_attribute(:texture, "Hair")
          verso.update_attribute(:texture, "Flesh")
        end
      end
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
        "notationStyle": @project.notationStyle,
        "metadata": @project.metadata,
        "preferences": @project.preferences,
        "manifests": @project.manifests,
        "noteTypes": @project.noteTypes
      }
      @project.manifests.each do |manifestID, manifest|
        manifestInformation = getManifestInformation(manifest[:url])
        manifestName = manifest[:name] ? manifest[:name] : manifestInformation[:name]
        if manifestName.length>50 
          manifestName = manifestName[0,47] + "..."
        end
        @projectInformation[:manifests][manifestID][:images] = manifestInformation[:images].map { |image| image.merge({manifestID: manifestID})}
        @projectInformation[:manifests][manifestID][:name] = manifestName
      end
      # Generate all DIY images for this Project
      @diyImages = []
      User.find(@project.user_id).images.all.each do |image|
        if image.projectIDs.include? @project.id.to_s
          @diyImages.push({
            label: image.filename,
            url: @base_api_url+"/images/"+image.id.to_s+"_"+image.filename,
            manifestID: "DIYImages"
          })
        end
      end
      # @projectInformation[:manifests][:DIYImages] = {
      #   id: "DIYImages",
      #   images: @diyImages,
      #   name: "Uploaded Images"
      # }

      @groupIDs.each_with_index do | groupID, index|
        group = @project.groups.find(groupID)
        # group = Group.find(groupID)
        @groups[group.id.to_s] = { 
          "id": group.id.to_s, 
          "type": group.type,
          "title": group.title,
          "tacketed": group.tacketed,
          "sewing": group.sewing,
          "nestLevel": group.nestLevel,
          "parentID": group.parentID,
          "notes": [],
          "memberIDs": group.memberIDs,
          "memberType": "Group",
        }
      end
      @groups.each do | groupID, group | 
        if group[:nestLevel] == 1
          getLeafMembers(group[:memberIDs])
        end
      end
      @project.leafs.each do | leaf |
        @leafs[leaf.id.to_s] = {
          "id": leaf.id.to_s,
          "folio_number": leaf.folio_number,
          "material": leaf.material,
          "type": leaf.type,
          "conjoined_to": leaf.conjoined_to,
          "attached_above": leaf.attached_above,
          "attached_below": leaf.attached_below,
          "stub": leaf.stub,
          "nestLevel": leaf.nestLevel,
          "parentID": leaf.parentID,
          "rectoID": leaf.rectoID,
          "versoID": leaf.versoID,
          "notes": [],
          "memberType": "Leaf",
        }
      end
      
      

      @project.sides.each do | side | 
        parentOrder =  @leafIDs.index(side.parentID) + 1
        obj = {
          "id": side.id.to_s,
          "parentID": side.parentID,
          "page_number": side.page_number,
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
      @leafIDs.each do | leafID |
        leaf = @leafs[leafID]
        @rectoIDs.push(leaf[:rectoID])
        @versoIDs.push(leaf[:versoID])
      end

      @project.notes.each do | note | 
        @notes[note.id.to_s] = {
          "id": note.id.to_s,
          "title": note.title,
          "type": note.type,
          "description": note.description,
          "uri": note.uri,
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
        elsif memberID[0] == "L"
          @leafIDs.push(memberID)
        end
      end
    end
  end
end

module ControllerHelper
  module ExportHelper

    def buildJSON(project)
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
        "title": @project.title,
        "shelfmark": @project.shelfmark,
        "metadata": @project.metadata,
        "preferences": @project.preferences,
        "manifests": @project.manifests,
        "noteTypes": @project.noteTypes
      }

      rootMemberOrder = 1
      @groupIDs.each_with_index do | groupID, index|
        group = @project.groups.find(groupID)
        @groups[group.id.to_s] = { 
          "order": index + 1,
          "type": group.type,
          "title": group.title,
          "tacketed": group.tacketed,
          "nestLevel": group.nestLevel,
          "parentID": group.parentID,
          "notes": [],
          "memberOrders": group.memberIDs,
          "memberType": "Group",
          "memberOrder": group.parentID ? nil : rootMemberOrder
        }
        if group.nestLevel == 1
          rootMemberOrder += 1
        end
      end

      # Generate @leafIDs
      @groups.each do | groupID, group | 
        if group[:nestLevel] == 1
          getLeafMembers(group[:memberOrders])
        end
      end

      @project.leafs.each_with_index do | leaf, index |
        @leafs[leaf.id.to_s] = {
          "order": index + 1,
          "material": leaf.material,
          "type": leaf.type,
          "attachment_method": leaf.attachment_method,
          "conjoined_leaf_order": leaf.conjoined_to ? @leafIDs.index(leaf.conjoined_to) + 1 : nil,
          "attached_above": leaf.attached_above,
          "attached_below": leaf.attached_below,
          "stub": leaf.stub,
          "nestLevel": leaf.nestLevel,
          "parentOrder": @groups[leaf.parentID][:order],
          "rectoOrder": leaf.rectoID,
          "versoOrder": leaf.versoID,
          "notes": [],
        }
      end

      @leafIDs.each do | leafID |
        leaf = @leafs[leafID]
        @rectoIDs.push(leaf[:rectoOrder])
        @versoIDs.push(leaf[:versoOrder])
      end

      # Transform leaf recto and verso IDs to orders
      @leafs.each do | leafID, leaf |
        leaf[:rectoOrder] = @rectoIDs.index(leaf[:rectoOrder])+1
        leaf[:versoOrder] = @versoIDs.index(leaf[:versoOrder])+1
      end


      # Transform group.memberOrders to member global order and group.tacketed to leaf order
      @groups.each do | groupID, group |
        memberOrders = [] 
        group[:memberOrders].each do |memberID|
          if memberID[0] == "G"
            memberOrders.push("Group_"+@groups[memberID][:order].to_s)
          else
            memberOrders.push("Leaf_"+@leafs[memberID][:order].to_s)
          end
        end
        group[:memberOrders] = memberOrders
        if group[:tacketed] != ""
          group[:tacketed] = @leafs[group[:tacketed]][:order]
        end
      end

      @project.sides.each_with_index do | side, index | 
        parentOrder =  @leafIDs.index(side.parentID) + 1
        obj = {
          "order": index + 1,
          "parentOrder": parentOrder,
          "folio_number": side.folio_number ? side.folio_number : parentOrder.to_s + side.id[0],
          "texture": side.texture, 
          "image": side.image,
          "script_direction": side.script_direction,
        }
        if side.id[0] == "R"
          @rectos[side.id.to_s] = obj
        elsif side.id[0] == "V"
          @versos[side.id.to_s] = obj
        end
      end

      @project.notes.each do | note | 
        @notes[note.id.to_s] = {
          "title": note.title,
          "type": note.type,
          "description": note.description,
          "show": note.show,
          "objects": {}
        }
        @notes[note.id.to_s][:objects][:Group] = note.objects["Group"].map { |groupID| @groups[groupID][:order] }
        @notes[note.id.to_s][:objects][:Leaf] = note.objects["Leaf"].map { |leafID| @leafs[leafID][:order]}
        @notes[note.id.to_s][:objects][:Recto] = note.objects["Recto"].map { |rectoID| @rectos[rectoID][:order]}
        @notes[note.id.to_s][:objects][:Verso] = note.objects["Verso"].map { |versoID| @versos[versoID][:order]}
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


    # Populate leaf orders recursively
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


    def buildDotModel(project)
      xml = Nokogiri::XML::Builder.new { |xml| 
        xml.manuscript do
          xml.title project.title
          xml.shelfmark project.shelfmark
          project.groups.each_with_index do |group|
            xml.quire :n => group.order, :level => group.getNestLevel do
              leafIndex = 1
              group.get_members.each do |member|
                if member[:type]=="Leaf"
                  leaf = Leaf.find(member[:id])
                  n = leafIndex
                  mode = leaf.type
                  conjoinedLeaf = project.leafs.find(leaf.conjoined_to)
                  single = conjoinedLeaf.order < 1
                  conjoin = ""
                  if not single
                    conjoin = Grouping.find_by(member_id: conjoinedLeaf.id)[:order]
                  end
                  position = member[:order]
                  folio_number = leaf.sides[0].folio_number[/\d+/]
                  xml.leaf :n => n, :mode => mode, :single => single, :folio_number => folio_number, :conjoin => conjoin, :position => position
                leafIndex += 1
                end
              end
            end
          end
        end
      }.to_xml
      return xml
    end

    def buildFormula(project)
      result = "*4 x1 A-D12 E12 (E7 + 2x1) F-H12 I12 (I3 + 3x1) K-M12 N12 (N5 + 4x1) O-Q12"
      return result 
    end


  end
end
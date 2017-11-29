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
        @groups[index + 1] = { 
          "params": {
            "type": group.type,
            "title": group.title,
            "nestLevel": group.nestLevel
          },
          "tacketed": group.tacketed,
          "sewing": group.sewing,
          "parentOrder": group.parentID,
          "memberOrders": group.memberIDs
        }
        if group.nestLevel == 1
          rootMemberOrder += 1
        end
      end

      # Generate @leafIDs list
      @groups.each do | groupOrder, group | 
        if group[:params][:nestLevel] == 1
          getLeafMemberOrders(group[:memberOrders])
        end
      end

      @leafIDs.each_with_index do | leafID, index |
        leaf = @project.leafs.find(leafID)
        @leafs[index + 1] = {
          "params": {
            "material": leaf.material,
            "type": leaf.type,
            "attachment_method": leaf.attachment_method,
            "attached_above": leaf.attached_above,
            "attached_below": leaf.attached_below,
            "stub": leaf.stub,
            "nestLevel": leaf.nestLevel
          },
          "conjoined_leaf_order": leaf.conjoined_to ? @leafIDs.index(leaf.conjoined_to) + 1 : nil,
          "parentOrder": @groupIDs.index(leaf.parentID)+1,
          "rectoOrder": index + 1,
          "versoOrder": index + 1,
        }
        @rectoIDs.push(leaf.rectoID)
        @versoIDs.push(leaf.versoID)
      end

      # Transform group's members to global orders
      # Transform group's tacketed and sewing to leaf global orders
      # Transform group's parentID to group global order
      @groups.each do | groupID, group |
        memberOrders = [] 
        group[:memberOrders].each do |memberID|
          if memberID[0] == "G"
            memberOrders.push("Group_" + (@groupIDs.index(memberID)+1).to_s)
          else
            memberOrders.push("Leaf_" + (@leafIDs.index(memberID)+1).to_s)
          end
        end
        group[:memberOrders] = memberOrders
        tacketedLeafOrders, sewingLeafOrders = [], []
        group[:tacketed].each do |leafID| tacketedLeafOrders.push(@leafIDs.index(leafID)+1) end
        group[:sewing].each do |leafID| sewingLeafOrders.push(@leafIDs.index(leafID)+1) end
        group[:tacketed], group[:sewing] = tacketedLeafOrders, sewingLeafOrders
        group[:parentOrder] = group[:parentOrder] ? @groupIDs.index(group[:parentOrder]) + 1 : nil
      end

      @rectoIDs.each_with_index do | rectoID, index |
        recto = @project.sides.find(rectoID)
        parentOrder =  @leafIDs.index(recto.parentID) + 1
        @rectos[index + 1] = {
          "params": {
            "folio_number": recto.folio_number ? recto.folio_number : parentOrder.to_s + recto.id[0],
            "texture": recto.texture, 
            "image": recto.image,
            "script_direction": recto.script_direction
          },
          "parentOrder": parentOrder
        }
      end

      @versoIDs.each_with_index do | versoID, index |
        verso = @project.sides.find(versoID)
        parentOrder =  @leafIDs.index(verso.parentID) + 1
        @versos[index + 1] = {
          "params": {
            "folio_number": verso.folio_number ? verso.folio_number : parentOrder.to_s + verso.id[0],
            "texture": verso.texture, 
            "image": verso.image,
            "script_direction": verso.script_direction
          },
          "parentOrder": parentOrder
        }
      end

      @project.notes.each_with_index do | note, index | 
        @notes[index + 1] = {
          "params": {
            "title": note.title,
            "type": note.type,
            "description": note.description,
            "show": note.show
          },
          "objects": {}
        }
        @notes[index + 1][:objects][:Group] = note.objects["Group"].map { |groupID| @groupIDs.index(groupID)+1 }
        @notes[index + 1][:objects][:Leaf] = note.objects["Leaf"].map { |leafID| @leafIDs.index(leafID)+1 }
        @notes[index + 1][:objects][:Recto] = note.objects["Recto"].map { |rectoID| @rectoIDs.index(rectoID)+1 }
        @notes[index + 1][:objects][:Verso] = note.objects["Verso"].map { |versoID| @versoIDs.index(versoID)+1 }
      end

      return {
        "project": @projectInformation,
        "groups": @groups,
        "leafs": @leafs,
        "rectos": @rectos,
        "versos": @versos,
        "notes": @notes,
      }
    end


    # Populate leaf orders recursively
    def getLeafMemberOrders(memberIDs)
      memberIDs.each_with_index do | memberID, index | 
        if memberID[0] == "G"
          getLeafMemberOrders(@groups[@groupIDs.index(memberID)+1][:memberOrders])
        elsif memberID[0] == "L"
          @leafIDs.push(memberID)
        end
      end
    end





    def buildDotModel(project)
      @groupIDs = project.groupIDs
      @leafIDs = []
      @leafs = {}
      @groups = {}
      @rectos = {}
      @versos = {}
      return Nokogiri::XML::Builder.new { |xml|
        xml.viscoll :xmlns => "http://schoenberginstitute.org/schema/collation" do
          xml.manuscript do
            xml.title project.title
            xml.shelfmark project.shelfmark
            xml.date project.metadata[:date]
            xml.direction :val => "l-r"
            idPrefix = project.shelfmark.parameterize.underscore
            xml.quires do
              @groupIDs.each_with_index do |groupID, index|
                group = project.groups.find(groupID)
                getLeafMemberIDs(group.memberIDs, project)
                parents = parentsOrders(groupID, project)
                groupMemberOrder = parents.pop
                idPostfix = parents.empty? ? groupMemberOrder.to_s : parents.join("-")+"-"+groupMemberOrder.to_s
                quireAttributes = {}
                quireAttributes["xml:id"] = idPrefix+"-q-"+idPostfix
                quireAttributes[:n] = index + 1
                quireAttributes[:certainty] = 1
                if group.parentID
                  quireAttributes[:parent] = idPrefix+"-q-"+(@groupIDs.index(group.parentID)+1).to_s
                end
                xml.quire quireAttributes do
                  xml.text index + 1
                end
                @groups[groupID] = quireAttributes["xml:id"]
              end
            end
            @leafIDs.each_with_index do |leafID, index|
              leaf = project.leafs.find(leafID)
              parents = parentsOrders(leafID, project)
              leafMemberOrder = parents.pop
              idPostfix = parents.join("-")+"-"+leafMemberOrder.to_s
              leafAttributes = {}
              leafAttributes["xml:id"] = idPrefix+"-"+idPostfix
              leafAttributes["stub"] = "yes" if leaf.stubType != "None"
              xml.leaf leafAttributes do
                folioNumber = {}
                folioNumber[:val] = @leafIDs.index(leafID)+1
                folioNumber[:certainty] = 1
                xml.folioNumber folioNumber do
                  xml.text folioNumber[:val].to_s
                end

                mode = {}
                if leaf.type != "None"
                  mode[:val] = leaf.type.downcase
                  mode[:certainty] = 1
                end
                xml.mode mode

                qAttributes = {}
                qAttributes[:position] = leafMemberOrder
                qAttributes[:leafno] = leafMemberOrder
                qAttributes[:certainty] = 1
                qAttributes[:target] = "#"+idPrefix+"-q-"+parents.join("-")
                qAttributes[:n] = parents[-1]
                xml.q qAttributes do
                  if leaf.conjoined_to
                    idPostfix = parents.join("-")+"-"+@leafs[leaf.conjoined_to][:memberOrder].to_s
                    xml.conjoin :certainty => 1, :target => "#"+idPrefix+"-"+idPostfix
                  end
                end

                if not leaf.conjoined_to
                  xml.single :val => "yes"
                end

                if leaf.attached_above != "None" or leaf.attached_below != "None"
                  targetLeafAbove = parents.join("-")+"-"+(leafMemberOrder.to_i-1).to_s
                  targetLeafBelow = parents.join("-")+"-"+(leafMemberOrder.to_i+1).to_s
                  if leaf.attached_above != "None" and leaf.attached_below != "None"
                    xml.send("attachment-method", :certainty => 1, :target => "#"+targetLeafAbove+" #"+targetLeafBelow, :type => leaf.attached_above) do
                      xml.text leaf.attached_above + "_To_Above_and_Below"
                    end
                  elsif leaf.attached_above != "None"
                    xml.send("attachment-method", :certainty => 1, :target => "#"+targetLeafAbove, :type => leaf.attached_above) do
                      xml.text leaf.attached_above + "_To_Above"
                    end
                  elsif leaf.attached_below != "None"
                    xml.send("attachment-method", :certainty => 1, :target => "#"+targetLeafBelow, :type => leaf.attached_below) do
                      xml.text leaf.attached_below + "_To_Below"
                    end
                  end
                end

                rectoSide = project.sides.find(leaf.rectoID)
                rectoAttributes = {}
                rectoAttributes["xml:id"] = leafAttributes["xml:id"]+"-R"
                rectoAttributes[:type] = "Recto"
                if rectoSide.folio_number
                  rectoAttributes[:folioNumber] = rectoSide.folio_number
                else
                  rectoAttributes[:folioNumber] = folioNumber[:val].to_s+"R"
                end
                rectoAttributes[:texture] = rectoSide.texture unless rectoSide.texture == "None"
                rectoAttributes[:script_direction] = rectoSide.script_direction unless rectoSide.script_direction == "None"
                rectoAttributes[:image] = rectoSide.image[:url] unless rectoSide.image.empty?
                rectoAttributes[:target] = "#"+leafAttributes["xml:id"]
                # xml.side rectoAttributes
                @rectos[leaf.rectoID] = rectoAttributes

                versoSide = project.sides.find(leaf.versoID)
                versoAttributes = {}
                versoAttributes["xml:id"] = leafAttributes["xml:id"]+"-V"
                versoAttributes[:type] = "Verso"
                if versoSide.folio_number
                  versoAttributes[:folioNumber] = versoSide.folio_number
                else
                  versoAttributes[:folioNumber] = folioNumber[:val].to_s+"R"
                end
                versoAttributes[:texture] = versoSide.texture unless versoSide.texture == "None"
                versoAttributes[:script_direction] = versoSide.script_direction unless versoSide.script_direction == "None"
                versoAttributes[:image] = versoSide.image[:url] unless versoSide.image.empty?
                versoAttributes[:target] = "#"+leafAttributes["xml:id"]
                # xml.side versoAttributes
                @versos[leaf.versoID] = versoAttributes
              end
              @leafs[leafID]["xmlID"] = leafAttributes["xml:id"]
            end

            project.notes.each_with_index do |note, index| 
              noteAttributes = {}
              noteAttributes["xml:id"] = idPrefix+"-n-"+(index+1).to_s
              noteAttributes[:type] = note.type
              linkedObjectIDs = []
              note.objects["Group"].each do |groupID|
                linkedObjectIDs.push("#"+@groups[groupID])
              end
              note.objects["Leaf"].each do |leafID|
                linkedObjectIDs.push("#"+@leafs[leafID]["xmlID"])
              end
              note.objects["Recto"].each do |rectoID|
                linkedObjectIDs.push("#"+@rectos[rectoID]["xml:id"])
              end
              note.objects["Verso"].each do |versoID|
                linkedObjectIDs.push("#"+@versos[versoID]["xml:id"])
              end
              noteAttributes[:target] = linkedObjectIDs.join(" ")
              xml.note noteAttributes do
                xml.text note.title + ": " + note.description
              end
            end

            # @rectos.each do |rectoID, rectoAttributes|
            #   noteAttributes = {}
            #   noteAttributes["xml:id"] = rectoAttributes["xml:id"]
            #   noteAttributes[:target] = rectoAttributes[:target]
            #   noteAttributes[:type] = "Recto"
            #   # noteAttributes[:texture] = rectoAttributes[:texture]
            #   xml.note noteAttributes do
            #     xml.text rectoAttributes[:folioNumber]
            #   end
            # end

          end

          xml.mapping do 
            @rectos.each do |rectoID, attributes|
              if attributes[:image]
                mapAttributes = {}
                mapAttributes[:side] = attributes["xml:id"]
                mapAttributes[:target] = attributes[:image]
                xml.map mapAttributes do
                  termAttributes = {}
                  termAttributes[:target] = attributes[:image]
                  xml.term termAttributes
                end
              end
            end
          end

        end
      }.to_xml
    end


    # Populate leaf orders recursively
    def getLeafMemberIDs(memberIDs, project, leafMember=1)
      memberIDs.each_with_index do | memberID, index | 
        if memberID[0] == "G"
          getLeafMemberIDs(project.groups.find(memberID).memberIDs, project, leafMember)
        elsif memberID[0] == "L"
          if not @leafIDs.include? memberID
            @leafIDs.push(memberID)
            @leafs[memberID] = {"memberOrder": leafMember}
            leafMember += 1
          end
        end
      end
    end

    # Get all parent orders upto root
    def parentsOrders(memberID, project)
      result = []
      if memberID
        if memberID[0] == "G"
          result = parentsOrders(project.groups.find(memberID).parentID, project) + [(@groupIDs.index(memberID)+1).to_s]
        else
          result = parentsOrders(project.leafs.find(memberID).parentID, project) + [@leafs[memberID][:memberOrder].to_s]
        end
      end
      return result
    end



  end
end


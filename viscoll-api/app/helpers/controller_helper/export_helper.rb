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
        "notationStyle": @project.notationStyle,
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
            "folio_number": leaf.folio_number ? leaf.folio_number : '',
            "material": leaf.material,
            "type": leaf.type,
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
            "page_number": recto.page_number ? recto.page_number : "",
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
            "page_number": verso.page_number ? verso.page_number : "",
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
        if note.uri.present?
          @notes[index + 1][:params][:uri] = note.uri
        end

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
      @groups = {}
      @leafIDs = []
      @leafs = {}
      @rectos = {}
      @versos = {}
      @notes = {}
      @noteTitles = []
      @allGroupAttributeValues = []
      @allLeafAttributeValues = []
      @allSideAttributeValues = []
      @groupIDs.each_with_index do |groupID, index|
        if @groups.key?(groupID)
          memberOrder = @groups[groupID][:memberOrder]
          @groups[groupID] = project.groups.find(groupID)
          @groups[groupID][:memberOrder] = memberOrder
        else
          @groups[groupID] = project.groups.find(groupID)
          @groups[groupID][:memberOrder] = index+1
        end
        if @groups[groupID][:memberIDs]
          populateLeafSideObjects(@groups[groupID][:memberIDs], project)
        end
      end

      return Nokogiri::XML::Builder.new { |xml|
        xml.viscoll :xmlns => "http://schoenberginstitute.org/schema/collation" do
          idPrefix = project.shelfmark.parameterize.underscore

          # STRUCTURE
          xml.textblock do
            xml.title project.title
            xml.shelfmark project.shelfmark
            xml.date project.metadata[:date]
            xml.direction :val => "l-r"
            idPrefix = project.shelfmark.parameterize.underscore
            xml.quires do
              @groupIDs.each_with_index do |groupID, index|
                group = @groups[groupID]
                parents = parentsOrders(groupID, project)
                groupOrder = parents.pop
                groupMemberOrder = group["memberOrder"]
                idPostfix = parents.empty? ? groupOrder.to_s : parents.join("-")+"-"+groupOrder.to_s
                quireAttributes = {}
                quireAttributes["xml:id"] = idPrefix+"-q-"+idPostfix
                quireAttributes[:n] = index + 1
                quireAttributes[:certainty] = 1
                if group.parentID
                  quireAttributes[:parent] = idPrefix+"-q-"+parents.join("-")
                end
                xml.quire quireAttributes do
                  xml.text index + 1
                end
                @groups[groupID]["xmlID"] = quireAttributes["xml:id"]
              end
            end
            xml.leaves do
              @leafIDs.each_with_index do |leafID, index|
                leaf = project.leafs.find(leafID)
                parents = parentsOrders(leafID, project)
                leafemberOrder = parents.pop
                idPostfix = parents.join("-")+"-"+leafemberOrder.to_s
                leafAttributes = {}
                leafAttributes["xml:id"] = idPrefix+"-"+idPostfix
                leafAttributes["stub"] = "yes" if leaf.stubType != "None"
                xml.leaf leafAttributes do
                  folioNumberAttr = {}
                  folioNumberAttr[:certainty] = 1

                  rectoSide = project.sides.find(leaf.rectoID)
                  versoSide = project.sides.find(leaf.versoID)
                  if leaf.folio_number
                    folioNumber = leaf.folio_number
                    folioNumberAttr[:val] = folioNumber
                    xml.folioNumber folioNumberAttr do
                      xml.text folioNumber
                    end
                  end

                  if rectoSide.page_number
                    pageNumber = "#{rectoSide.page_number.to_s}-#{versoSide.page_number.to_s}"
                    folioNumberAttr[:val] = pageNumber
                    xml.folioNumber folioNumberAttr do
                      xml.text pageNumber
                    end
                  end

                  mode = {}
                  if ['original', 'added', 'replaced', 'false', 'missing'].include? leaf.type.downcase
                    mode[:val] = leaf.type.downcase
                    mode[:certainty] = 1
                  end
                  xml.mode mode

                  qAttributes = {}
                  qAttributes[:position] = project.groups.find(leaf.parentID).memberIDs.index(leafID)+1
                  qAttributes[:leafno] = leafemberOrder
                  qAttributes[:certainty] = 1
                  qAttributes[:target] = "#"+idPrefix+"-q-"+parents.join("-")
                  qAttributes[:n] = parents[-1]
                  xml.q qAttributes do
                    if leaf.conjoined_to
                      idPostfix = parents.join("-")+"-"+@leafs[leaf.conjoined_to][:memberOrder].to_s
                      xml.conjoin :certainty => 1, :target => "#"+idPrefix+"-"+idPostfix
                    end
                  end

                  # if not leaf.conjoined_to
                  #   xml.single :val => "yes"
                  # end

                  rectoSide = project.sides.find(leaf.rectoID)
                  rectoAttributes = {}
                  rectoAttributes["xml:id"] = leafAttributes["xml:id"]
                  rectoAttributes[:type] = "Recto"
                  if rectoSide.page_number
                    rectoAttributes[:page_number] = rectoSide.page_number
                  else 
                    rectoAttributes[:page_number] = "EMPTY"
                  end
                  rectoAttributes[:texture] = rectoSide.texture unless rectoSide.texture == "None"
                  rectoAttributes[:script_direction] = rectoSide.script_direction unless rectoSide.script_direction == "None"
                  rectoAttributes[:image] = rectoSide.image[:url] unless rectoSide.image.empty?
                  rectoAttributes[:target] = "#"+leafAttributes["xml:id"]
                  # xml.side rectoAttributes
                  @rectos[leaf.rectoID] = rectoAttributes
                  @rectos[leaf.rectoID]["recto"] = rectoSide
                  versoSide = project.sides.find(leaf.versoID)
                  versoAttributes = {}
                  versoAttributes["xml:id"] = leafAttributes["xml:id"]
                  versoAttributes[:type] = "Verso"
                  if versoSide.page_number
                    versoAttributes[:page_number] = versoSide.page_number
                  else 
                    versoAttributes[:page_number] = "EMPTY"
                  end
                  versoAttributes[:texture] = versoSide.texture unless versoSide.texture == "None"
                  versoAttributes[:script_direction] = versoSide.script_direction unless versoSide.script_direction == "None"
                  versoAttributes[:image] = versoSide.image[:url] unless versoSide.image.empty?
                  versoAttributes[:target] = "#"+leafAttributes["xml:id"]
                  # xml.side versoAttributes
                  @versos[leaf.versoID] = versoAttributes
                  @versos[leaf.versoID]["verso"] = versoSide
                end
                @leafs[leafID]["xmlID"] = leafAttributes["xml:id"]
              end
            end
          end

          # Creating taxonomies from note types
          if not project.notes.empty?
            project.noteTypes.each do |noteType|
              unless noteType = 'Unknown'
                taxAtt = {'xml:id': "taxonomy_#{noteType.parameterize.underscore}"}
                xml.taxonomy taxAtt do 
                  xml.label do 
                    xml.text noteType
                  end
                  # grab an array of notes with the current noteType
                  children = project.notes.select {|note| note.type == noteType}
                  
                  # add proper attributes and crete term elements
                  children.each do |childNote|
                    termAttributes = {'xml:id': "term_#{childNote._id}"}
                    if childNote.uri.present?
                      termAttributes['ref'] = childNote.uri
                    end
                    xml.term termAttributes do
                      xml.text childNote.title
                    end
                  end
                end
              end
            end
          end

          # Project Attributes Taxonomy
          ['preferences'].each do |attribute|
            manuscriptAttribute = {"xml:id": 'manuscript_'+attribute}
            xml.taxonomy manuscriptAttribute do
              xml.label do
                xml.text 'Manuscript ' + attribute
              end
              project[attribute].each do |key, value|
                termID = {"xml:id": "manuscript_"+attribute+"_"+idPrefix+"_"+key}
                xml.term termID do
                  xml.text value
                end
              end
            end
          end
          if not project.manifests.empty?
            manifestAttribute = {"xml:id": 'manifests'}
            xml.taxonomy manifestAttribute do
              xml.label do
                xml.text 'List of Manifests'
              end
              project.manifests.each do |manifestID, manifest|
                termID = {"xml:id": 'manifest_'+manifest["id"]}
                xml.term termID do
                  xml.text manifest["url"]
                end
              end
            end
          end

          # Group Attributes Taxonomy
          ['title', 'type'].each do |attribute|
            groupAttribute = {"xml:id": 'group_'+attribute}
            xml.taxonomy groupAttribute do
              xml.label do
                xml.text 'List of values for Group ' + attribute
              end
              groupAttributeValues = []
              @groupIDs.each do |groupID|
                group = @groups[groupID]
                if not groupAttributeValues.include? group[attribute]
                  groupAttributeValues.push(group[attribute])
                end
              end
              groupAttributeValues.each do |attributeValue| 
                termID = {"xml:id": "group_"+attribute+"_"+attributeValue.parameterize.underscore}
                xml.term termID do
                  xml.text attributeValue
                end
              end
              @allGroupAttributeValues = @allGroupAttributeValues + groupAttributeValues
            end
          end
          ['tacketed', 'sewing'].each do |attribute|
            groupAttribute = {"xml:id": 'group_'+attribute}
            groupAttributeValues = []
            @groupIDs.each do |groupID|
              group = @groups[groupID]
              leaves = ""
              if not groupAttributeValues.include? group[attribute]
                group[attribute].each do |leafID|
                  parents = parentsOrders(leafID, project)
                  leafemberOrder = parents.pop
                  idPostfix = parents.join("-")+"-"+leafemberOrder.to_s
                  leaves = leaves + " #" + idPrefix+"-"+idPostfix + " "
                  leaves = leaves.strip
                end
              end
              if leaves != ""
                xml.taxonomy groupAttribute do
                  xml.label do
                    xml.text 'List of Groups ' + attribute
                  end
                  parents = parentsOrders(groupID, project)
                  groupOrder = parents.pop
                  groupMemberOrder = group["memberOrder"]
                  idPostfix = parents.empty? ? groupOrder.to_s : parents.join("-")+"-"+groupOrder.to_s
                  termID = {"xml:id": "group_"+attribute+"_"+idPrefix+"-q-"+idPostfix}
                  xml.term termID do
                    xml.text leaves
                  end
                end
                @allGroupAttributeValues = @allGroupAttributeValues + [leaves]
              end
            end
          end
          # Member IDs of each Group
          groupAttribute = {"xml:id": 'group_members'}
          xml.taxonomy groupAttribute do
            xml.label do
              xml.text 'List of values for each Group\'s members'
            end
            @groupIDs.each do |groupID|
              group = @groups[groupID]
              memberIDs = []
              group.memberIDs.each do |memberID|
                parents = parentsOrders(memberID, project)
                memberOrder = parents.pop
                if memberID[0]=="G"
                  idPostfix = parents.empty? ? memberOrder.to_s : parents.join("-")+"-"+memberOrder.to_s
                  memberIDs.push(idPrefix+"-q-"+idPostfix)
                else
                  idPostfix = parents.join("-")+"-"+memberOrder.to_s
                  memberIDs.push(idPrefix+"-"+idPostfix)
                end
                
              end
              memberIDs = memberIDs.join(" #").strip
              parents = parentsOrders(groupID, project)
              groupOrder = parents.pop
              groupMemberOrder = group["memberOrder"]
              idPostfix = parents.empty? ? groupOrder.to_s : parents.join("-")+"-"+groupOrder.to_s
              termID = {"xml:id": "group_members_"+idPrefix+"-q-"+idPostfix}
              xml.term termID do
                xml.text "#"+memberIDs
              end
            end
          end

          # Leaf Attributes Taxonomy
          ['material'].each do |attribute|
            leafAttribute = {"xml:id": 'leaf_'+attribute}
            leafAttributeValues = []
            @leafIDs.each do |leafID|
              leaf = @leafs[leafID]
              if not leafAttributeValues.include? leaf[attribute] and leaf[attribute] != "None"
                leafAttributeValues.push(leaf[attribute])
              end
            end
            if not leafAttributeValues.empty?
              xml.taxonomy leafAttribute do
                xml.label do
                  xml.text 'List of values for Leaf ' + attribute
                end
                leafAttributeValues.each do |attributeValue| 
                  termID = {"xml:id": "leaf_"+attribute+"_"+attributeValue.parameterize.underscore}
                  xml.term termID do
                    xml.text attributeValue
                  end
                end
                @allLeafAttributeValues += leafAttributeValues
              end
            end
          end
          leafAttribute = {"xml:id": 'leaf_attachment_method'}
          xml.taxonomy leafAttribute do
            xml.label do
              xml.text 'List of Attachment Methods'
            end
            ['Glued_Above_Partial', 'Glued_Above_Complete', 'Glued_Above_Drumming', 'Glued_Above_Other'].each do |attribute|
              termID = {"xml:id": attribute}
              xml.term termID do
                xml.text attribute.split("_")[0]+" ("+attribute.split("_")[2]+")"
              end
            end
            ['Glued_Below_Partial', 'Glued_Below_Complete', 'Glued_Below_Drumming', 'Glued_Below_Other'].each do |attribute|
              termID = {"xml:id": attribute}
              xml.term termID do
                xml.text attribute.split("_")[0]+" ("+attribute.split("_")[2]+")"
              end
            end
          end

          # Side Attributes Taxonomy
          ['texture', 'script_direction', 'page_number'].each do |attribute|
            sideAttribute = {"xml:id": 'side_'+attribute}
            sideAttributeValues = []
            @rectos.each do |rectoID, recto|
              if recto[attribute] == nil and not sideAttributeValues.include? "EMPTY" 
                sideAttributeValues.push("EMPTY")
              elsif recto[attribute] != nil and not sideAttributeValues.include? recto[attribute] and recto[attribute] != "None"
                sideAttributeValues.push(recto[attribute])
              end
            end
            @versos.each do |versoID, verso|
              if verso[attribute] == nil and not sideAttributeValues.include? "EMPTY" 
                sideAttributeValues.push("EMPTY")
              elsif verso[attribute] != nil and not sideAttributeValues.include? verso[attribute] and  verso[attribute] != "None"
                sideAttributeValues.push(verso[attribute])
              end
            end
            if not sideAttributeValues.empty?
              xml.taxonomy sideAttribute do
                xml.label do
                  xml.text 'List of values for Side ' + attribute
                end
                sideAttributeValues.each do |attributeValue| 
                  if attributeValue
                    termID = {"xml:id": "side_"+attribute+"_"+attributeValue.parameterize.underscore}
                    xml.term termID do
                      xml.text attributeValue
                    end
                  end
                end
                @allSideAttributeValues += sideAttributeValues
              end
            end
          end

          # Note Attributes Taxonomy
          if not project.notes.empty?
            noteTitle = {"xml:id": 'note_title'}
            xml.taxonomy noteTitle do  
              xml.label do
                xml.text 'List of values for Note Titles'
              end
              project.notes.each_with_index do |note, index| 
                if not @noteTitles.include? note.title
                  @noteTitles.push(note.title)
                end
              end
              @noteTitles.each do |noteTitle|
                termID = {"xml:id": "note_title"+"_"+noteTitle.parameterize.underscore}
                xml.term termID do
                  xml.text noteTitle
                end
              end
            end
            noteShow = {"xml:id": 'note_show'}
            xml.taxonomy noteShow do  
              xml.label do
                xml.text 'Whether to show Note in Visualizations'
              end
              termID = {"xml:id": "note_show"}
              xml.term termID do
                xml.text true
              end
            end
          end

          # NOTES
          # if not project.notes.empty?
          #   xml.notes do
          #     project.notes.each_with_index do |note, index| 
          #       noteAttributes = {}
          #       noteAttributes["xml:id"] = idPrefix+"-n-"+(index+1).to_s
          #       noteAttributes[:type] = note.type
          #       xml.note noteAttributes do
          #         xml.text note.description
          #       end
          #       @notes[note.id.to_s] = {}
          #       @notes[note.id.to_s]["xml:id"] = "#"+noteAttributes["xml:id"]
          #       @notes[note.id.to_s][:note] = note
          #     end
          #   end
          # end

          # MAPPING
          xml.mapping do 
            # Map quires to attributes and notes and memberIDs
            @groupIDs.each do |groupID|
              group = @groups[groupID]
              parents = parentsOrders(groupID, project)
              groupOrder = parents.pop
              groupMemberOrder = group["memberOrder"]
              idPrefix = project.shelfmark.parameterize.underscore
              idPostfix = parents.empty? ? groupOrder.to_s : parents.join("-")+"-"+groupOrder.to_s
              linkedNotes = (group.notes.map {|note| "#note_title"+"_"+note.title.parameterize.underscore}).join(" ")
              linkedAttributes = []
              ['title', 'type'].each do |attribute|
                attributeValue = group[attribute]
                if @allGroupAttributeValues.include? attributeValue
                  linkedAttributes.push("group_"+attribute+"_"+attributeValue.parameterize.underscore)
                end
              end
              ['tacketed', 'sewing'].each do |attribute|
                attributeValue = ""
                group[attribute].each do |leafID|
                  parents = parentsOrders(leafID, project)
                  leafemberOrder = parents.pop
                  idPostfix = parents.join("-")+"-"+leafemberOrder.to_s
                  attributeValue = attributeValue + " #" + idPrefix+"-"+idPostfix + " "
                  attributeValue = attributeValue.strip
                end
                if @allGroupAttributeValues.include? attributeValue
                  parents = parentsOrders(groupID, project)
                  groupOrder = parents.pop
                  groupMemberOrder = group["memberOrder"]
                  idPostfix = parents.empty? ? groupOrder.to_s : parents.join("-")+"-"+groupOrder.to_s
                  linkedAttributes.push("group_"+attribute+"_"+idPrefix+"-q-"+idPostfix)
                end
              end
              linkedAttributes = linkedAttributes.join(" #")
              if linkedNotes+linkedAttributes != ""
                xml.map :target => "#"+idPrefix+"-q-"+idPostfix do
                  if linkedAttributes != ""
                    xml.term :target => linkedNotes+" #"+linkedAttributes+" #group_members_"+idPrefix+"-q-"+idPostfix
                  else
                    xml.term :target => linkedNotes+" #group_members_"+idPrefix+"-q-"+idPostfix
                  end
                end
              end
            end
            # Map leaves to attributes and notes
            @leafIDs.each do |leafID|
              leaf = @leafs[leafID]
              parents = parentsOrders(leafID, project)
              leafemberOrder = parents.pop
              idPostfix = parents.join("-")+"-"+leafemberOrder.to_s
              linkedNotes = (leaf.notes.map {|note| "#note_title"+"_"+note.title.parameterize.underscore}).join(" ")
              attachementMethods = []
              if leaf.attached_above != "None"
                if leaf.attached_above == "Other"
                  attachementMethods.push("#Glued_Above_Other")
                else
                  attachementMethods.push("#Glued_Above_"+leaf.attached_above.split(" ")[1][1..-2])
                end
              end
              if leaf.attached_below != "None"
                if leaf.attached_below == "Other"
                  attachementMethods.push("#Glued_Below_Other")
                else
                  attachementMethods.push("#Glued_Below_"+leaf.attached_below.split(" ")[1][1..-2])
                end
              end
              attachementMethods = attachementMethods.join(" ").strip
              material = ""
              if @allLeafAttributeValues.include? leaf.material and material != ""
                material = "#leaf_material_"+leaf.material.parameterize.underscore.strip
              end
              if linkedNotes+attachementMethods+material != ""
                xml.map :target => "#"+idPrefix+"-"+idPostfix do
                  xml.term :target => (linkedNotes+" "+material+attachementMethods).strip
                end
              end
            end
            # Map rectos to attributes and notes and sides
            @rectos.each do |rectoID, attributes|
              recto = attributes["recto"]
              linkedNotes = (recto.notes.map {|note| "#note_title"+"_"+note.title.parameterize.underscore}).join(" ")
              linkedImage = recto.image.empty? ? "" : recto.image[:url]
              linkedAttributes = []
              ['texture', 'script_direction', 'page_number'].each do |attribute|
                attributeValue = recto[attribute]
                if @allSideAttributeValues.include? attributeValue and attributeValue
                  linkedAttributes.push("side_"+attribute+"_"+attributeValue.parameterize.underscore)
                elsif attributeValue==nil and attribute=="page_number" and @allSideAttributeValues.include? "EMPTY"
                  linkedAttributes.push("side_"+attribute+"_EMPTY")
                end
              end
              linkedAttributes = linkedAttributes.empty? ? "" : linkedAttributes.join(" #")
              if linkedNotes+linkedImage+linkedAttributes.strip != ""
                if linkedAttributes != ""
                  termText = linkedNotes.strip+" #"+linkedAttributes
                  if linkedImage != ""
                    termText = termText+" "+linkedImage+" #manifest_"+recto.image[:manifestID] 
                  end
                  xml.map :side => 'recto', :target => "#"+attributes["xml:id"] do
                    xml.term :target => termText.strip
                  end
                else
                  termText = linkedNotes.strip
                  if linkedImage != ""
                    termText = termText+" "+linkedImage+" #manifest_"+recto.image[:manifestID] 
                  end
                  xml.map :side => 'recto', :target => "#"+attributes["xml:id"] do
                    xml.term :target => termText.strip
                  end
                end
              end
            end
            # Map versos to attributes and notes and sides
            @versos.each do |versoID, attributes|
              verso = attributes["verso"]
              linkedNotes = (verso.notes.map {|note| "#note_title"+"_"+note.title.parameterize.underscore}).join(" ")
              linkedImage = verso.image.empty? ? "" : verso.image[:url]
              linkedAttributes = []
              ['texture', 'script_direction', 'page_number'].each do |attribute|
                attributeValue = verso[attribute]
                if @allSideAttributeValues.include? attributeValue and attributeValue
                  linkedAttributes.push("side_"+attribute+"_"+attributeValue.parameterize.underscore)
                elsif attributeValue==nil and attribute=="page_number" and @allSideAttributeValues.include? "EMPTY"
                  linkedAttributes.push("side_"+attribute+"_EMPTY")
                end
              end
              linkedAttributes = linkedAttributes.empty? ? "" : linkedAttributes.join(" #")
              if linkedNotes+linkedImage+linkedAttributes.strip != ""
                if linkedAttributes != ""
                  termText = linkedNotes.strip+" #"+linkedAttributes
                  if linkedImage != ""
                    termText = termText+" "+linkedImage+" #manifest_"+verso.image[:manifestID] 
                  end
                  xml.map :side => 'verso', :target => "#"+attributes["xml:id"] do
                    xml.term :target => termText.strip
                  end
                else
                  termText = linkedNotes.strip
                  if linkedImage != ""
                    termText = termText+" "+linkedImage+" #manifest_"+verso.image[:manifestID] 
                  end
                  xml.map :side => 'verso', :target => "#"+attributes["xml:id"] do
                    xml.term :target => termText.strip
                  end
                end
              end
            end
            # Map notes to noteTitles
            @notes.each do |noteID, attributes|
              note = attributes[:note]
              xml.map :target => attributes["xml:id"] do
                termText = []
                if @noteTitles.include? note.title
                  termText.push("note_title"+"_"+note.title.parameterize.underscore)
                end
                termText = termText.empty? ? "" : termText.join(" #")
                note.show ? termText=termText+" #note_show" : nil
                xml.term :target => "#"+termText.strip
              end
            end
          end

        end
      }.to_xml
    end


    # Populate leaf and side objects in ascending order
    def populateLeafSideObjects(memberIDs, project, leafMember=1)
      groupMember = 1
      memberIDs.each_with_index do | memberID, index | 
        if memberID[0] == "G"
          @groups[memberID] = {"memberOrder": groupMember}
          populateLeafSideObjects(project.groups.find(memberID).memberIDs, project, leafMember)
          groupMember += 1
        elsif memberID[0] == "L"
          if not @leafIDs.include? memberID
            leaf = project.leafs.find(memberID)
            @leafIDs.push(memberID)
            @leafs[memberID] = leaf
            @leafs[memberID]["memberOrder"] = leafMember
            @rectos[leaf.rectoID] = project.sides.find(leaf.rectoID)
            @versos[leaf.versoID] = project.sides.find(leaf.versoID)
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


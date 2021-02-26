require 'erb'

module ControllerHelper
  module ExportHelper

    IMAGE_LIST_ERB = File.expand_path '../image_list.xml.erb', __FILE__

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
      @terms = {}

      @projectInformation = {
        "title": @project.title,
        "shelfmark": @project.shelfmark,
        "notationStyle": @project.notationStyle,
        "metadata": @project.metadata,
        "preferences": @project.preferences,
        "manifests": @project.manifests,
        "taxonomies": @project.taxonomies
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

      @project.terms.each_with_index do | term, index |
        @terms[index + 1] = {
          "params": {
            "title": term.title,
            "taxonomy": term.taxonomy,
            "description": term.description,
            "show": term.show
          },
          "objects": {}
        }
        if term.uri.present?
          @terms[index + 1][:params][:uri] = term.uri
        end

        @terms[index + 1][:objects][:Group] = term.objects["Group"].map { |groupID| @groupIDs.index(groupID)+1 }
        @terms[index + 1][:objects][:Leaf] = term.objects["Leaf"].map { |leafID| @leafIDs.index(leafID)+1 }
        @terms[index + 1][:objects][:Recto] = term.objects["Recto"].map { |rectoID| @rectoIDs.index(rectoID)+1 }
        @terms[index + 1][:objects][:Verso] = term.objects["Verso"].map { |versoID| @versoIDs.index(versoID)+1 }
      end

      return {
          "project": @projectInformation,
          "groups":  @groups,
          "leafs":   @leafs,
          "rectos":  @rectos,
          "versos":  @versos,
          "terms":     @terms,
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
      @terms = {}
      @termTitles = []
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
                next if group.parentID.present?
                quireAttributes = {}
                quireAttributes["xml:id"] = group.id
                quireAttributes[:n] = group.group_notation
                quireAttributes[:certainty] = 1
                if group.parentID
                  quireAttributes[:parent] = group.parentID
                end
                xml.quire quireAttributes do
                  # xml.text index + 1
                  # TODO: loop though quire's subquires
                end
                @groups[groupID]["xmlID"] = quireAttributes["xml:id"]
              end
            end
            xml.leaves do
              @leafIDs.each_with_index do |leafID, index|
                leaf = project.leafs.find(leafID)
                leafAttributes = {}
                leafAttributes["xml:id"] = leaf.id
                leafAttributes["stub"] = "yes" if leaf.stubType != "No"
                xml.leaf leafAttributes do
                  
                  # if leaf.folio_number
                  #   folioNumberAttr = {}
                  #   folioNumberAttr[:certainty] = 1
                  #   folioNumber = leaf.folio_number
                  #   folioNumberAttr[:val] = folioNumber
                  #   xml.folioNumber folioNumberAttr do
                  #     xml.text folioNumber
                  #   end
                  # elsif rectoSide.page_number && leaf.folio_number.nil?
                  #   pageNumberAttr = {}
                  #   pageNumberAttr[:certainty] = 1
                  #   pageNumber = "#{rectoSide.page_number.to_s}-#{versoSide.page_number.to_s}"
                  #   pageNumberAttr[:val] = pageNumber
                  #   xml.folioNumber pageNumberAttr do
                  #     xml.text pageNumber
                  #   end
                  # end

                  # get side objects
                  rectoSide = project.sides.find(leaf.rectoID)
                  versoSide = project.sides.find(leaf.versoID)

                  # generate page notation
                  numbers = []
                  numbers[0] = leaf.folio_number
                  pages = [rectoSide.page_number, versoSide.page_number]
                  pages.compact!
                  page_number = pages.empty? ? nil : pages.join('-')
                  numbers[1] = page_number
                  pageNotation = nil
                  pageNotation = numbers.empty? ? nil : numbers.compact!.join('; ')

                  # folioNumber element
                  folioNumberAttr = {}
                  folioNumberAttr[:certainty] = 1
                  folioNumberAttr[:val] = pageNotation
                  xml.folioNumber folioNumberAttr do
                    xml.text pageNotation
                  end

                  mode = {}
                  if ['original', 'added', 'replaced', 'false', 'missing'].include? leaf.type.downcase
                    mode[:val] = leaf.type.downcase
                    mode[:certainty] = 1
                  end
                  xml.mode mode

                  # TODO: come up with consistent way of caching and assigning xml IDs
                  qAttributes = {}
                  qAttributes[:target] = "#"+leaf.parentID
                  qAttributes[:position] = leaf.position_in_top_level_group
                  qAttributes[:n] = project.groups.find(leaf.parentID).group_notation
                  qAttributes[:certainty] = 1
                  xml.q qAttributes do
                    if leaf.conjoined_to
                      xml.conjoin :certainty => 1, :target => "#"+leaf.conjoined_to
                    else
                      xml.single :val => "yes"
                    end
                  end

                  # <attachment-method certainty="1" type="pasted" target="#id-Ferr208-1-7"/>
                  attachmentAttributes = {}
                  attachmentAttributes[:certainty] = 1

                  if leaf.attached_above != "None"
                    attachmentAttributes[:type] = leaf.attached_above.downcase
                    attachmentAttributes[:target] = "#"+@leafIDs[@leafIDs.index(leaf.id) - 1]
                    xml.send('attachment-method', attachmentAttributes)
                  end

                  if leaf.attached_below != "None"
                    attachmentAttributes[:type] = leaf.attached_below.downcase
                    attachmentAttributes[:target] = "#"+@leafIDs[@leafIDs.index(leaf.id) + 1]
                    xml.send('attachment-method', attachmentAttributes)
                  end

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

          # Creating taxonomies
          if not project.terms.empty?
            project.taxonomies.each do |taxonomy|
              unless taxonomy == 'Unknown'
                taxAtt = {'xml:id': "taxonomy_#{taxonomy.parameterize.underscore}"}
                xml.taxonomy taxAtt do
                  xml.label do
                    xml.text taxonomy
                  end
                  # grab an array of terms with the current taxonomy
                  children = project.terms.select {|term| term.taxonomy == taxonomy}

                  # add proper attributes and crete term elements
                  children.each do |childTerm|
                    termAttributes = {'xml:id': "term_#{childTerm._id}"}
                    if childTerm.uri.present?
                      termAttributes['ref'] = childTerm.uri
                    end
                    xml.term termAttributes do
                      xml.text childTerm.title
                    end
                  end
                end
              end
            end
          end

          # Term Attributes Taxonomy
          if not project.terms.empty?
            termTitle = {"xml:id": 'term_title'}
            xml.taxonomy termTitle do
              xml.label do
                xml.text 'List of values for Term Titles'
              end
              project.terms.each_with_index do |term, index|
                if not @termTitles.include? term.title
                  @termTitles.push(term.title)
                end
              end
              @termTitles.each do |termTitle|
                termID = {"xml:id": "term_title"+"_"+termTitle.parameterize.underscore}
                xml.term termID do
                  xml.text termTitle
                end
              end
            end
          end

          if project.terms.present?
          # MAPPING
          xml.mapping do
            # Map rectos to attributes and terms and sides
            @rectos.each do |rectoID, attributes|
              recto = attributes["recto"]
              linkedTerms = (recto.terms.map {|term| "#term_title"+"_"+term.title.parameterize.underscore}).join(" ")
              linkedImage = recto.image.empty? ? "" : recto.image[:url]
              linkedAttributes = []
              linkedAttributes = linkedAttributes.empty? ? "" : linkedAttributes.join(" #")
              if linkedTerms+linkedImage+linkedAttributes.strip != ""
                if linkedAttributes != ""
                  termText = linkedTerms.strip+" #"+linkedAttributes
                  if linkedImage != ""
                    termText = termText+" "+linkedImage+" #manifest_"+recto.image[:manifestID]
                  end
                  xml.map :side => 'recto', :target => "#"+attributes["xml:id"] do
                    xml.term :target => termText.strip
                  end
                else
                  termText = linkedTerms.strip
                  if linkedImage != ""
                    termText = termText+" "+linkedImage+" #manifest_"+recto.image[:manifestID]
                  end
                  xml.map :side => 'recto', :target => "#"+attributes["xml:id"] do
                    xml.term :target => termText.strip
                  end
                end
              end
            end
            # Map versos to attributes and terms and sides
            @versos.each do |versoID, attributes|
              verso = attributes["verso"]
              linkedTerms = (verso.terms.map {|term| "#term_title"+"_"+term.title.parameterize.underscore}).join(" ")
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
              if linkedTerms+linkedImage+linkedAttributes.strip != ""
                if linkedAttributes != ""
                  termText = linkedTerms.strip+" #"+linkedAttributes
                  if linkedImage != ""
                    termText = termText+" "+linkedImage+" #manifest_"+verso.image[:manifestID]
                  end
                  xml.map :side => 'verso', :target => "#"+attributes["xml:id"] do
                    xml.term :target => termText.strip
                  end
                else
                  termText = linkedTerms.strip
                  if linkedImage != ""
                    termText = termText+" "+linkedImage+" #manifest_"+verso.image[:manifestID]
                  end
                  xml.map :side => 'verso', :target => "#"+attributes["xml:id"] do
                    xml.term :target => termText.strip
                  end
                end
              end
            end
            # Map terms to termTitles
            @terms.each do |termID, attributes|
              term = attributes[:term]
              xml.map :target => attributes["xml:id"] do
                termText = []
                if @termTitles.include? term.title
                  termText.push("term_title"+"_"+term.title.parameterize.underscore)
                end
                termText = termText.empty? ? "" : termText.join(" #")
                term.show ? termText=termText+" #term_show" : nil
                xml.term :target => "#"+termText.strip
              end
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

    def build_image_list project
      erb = ERB.new open(IMAGE_LIST_ERB).read
      image_list = erb.result binding
      image_list
    end

  end
end


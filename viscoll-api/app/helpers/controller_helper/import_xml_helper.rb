require 'uri'

module ControllerHelper
  module ImportXmlHelper
    # XML IMPORT
    def handleXMLImport(xml)
      @allGroupNodeIDsInOrder = []
      @allLeafNodeIDsInOrder = []
      @groups = {}
      @leafs = {}
      @rectos = {}
      @versos = {}
      @terms = {}
      
      # Project Information
      @projectInformation = {
        title: "",
        shelfmark: "",
        metadata: {date: ""},
        preferences: {showTips: true},
        manifests: {},
        taxonomies: ["Unknown"]
      }
      # Grab project Title
      projectTitleNode = xml.xpath("//x:title", "x" => "http://schoenberginstitute.org/schema/collation")
      if projectTitleNode.text.empty?
        @projectInformation[:title] =  "No title" 
      else 
        @projectInformation[:title] = projectTitleNode.text
      end
      if not @projectInformation[:title]
        @projectInformation[:title] = "XML_Import_@_" + Time.now.to_s
      end
      begin
        Project.find_by(title: @projectInformation[:title])
        @projectInformation[:title] = "Copy of " + @projectInformation[:title] + " @ " + Time.now.to_s
      rescue Exception => e
      end
      # grab project Shelfmark
      projectShelfmarkNode = xml.xpath("//x:shelfmark", "x" => "http://schoenberginstitute.org/schema/collation")
      @projectInformation[:shelfmark] = projectShelfmarkNode.text
      # grap prohect Date
      projectDateNode = xml.xpath("//x:date", "x" => "http://schoenberginstitute.org/schema/collation")
      if not projectDateNode.empty?
        @projectInformation[:metadata][:date] = projectDateNode.text
      end
      # Map manifests to Project
      manifestTaxonomy = xml.xpath("//x:taxonomy[@xml:id='manifests']", "x" => "http://schoenberginstitute.org/schema/collation")
      if not manifestTaxonomy.empty?
        manifestTaxonomy.children.each do |child|
          if child.name=="term"
            id = child.attributes["id"].value.split("_")[-1]
            url = child.text
            @projectInformation[:manifests][id] = {:id => id, :url => url}
          end      
        end
      end
     
      # Groups Information
      allGroupNodes = xml.xpath('//x:quire', "x" => "http://schoenberginstitute.org/schema/collation")
      # Generate all attributes for Groups
      allGroupNodes.each_with_index do |groupNode, index|
        groupNodeID = groupNode.attributes["id"].value
        parentNodeID = groupNode.attributes["parent"]? groupNode.attributes["parent"].value : nil
        groupOrder = index+1
        @allGroupNodeIDsInOrder.push(groupNodeID)
        nestLevel = 1
        while parentNodeID do
          nodeSearchText = "//x:quire[@xml:id='"+parentNodeID+"']"
          parentGroupNode = xml.xpath(nodeSearchText, "x" => "http://schoenberginstitute.org/schema/collation")
          if not parentGroupNode.empty?
            parentNodeID = parentGroupNode[0].attributes["parent"]? parentGroupNode[0].attributes["parent"].value : nil
          else
            parentNodeID = nil
          end
          nestLevel += 1
        end
        parentNodeID = groupNode.attributes["parent"]? groupNode.attributes["parent"].value : nil
        parentOrder = parentNodeID ? @allGroupNodeIDsInOrder.index(parentNodeID)+1 : nil
        @groups[groupOrder] = {
          params: {
            type: "Quire",
            title: "",
            nestLevel: nestLevel
          },
          tacketed: [],
          sewing: [],
          parentOrder: parentOrder,
          memberOrders: [],
          noteTitles: []
        }
      end
      # MAP attributes for all groups
      @groups.each do |groupOrder, attributes|
        groupNodeID = @allGroupNodeIDsInOrder[groupOrder-1]
        mapTargetSearchText = "//x:map[@target='#"+groupNodeID+"']"
        groupMappingNodes = xml.xpath(mapTargetSearchText, "x" => "http://schoenberginstitute.org/schema/collation")
        if not groupMappingNodes.empty?
          groupMappingNode = groupMappingNodes[0] # Only 1 mapping per group
          groupTermTargets = groupMappingNode.children[1].attributes["target"].value.split(" ")
          groupTermTargets.each do |target|
            termSearchText = "//x:term[@xml:id='"+target[1..-1]+"']"
            groupTerm = xml.xpath(termSearchText, "x" => "http://schoenberginstitute.org/schema/collation")[0]
            groupTermTaxonomyID = groupTerm.parent.attributes["id"].value
            groupTermTaxonomyID=="group_title" ? @groups[groupOrder][:params][:title]=groupTerm.text : nil
            groupTermTaxonomyID=="group_type" ? @groups[groupOrder][:params][:type]=groupTerm.text : nil
            groupTermTaxonomyID=="group_sewing" ? @groups[groupOrder][:sewing]=groupTerm.text.split(" ") : nil
            groupTermTaxonomyID=="group_tacketed" ? @groups[groupOrder][:tacketed]=groupTerm.text.split(" ") : nil
            groupTermTaxonomyID=="group_members" ?  @groups[groupOrder][:memberOrders]=groupTerm.text.split(" ") : nil
            if groupTermTaxonomyID=="note_title"
              @groups[groupOrder][:noteTitles].push(groupTerm.text) unless @groups[groupOrder][:noteTitles].include? groupTerm.text
            end
          end
        end
      end

      # Generate all attributes for Leafs
      allLeafNodes = xml.xpath('//x:leaf', "x" => "http://schoenberginstitute.org/schema/collation")
      allLeafNodes.each_with_index do |leafNode, index|
        leafNodeID = leafNode.attributes["id"].value
        stub = leafNode.attributes["stub"] ? "Original" : "No"
        type = "None"
        conjoinedToNodeID = nil
        leafOrder = index+1
        parentNodeID = nil
        leafNode.children.each do |child|
          if child.name == "mode"
            type = child.attributes["val"] ? child.attributes["val"].value.capitalize : "None"
          end
          if child.name == "q"
            parentNodeID = child.attributes["target"] ? child.attributes["target"].value : nil
            child.children.each do |subChild|
              if subChild.attributes["target"]
                conjoinedToNodeID = subChild.attributes["target"].value[1..-1]
              end
            end
          end
        end
        @allLeafNodeIDsInOrder.push(leafNodeID)
        nestLevel = 1
        parentOrder = 1
        if parentNodeID
          parentOrder = @allGroupNodeIDsInOrder.index(parentNodeID[1..-1])+1
          parentGroup = @groups[parentOrder]
          nestLevel = parentGroup[:params][:nestLevel]
        end
        @leafs[leafOrder] = {
          params: {
            folio_number: nil,
            material: "None",
            type: type,
            attached_above: "None",
            attached_below: "None",
            stub: stub,
            nestLevel: nestLevel
          },
          conjoined_leaf_order: conjoinedToNodeID,
          parentOrder: parentOrder,
          rectoOrder: leafOrder,
          versoOrder: leafOrder,
          noteTitles: []
        }
        @rectos[leafOrder] = {
          params: {
            page_number: nil,
            texture: "None",
            image: {},
            script_direction: "None"
          },
          parentOrder: leafOrder,
          noteTitles: []
        }
        @versos[leafOrder] = {
          params: {
            page_number: nil,
            texture: "None",
            image: {},
            script_direction: "None"
          },
          parentOrder: leafOrder,
          noteTitles: []
        }
      end

      # In @groups, Update sewing, tacketed and memberOrders from nodeIDs to globalOrders
      @groups.each do |groupOrder, attributes|
        sewing = attributes[:sewing].map {|leafNodeID| @allLeafNodeIDsInOrder.index(leafNodeID[1..-1])+1}
        tacketed = attributes[:tacketed].map {|leafNodeID| @allLeafNodeIDsInOrder.index(leafNodeID[1..-1])+1}
        memberOrders = []
        attributes[:memberOrders].each do |memberNodeID|
          if memberNodeID.include? "q"
            memberOrder = @allGroupNodeIDsInOrder.index(memberNodeID[1..-1])+1
            memberOrders.push("Group_"+memberOrder.to_s)
          else
            memberOrder = @allLeafNodeIDsInOrder.index(memberNodeID[1..-1])+1
            memberOrders.push("Leaf_"+memberOrder.to_s)
          end
        end
        @groups[groupOrder][:sewing] = sewing
        @groups[groupOrder][:tacketed] = tacketed
        @groups[groupOrder][:memberOrders] = memberOrders
      end

      # In @leafs, Update conjoined_to from nodeIDs to globalOrders.
      # Also Map material, attachment_methods (for Leaves), texture, script_direction, page_number (for Sides) and noteTitles. 
      @leafs.each do |leafOrder, attributes|    
        if @leafs[leafOrder][:conjoined_leaf_order]
          @leafs[leafOrder][:conjoined_leaf_order] = @allLeafNodeIDsInOrder.index(attributes[:conjoined_leaf_order])+1
        end
        leafNodeID = @allLeafNodeIDsInOrder[leafOrder-1]
        mapTargetSearchText = "//x:map[@target='#"+leafNodeID+"']"
        leafMappingNodes = xml.xpath(mapTargetSearchText, "x" => "http://schoenberginstitute.org/schema/collation")    
        if not leafMappingNodes.empty?
          leafMappingNodes.each do |leafMappingNode|
            if leafMappingNode.attributes["side"]
              sideTermTargets = leafMappingNode.children[1].attributes["target"].value.split(" ")
              sideTermTargets.each do |target|
                if target =~ URI::regexp
                  # This is an Image URL Map
                  if leafMappingNode.attributes["side"].value=="recto"
                    @rectos[leafOrder][:params][:image][:url] = target
                    @rectos[leafOrder][:params][:image][:label] = target.split("/")[-1]
                  else
                    @versos[leafOrder][:params][:image][:url] = target
                    @versos[leafOrder][:params][:image][:label] = target.split("/")[-1]
                  end
                elsif target[1..-1]=="manifest_DIYImages"
                  if leafMappingNode.attributes["side"].value=="recto"
                    @rectos[leafOrder][:params][:image][:manifestID]="DIYImages"
                    @rectos[leafOrder][:params][:image][:label] = @rectos[leafOrder][:params][:image][:label].split("_", 2)[1]
                  else
                    @versos[leafOrder][:params][:image][:manifestID]="DIYImages"
                    @versos[leafOrder][:params][:image][:label] = @versos[leafOrder][:params][:image][:label].split("_", 2)[1]
                  end
                else
                  termSearchText = "//x:term[@xml:id='"+target[1..-1]+"']"
                  sideTerms = xml.xpath(termSearchText, "x" => "http://schoenberginstitute.org/schema/collation")
                  if not sideTerms.empty?
                    sideTerm = sideTerms[0]
                    sideTermTaxonomyID = sideTerm.parent.attributes["id"].value
                    if leafMappingNode.attributes["side"].value=="recto"
                      sideTermTaxonomyID=="side_texture" ? @rectos[leafOrder][:params][:texture]=sideTerm.text : nil
                      sideTermTaxonomyID=="side_script_direction" ? @rectos[leafOrder][:params][:script_direction]=sideTerm.text : nil
                      sideTermTaxonomyID=="side_page_number" ? @rectos[leafOrder][:params][:page_number]=sideTerm.text : nil
                      sideTermTaxonomyID=="manifests" ? @rectos[leafOrder][:params][:image][:manifestID]=sideTerm.attributes["id"].value.split("_")[1] : nil
                      if sideTermTaxonomyID=="note_title"
                       @rectos[leafOrder][:noteTitles].push(sideTerm.text) unless @rectos[leafOrder][:noteTitles].include? sideTerm.text
                      end
                    else
                      sideTermTaxonomyID=="side_texture" ? @versos[leafOrder][:params][:texture]=sideTerm.text : nil
                      sideTermTaxonomyID=="side_script_direction" ? @versos[leafOrder][:params][:script_direction]=sideTerm.text : nil
                      sideTermTaxonomyID=="side_page_number" ? @versos[leafOrder][:params][:page_number]=sideTerm.text : nil
                      sideTermTaxonomyID=="manifests" ? @versos[leafOrder][:params][:image][:manifestID]=sideTerm.attributes["id"].value.split("_")[1] : nil
                      if sideTermTaxonomyID=="note_title"
                       @versos[leafOrder][:noteTitles].push(sideTerm.text) unless @versos[leafOrder][:noteTitles].include? sideTerm.text
                      end
                    end
                  end
                end
              end
            else
              leafTermTargets = leafMappingNode.children[1].attributes["target"].value.split(" ")
              leafTermTargets.each do |target|
                termSearchText = "//x:term[@xml:id='"+target[1..-1]+"']"
                leafTerms = xml.xpath(termSearchText, "x" => "http://schoenberginstitute.org/schema/collation")
                if not leafTerms.empty?
                  leafTerm = leafTerms[0]
                  leafTermTaxonomyID = leafTerm.parent.attributes["id"].value
                  leafTermTaxonomyID=="leaf_material" ? @leafs[leafOrder][:params][:material]=leafTerm.text : nil
                  if leafTermTaxonomyID=="note_title"
                    @leafs[leafOrder][:noteTitles].push(leafTerm.text) unless @leafs[leafOrder][:noteTitles].include? leafTerm.text
                  end
                  if leafTermTaxonomyID=='leaf_attachment_method'
                    leafTerm.attributes["id"].value.include?("Above") ?  @leafs[leafOrder][:params][:attached_above]=leafTerm.text : nil
                    leafTerm.attributes["id"].value.include?("Below") ?  @leafs[leafOrder][:params][:attached_below]=leafTerm.text : nil
                  end
                end              
              end
            end
          end
        end
      end

      # Everything is fine upto this point unless the xml import is driectly from Dot's Model. 
      # In that case, we have to generate the memberOrders attribute for each Group manually.
      # We will loose the actual memberOrders. Here we add the Group members first and then Leaf members.
      taxonomySearchText = "//x:taxonomy[@xml:id='group_members']"
      groupMembersTermNodes = xml.xpath(taxonomySearchText, "x" => "http://schoenberginstitute.org/schema/collation")
      if groupMembersTermNodes.empty?
        # Need to handle adding members to Groups
        @groups.each do |groupOrder, attributes|
          if attributes[:parentOrder]
            @groups[attributes[:parentOrder]][:memberOrders].push("Group_"+groupOrder.to_s)
          end
        end
        @leafs.each do |leafOrder, attributes|
          if attributes[:parentOrder]
            @groups[attributes[:parentOrder]][:memberOrders].push("Leaf_"+leafOrder.to_s)
          end
        end
      end

      jsonImport = {
        project: @projectInformation,
        Groups: @groups,
        Leafs: @leafs,
        Rectos: @rectos,
        Versos: @versos,
        Terms: @terms
      }

      handleJSONImport(JSON.parse(jsonImport.to_json))

    end
  end
end
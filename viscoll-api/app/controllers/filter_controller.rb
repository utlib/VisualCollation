class FilterController < ApplicationController
  before_action :authenticate!
  before_action :set_project, only: [:show]
  
  # PUT /projects/filter
  def show
    begin
      queries = filter_params.to_h[:queries]
      errors = runValidations(queries)
      if errors != []
        render json: {errors: errors}, status: :unprocessable_entity
        return 
      end
      @objectIDs = {Groups: [], Leafs: [], Sides: [], Notes: []}
      @visibleAttributes = {
        group: {type:false, title:false},
        leaf: {type:false, material:false, conjoined_leaf_order:false, attached_below:false, attached_above:false, stub:false},
        side: {folio_number:false, texture:false, script_direction:false, uri:false}
      }
      combinedResult = performFilter(queries)
      finalResponse = buildResponse(combinedResult)
      @groups = finalResponse[:Groups]
      @leafs = finalResponse[:Leafs]
      @sides = finalResponse[:Sides]
      @notes = finalResponse[:Notes] 
      @groupsOfMatchingLeafs = finalResponse[:GroupsOfMatchingLeafs]
      @leafsOfMatchingSides = finalResponse[:LeafsOfMatchingSides]
      @groupsOfMatchingSides = finalResponse[:GroupsOfMatchingSides]
      @groupsOfMatchingNotes = finalResponse[:GroupsOfMatchingNotes]
      @leafsOfMatchingNotes = finalResponse[:LeafsOfMatchingNotes]
      @sidesOfMatchingNotes = finalResponse[:SidesOfMatchingNotes]
      if @groups == []
        @visibleAttributes[:group] = {type:false, title:false}
      end
      if @leafs == []
        @visibleAttributes[:leaf] = {type:false, material:false, conjoined_leaf_order:false, attached_below:false, attached_above:false, stub:false}
      end
      if @sides == []
        @visibleAttributes[:side] = {folio_number:false, texture:false, script_direction:false, uri:false}
      end
    rescue Exception => e
      render json: {errors: e.message}, status: :unprocessable_entity
    end
  end



  def performFilter(queries)
    sets = []
    conjunctions = []
    queries.each do |query|
      type = query[:type]
      attribute = query[:attribute]
      condition = query[:condition]
      values = query[:values]
      conjunction = query[:conjunction]
      groups = []
      leafs = []
      sides = []
      notes = []
      case type
      when "group"
        case condition
        when "equals"
          if values.length > 1
            groupQueryResult = @project.groups.only(:id).where("#{attribute}": {"$in": values})
          else
            groupQueryResult = @project.groups.only(:id).where("#{attribute}": values[0])
          end
        when "not equals"
          if values.length > 1
            groupQueryResult = @project.groups.only(:id).where("#{attribute}": {"$nin": values})
          else
            groupQueryResult = @project.groups.only(:id).where("#{attribute}": {"$ne": values[0]})
          end
        when "contains"
          if values.length > 1
            values = values.map {|x| /^#{x}/}
            groupQueryResult = @project.groups.only(:id).where("#{attribute}": {"$in": values})
          else
            groupQueryResult = @project.groups.only(:id).where("#{attribute}": /#{values[0]}/)
          end
        when "not contains"
          if values.length > 1
            values = values.map {|x| /^#{x}/}
            groupQueryResult = @project.groups.only(:id).where("#{attribute}": {"$nin": values})
          else
            groupQueryResult = @project.groups.only(:id).where("#{attribute}": {"$not": /#{values[0]}/})
          end
        end
        groupQueryResult.each do |leafID|
          groups.push(leafID.id.to_s)
        end
        @objectIDs[:Groups] = @objectIDs[:Groups] + groups
        if groups.length > 0
          @visibleAttributes[:group]["#{attribute}"] = true
        end
      when "leaf"
        if attribute == "conjoined_leaf_order"
          old_attribute = attribute
          attribute = "conjoined_to"
        end
        case condition
        when "equals"
          if values.length > 1
            leafQueryResult = @project.leafs.only(:id).where("#{attribute}": {"$in": values})
          else
            leafQueryResult = @project.leafs.only(:id).where("#{attribute}": values[0])
          end
        when "not equals"
          if values.length > 1
            leafQueryResult = @project.leafs.only(:id).where("#{attribute}": {"$nin": values})
          else
            leafQueryResult = @project.leafs.only(:id).where("#{attribute}": {"$ne": values[0]})
          end
        when "contains"
          if values.length > 1
            values = values.map {|x| /^#{x}/}
            leafQueryResult = @project.leafs.only(:id).where("#{attribute}": {"$in": values})
          else
            leafQueryResult = @project.leafs.only(:id).where("#{attribute}": /#{values[0]}/)
          end
        when "not contains"
          if values.length > 1
            values = values.map {|x| /^#{x}/}
            leafQueryResult = @project.leafs.only(:id).where("#{attribute}": {"$nin": values})
          else
            leafQueryResult = @project.leafs.only(:id).where("#{attribute}": {"$not": /#{values[0]}/})
          end
        end
        leafQueryResult.each do |leafID|
          leafs.push(leafID.id.to_s)
        end
        if leafs.length > 0
          if old_attribute
            @visibleAttributes[:leaf]["#{old_attribute}"] = true
          else
            @visibleAttributes[:leaf]["#{attribute}"] = true
          end
        end
        @objectIDs[:Leafs] = @objectIDs[:Leafs] + leafs
      when "side"
        @project.sides.each do |side|
          sides.push(side.id.to_s)
        end
        case condition
        when "equals"
          if values.length > 1
            sideQueryResult = Side.where(id: {"$in": sides}, "#{attribute}": {"$in": values})
          else
            sideQueryResult = Side.where(id: {"$in": sides}, "#{attribute}": values[0])
          end
        when "not equals"
          if values.length > 1
            sideQueryResult = Side.where(id: {"$in": sides}, "#{attribute}": {"$nin": values})
          else
            sideQueryResult = Side.where(id: {"$in": sides}, "#{attribute}": {"$ne": values[0]})
          end
        when "contains"
          if values.length > 1
            values = values.map {|x| /^#{x}/}
            sideQueryResult = Side.where(id: {"$in": sides}, "#{attribute}": {"$in": values})
          else
            sideQueryResult = Side.where(id: {"$in": sides}, "#{attribute}": /#{values[0]}/)
          end
        when "not contains"
          if values.length > 1
            values = values.map {|x| /^#{x}/}
            sideQueryResult = Side.where(id: {"$in": sides}, "#{attribute}": {"$nin": values})
          else
            sideQueryResult = Side.where(id: {"$in": sides}, "#{attribute}": {"$not": /#{values[0]}/})
          end
        end
        sides = []
        sideQueryResult.each do |sideID|
          sides.push(sideID.id.to_s)
        end
        if sides.length > 0
          @visibleAttributes[:side]["#{attribute}"] = true
        end
        @objectIDs[:Sides] = @objectIDs[:Sides] + sides
      when "note"
        case condition
        when "equals"
          if values.length > 1
            noteQueryResult = Note.where("#{attribute}": {"$in": values})
          else
            noteQueryResult = Note.where("#{attribute}": values[0])
          end
        when "not equals"
          if values.length > 1
            noteQueryResult = Note.where("#{attribute}": {"$nin": values})
          else
            noteQueryResult = Note.where("#{attribute}": {"$ne": values[0]})
          end
        when "contains"
          if values.length > 1
            values = values.map {|x| /^#{x}/}
            noteQueryResult = Note.where("#{attribute}": {"$in": values})
          else
            noteQueryResult = Note.where("#{attribute}": /#{values[0]}/)
          end
        when "not contains"
          if values.length > 1
            values = values.map {|x| /^#{x}/}
            noteQueryResult = Note.where("#{attribute}": {"$nin": values})
          else
            noteQueryResult = Note.where("#{attribute}": {"$not": /#{values[0]}/})
          end
        end
        noteQueryResult.each do |noteID|
          notes.push(noteID.id.to_s)
        end
        @objectIDs[:Notes] = @objectIDs[:Notes] + notes
      end
      sets.push(Set.new([*groups, *leafs, *sides, *notes]))
      conjunctions.push(conjunction)
    end
    conjunctions.pop
    result = sets[0] 
    conjunctions.each_with_index do |conjunction, index|
      if (index+1 <= sets.length-1) 
        if conjunction == "AND"
          result = result & sets[index+1]
        else
          result = result | sets[index+1]
        end
      end
    end
    return result
  end


  def buildResponse(combinedResult)
    response = {Groups: [], Leafs: [], Sides: [], Notes: [], GroupsOfMatchingNotes: [], LeafsOfMatchingNotes: [], SidesOfMatchingNotes:[], LeafsOfMatchingSides:[], GroupsOfMatchingSides:[], GroupsOfMatchingLeafs:[]}
    combinedResult.each do |objectID|
      if @objectIDs[:Groups].include?(objectID)
        response[:Groups].push(objectID)
      elsif @objectIDs[:Leafs].include?(objectID)
        response[:Leafs].push(objectID)
      elsif @objectIDs[:Sides].include?(objectID)
        response[:Sides].push(objectID)
      elsif @objectIDs[:Notes].include?(objectID)
        note = Note.find(objectID)
        groupIDs = note.objects[:Group] 
        leafIDs = note.objects[:Leaf] 
        rectoIDs = note.objects[:Recto]
        versoIDs = note.objects[:Verso]
        groupIDs.each do |groupID|
          if !(response[:Groups].include?(groupID))
            response[:Groups].push(groupID)
            response[:GroupsOfMatchingNotes].push(groupID)
          end
        end
        leafIDs.each do |leafID|
          if !(response[:Leafs].include?(leafID))
            response[:Leafs].push(leafID)
            response[:LeafsOfMatchingNotes].push(leafID)
          end
        end
        rectoIDs.each do |sideID|
          if !(response[:Sides].include?(sideID))
            response[:Sides].push(sideID)
            response[:SidesOfMatchingNotes].push(sideID)
          end
        end
        versoIDs.each do |sideID|
          if !(response[:Sides].include?(sideID))
            response[:Sides].push(sideID)
            response[:SidesOfMatchingNotes].push(sideID)
          end
        end
        response[:Notes].push(objectID)
      end
    end
    response[:Sides].each do |sideID|
      leafID = Side.find(sideID).parentID
      if (!(response[:LeafsOfMatchingSides].include?(leafID)) and !(@objectIDs[:Leafs].include?(leafID)))
        response[:LeafsOfMatchingSides].push(leafID)
      end
    end
    response[:LeafsOfMatchingSides].each do |leafID|
      groupID = Leaf.find(leafID).parentID
      if (!(response[:GroupsOfMatchingSides].include?(groupID)) and !(@objectIDs[:Groups].include?(groupID)))
        response[:GroupsOfMatchingSides].push(groupID)
      end
    end
    response[:Leafs].each do |leafID|
      groupID = Leaf.find(leafID).parentID
      if (!(response[:GroupsOfMatchingLeafs].include?(groupID)) and !(@objectIDs[:Groups].include?(groupID)))
        response[:GroupsOfMatchingLeafs].push(groupID)
      end
    end
    return response
  end


  private
  # Use callbacks to share common setup or constraints between actions.
  def set_project
    begin
      @project = Project.find(params[:id])
      if (@project.user_id!=current_user.id)
        render status: :unauthorized
        return
      end
    rescue Exception => e
      render json: {error: "project not found with id "+params[:id]}, status: :not_found
      return
    end
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def filter_params
    params.permit(:queries => [:type, :attribute, :condition, :conjunction, :values => []])
  end
  

end

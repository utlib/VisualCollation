class FilterController < ApplicationController
  before_action :authenticate!
  before_action :set_project, only: [:show]

  # PUT /projects/filter
  def show
    begin
      queries = filter_params.to_h[:queries]
      errors = runValidations(queries)
      if errors != []
        render json: {errors: errors}, status: :unprocessable_entity and return
      end
      @objectIDs = {Groups: [], Leafs: [], Sides: [], Terms: []}
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
      @terms = finalResponse[:Terms]
      @groupsOfMatchingLeafs = finalResponse[:GroupsOfMatchingLeafs]
      @leafsOfMatchingSides = finalResponse[:LeafsOfMatchingSides]
      @groupsOfMatchingSides = finalResponse[:GroupsOfMatchingSides]
      @groupsOfMatchingTerms = finalResponse[:GroupsOfMatchingTerms]
      @leafsOfMatchingTerms = finalResponse[:LeafsOfMatchingTerms]
      @sidesOfMatchingTerms = finalResponse[:SidesOfMatchingTerms]
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
      render json: {errors: e.message}, status: :unprocessable_entity and return
    end
  end



  def performFilter(queries)
    sets = []
    conjunctions = []
    queries.each do |query|
      type = query[:type]
      old_attribute = nil
      attribute = query[:attribute]
      condition = query[:condition]
      values = query[:values]
      conjunction = query[:conjunction]
      groups = []
      leafs = []
      sides = []
      terms = []

      if attribute == 'conjoined_leaf_order'
        old_attribute = attribute
        attribute = 'conjoined_to'
        values = values.map { |val| val=="None" ? nil : val }
      end
      if attribute == 'conjoined_to'
        values = values.map { |val| val=="None" ? nil : val }
      end

      query_condition_params = { attribute => { '$in': [] } }

      case condition
      when 'equals'
        query_condition_params = { attribute => (values.length > 1) ? { '$in': values } : values[0] }
      when 'not equals'
        query_condition_params = { attribute => (values.length > 1) ? { '$nin': values } : { '$ne': values[0] } }
      when 'contains'
        query_condition_params = { attribute => (values.length > 1) ? { '$in': values.map { |x| /^#{Regexp.escape(x)}/} } : /#{Regexp.escape(values[0])}/ }
      when 'not contains'
        query_condition_params = { attribute => (values.length > 1) ? { '$nin': values.map { |x| /^#{Regexp.escape(x)}/} } : { '$not': /#{Regexp.escape(values[0])}/} }
      end

      case type
      when 'group'
        groupQueryResult = @project.groups.only(:id).where(query_condition_params)
        groups = groupQueryResult.collect { |gqr| gqr.id.to_s }
        @objectIDs[:Groups] += groups
        if groups.length > 0
          @visibleAttributes[:group][attribute] = true
        end
      when 'leaf'
        leafQueryResult = @project.leafs.only(:id).where(query_condition_params)
        leafs = leafQueryResult.collect { |lqr| lqr.id.to_s }
        if leafs.length > 0
          if old_attribute
            @visibleAttributes[:leaf][old_attribute] = true
          else
            @visibleAttributes[:leaf][attribute] = true
          end
        end
        @objectIDs[:Leafs] += leafs
      when 'side'
        sideQueryResult = @project.sides.only(:id).where(query_condition_params)
        sides = sideQueryResult.collect { |sqr| sqr.id.to_s }
        sideQueryResult.each do |sideID|
          sides.push(sideID.id.to_s)
        end
        if sides.length > 0
          @visibleAttributes[:side][attribute] = true
        end
        @objectIDs[:Sides] += sides
      when 'term'
        termQueryResult = @project.terms.only(:id).where(query_condition_params)
        terms = termQueryResult.collect { |nqr| nqr.id.to_s }
        @objectIDs[:Terms] += terms
      end
      sets.push(Set.new([*groups, *leafs, *sides, *terms]))
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
    response = {Groups: [], Leafs: [], Sides: [], Terms: [], GroupsOfMatchingTerms: [], LeafsOfMatchingTerms: [], SidesOfMatchingTerms:[], LeafsOfMatchingSides:[], GroupsOfMatchingSides:[], GroupsOfMatchingLeafs:[]}
    combinedResult.each do |objectID|
      if @objectIDs[:Groups].include?(objectID)
        response[:Groups].push(objectID)
      elsif @objectIDs[:Leafs].include?(objectID)
        response[:Leafs].push(objectID)
      elsif @objectIDs[:Sides].include?(objectID)
        response[:Sides].push(objectID)
      elsif @objectIDs[:Terms].include?(objectID)
        term = Term.find(objectID)
        groupIDs = term.objects[:Group]
        leafIDs = term.objects[:Leaf]
        rectoIDs = term.objects[:Recto]
        versoIDs = term.objects[:Verso]
        groupIDs.each do |groupID|
          if !(response[:Groups].include?(groupID))
            response[:Groups].push(groupID)
            response[:GroupsOfMatchingTerms].push(groupID)
          end
        end
        leafIDs.each do |leafID|
          if !(response[:Leafs].include?(leafID))
            response[:Leafs].push(leafID)
            response[:LeafsOfMatchingTerms].push(leafID)
          end
        end
        rectoIDs.each do |sideID|
          if !(response[:Sides].include?(sideID))
            response[:Sides].push(sideID)
            response[:SidesOfMatchingTerms].push(sideID)
          end
        end
        versoIDs.each do |sideID|
          if !(response[:Sides].include?(sideID))
            response[:Sides].push(sideID)
            response[:SidesOfMatchingTerms].push(sideID)
          end
        end
        response[:Terms].push(objectID)
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
        render status: :unauthorized and return
      end
    rescue Exception => e
      render json: {error: "project not found with id "+params[:id]}, status: :not_found and return
    end
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def filter_params
    params.permit(:queries => [:type, :attribute, :condition, :conjunction, :values => []])
  end


end

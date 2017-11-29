module ControllerHelper
  module FilterHelper

    def runValidations(queries)
      errors = []
      haveErrors = false
      if queries == []
        return ["should contain at least 1 query"]
      end
      queries.each_with_index do |query, index| 
        error = {type: "", attribute: "", condition: "", values: "", conjunction: ""}
        case query["type"]
        when "group"
          if !["type", "title"].include?(query["attribute"])
            error["attribute"] = "valid attributes for group: [type, title]"
            haveErrors = true
          end
          case query["attribute"]
          when "type"
            if !["equals", "not equals"].include?(query["condition"])
              error["condition"] = "valid conditions for group attribute "+query["attribute"]+" : [equals, not equals]"
              haveErrors = true
            end
          when "title"
            if !["equals", "not equals", "contains", "not contains"].include?(query["condition"])
              error["condition"] = "valid conditions for group attribute "+query["attribute"]+" : [equals, not equals, contains, not contains]"
              haveErrors = true
            end
          end
        when "leaf"
          if !["type", "material", "conjoined_leaf_order", "attached_above", "attached_below", "stub"].include?(query["attribute"])
            error["attribute"] = "valid attributes for leaf: [type, material, conjoined_leaf_order, attached_above, attached_below, stub]"
            haveErrors = true
          end
          case query["attribute"]
          when "type", "material", "conjoined_to", "attached_to", "stub"
            if !["equals", "not equals"].include?(query["condition"])
              error["condition"] = "valid conditions for leaf attribute "+query["attribute"]+" : [equals, not equals]"
              haveErrors = true
            end
          end
        when "side"
          if !["folio_number", "texture", "script_direction", "uri"].include?(query["attribute"])
            error["attribute"] = "valid attributes for side: [folio_number, texture, script_direction, uri]"
            haveErrors = true
          end
          case query["attribute"]
          when "texture", "script_direction"
            if !["equals", "not equals"].include?(query["condition"])
              error["condition"] = "valid conditions for side attribute "+query["attribute"]+" : [equals, not equals]"
              haveErrors = true
            end
          when "folio_number", "uri"
            if !["equals", "not equals", "contains", "not contains"].include?(query["condition"])
              error["condition"] = "valid conditions for side attribute "+query["attribute"]+" : [equals, not equals, contains, not contains]"
              haveErrors = true
            end
          end
        when "note"
          if !["title", "type", "description"].include?(query["attribute"])
            error["attribute"] = "valid attributes for note: [title, type, description]"
            haveErrors = true
          end
          case query["attribute"]
          when "type"
            if !["equals", "not equals"].include?(query["condition"])
              error["condition"] = "valid conditions for note attribute "+query["attribute"]+" : [equals, not equals]"
              haveErrors = true
            end
          when "title", "description"
            if !["equals", "not equals", "contains", "not contains"].include?(query["condition"])
              error["condition"] = "valid conditions for note attribute "+query["attribute"]+" : [equals, not equals, contains, not contains]"
              haveErrors = true
            end
          end
        else
          error["type"] = "type should be one of: [group, leaf, side, note]"
          haveErrors = true
        end

        if queries.length > 1 && index<queries.length-1 && !["AND", "OR"].include?(query["conjunction"])
          error["conjunction"] = "conjunction should be one of : [AND, OR]"
          haveErrors = true
        end

        if query["values"] == []
          error["values"] = "query value cannot be empty"
          haveErrors = true
        end

        if haveErrors
          errors.push(error)
        end
      end
      return errors
    end

  end
end

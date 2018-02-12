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
        if (qc = query_types['type'][query['type']]).nil?
          error['type'] = "type should be one of: [#{query_types['type'].keys.join(', ')}]"
          haveErrors = true
        elsif (qc = qc[query['attribute']]).nil?
          error['attribute'] = "valid attributes for #{query['type']}: [#{query_types['type'][query['type']].keys.join(', ')}]"
          haveErrors = true
        elsif not qc.include?(query['condition'])
          error['condition'] = "valid conditions for #{query['type']} attribute #{query['attribute']} : [#{qc.join(', ')}]"
          haveErrors = true
        end

        if queries.length > 1 && index<queries.length-1 && !query_types['conjunction'].include?(query["conjunction"])
          error["conjunction"] = "conjunction should be one of : [#{query_types['conjunction'].join(', ')}]"
          haveErrors = true
        end

        if query["values"].blank?
          error["values"] = "query value cannot be empty"
          haveErrors = true
        end

        if haveErrors
          errors.push(error)
        end
      end
      return errors
    end
    
    private
    
    def query_types
      {
        'type' => {
          'group' => {
            'type' => ['equals', 'not equals'],
            'title' => ['equals', 'not equals', 'contains', 'not contains']
          },
          'leaf' => {
            'type' => ['equals', 'not equals'],
            'material' => ['equals', 'not equals'],
            'conjoined_to' => ['equals', 'not equals'],
            'conjoined_leaf_order' => ['equals', 'not equals'], # Legacy attribute
            'attached_above' => ['equals', 'not equals'],
            'attached_below' => ['equals', 'not equals'],
            'stub' => ['equals', 'not equals']
          },
          'side' => {
            'folio_number' => ['equals', 'not equals', 'contains', 'not contains'],
            'page_number' => ['equals', 'not equals', 'contains', 'not contains'],
            'texture' => ['equals', 'not equals'],
            'script_direction' => ['equals', 'not equals'],
            'uri' => ['equals', 'not equals', 'contains', 'not contains'],
          },
          'note' => {
            'title' => ['equals', 'not equals', 'contains', 'not contains'],
            'type' => ['equals', 'not equals'],
            'description' => ['equals', 'not equals', 'contains', 'not contains']
          }
        },
        'conjunction' => ['AND', 'OR']
      }
    end

  end
end

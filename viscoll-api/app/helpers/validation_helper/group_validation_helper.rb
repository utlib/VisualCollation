module ValidationHelper
  module GroupValidationHelper
    def validateAdditionalGroupParams(noOfGroups, parentGroupID, memberOrder, noOfLeafs, conjoin, oddMemberLeftOut)
      additionalErrors = {noOfGroups:[], parentGroupID:[], memberOrder:[], noOfLeafs: [], conjoin: [], oddMemberLeftOut: []}
      haveErrors = false
      if (noOfGroups==nil)
        additionalErrors[:noOfGroups].push("is required")
        haveErrors = true      
      elsif (!noOfGroups.is_a?(Integer))
        additionalErrors[:noOfGroups].push("should be an Integer")
        haveErrors = true
      elsif (noOfGroups < 1 or noOfGroups > 999)
        additionalErrors[:noOfGroups].push("should range from 1 to 999")
        haveErrors = true
      end
      if parentGroupID != nil && !Group.where(id: parentGroupID).exists?
        haveErrors = true 
        additionalErrors[:parentGroupID].push("group not found with id "+parentGroupID)
      end
      if (parentGroupID!=nil && memberOrder==nil)
        additionalErrors[:memberOrder].push("is required")
        haveErrors = true      
      elsif (parentGroupID!=nil && !memberOrder.is_a?(Integer))
        additionalErrors[:memberOrder].push("should be an Integer")
        haveErrors = true
      elsif (parentGroupID!=nil && memberOrder < 1)
        additionalErrors[:memberOrder].push("should be greater than 0")
        haveErrors = true
      end   
      if (noOfLeafs != nil and !noOfLeafs.is_a?(Integer))
        additionalErrors[:noOfLeafs].push("should be an Integer")
        haveErrors = true
      elsif (noOfLeafs != nil and (noOfLeafs < 1 or noOfLeafs > 999))
        additionalErrors[:noOfLeafs].push("should range from 1 to 999")
        haveErrors = true
      end
      if (conjoin != nil)
        if (!conjoin.is_a?(Boolean))
          additionalErrors[:conjoin].push("should be a Boolean")
          haveErrors = true
        elsif (conjoin and (noOfLeafs != nil and noOfLeafs == 1))
          additionalErrors[:conjoin].push("should be false if the number of leaves is 1")
          haveErrors = true
        end
      end
      if (oddMemberLeftOut != nil)
        if (!oddMemberLeftOut.is_a?(Integer))
          additionalErrors[:oddMemberLeftOut].push("should be an Integer")
          haveErrors = true
        elsif (oddMemberLeftOut < 1 or oddMemberLeftOut > noOfLeafs)
          additionalErrors[:oddMemberLeftOut].push("should range from 1 to the number of leaves")
          haveErrors = true
        elsif (noOfLeafs.even?)
          additionalErrors[:oddMemberLeftOut].push("should be empty if the number of leaves is even")
          haveErrors = true
        end
      end

      if additionalErrors[:noOfGroups] == []
        additionalErrors = additionalErrors.without(:noOfGroups)
      end
      if additionalErrors[:parentGroupID] == []
        additionalErrors = additionalErrors.without(:parentGroupID)
      end
      if additionalErrors[:memberOrder] == []
        additionalErrors = additionalErrors.without(:memberOrder)
      end
      if additionalErrors[:noOfLeafs] == []
        additionalErrors = additionalErrors.without(:noOfLeafs)
      end
      if additionalErrors[:conjoin] == []
        additionalErrors = additionalErrors.without(:conjoin)
      end
      if additionalErrors[:oddMemberLeftOut] == []
        additionalErrors = additionalErrors.without(:oddMemberLeftOut)
      end
      return additionalErrors
    end

    def validateGroupBatchDelete(allGroups)
      errors = []
      allGroups.each do |groupID|
        unless Group.where(id: groupID).exists?
          errors.push("group not found with id "+groupID)
        end
      end
      return errors
    end

    def validateGroupBatchUpdate(allGroups)
      errors = []
      allGroups.each do |group_params|
        haveError = false
        error = {id: [], attributes: {type: []}}
        groupID = group_params[:id]
        type = group_params[:attributes][:type]
        unless Group.where(id: groupID).exists?
          haveError = true
          error[:id].push("group not found with id "+groupID)
        end
        if (type != nil and type!="Quire" and type!="Booklet")
          error[:attributes][:type].push("should be either Quire or Booklet")
          haveError = true
        end
        if haveError
          errors.push(error)
        end
      end
      return errors
    end

  end
end

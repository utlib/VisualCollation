module ValidationHelper
  module LeafValidationHelper
    
    def validateLeafParams(project_id, parentID)
      leafErrors = {project_id: [], parentID: []}
      if (project_id==nil)
        leafErrors[:project_id].push("is required")
      elsif (!project_id.is_a?(String))
        leafErrors[:project_id].push("should be a String")
      else 
        begin
          @project = Project.find(project_id)
        rescue Exception => e
          leafErrors[:project_id].push("project not found")
        end
      end
      if (parentID==nil)
        leafErrors[:parentID].push("is required")
      elsif (!parentID.is_a?(String))
        leafErrors[:parentID].push("should be a String")
      else
        begin
          @group = Group.find(parentID)
          if (@group.project_id.to_s != project_id)
            leafErrors[:parentID].push("Group with parentID does not have project_id as a member")
          end
        rescue Exception => e
          leafErrors[:parentID].push("group not found")
        end
      end
      return leafErrors
    end

    def validateAdditionalLeafParams(project_id, parentGroupID, memberOrder, noOfLeafs, conjoin, oddMemberLeftOut)
      additionalErrors = {memberOrder: [], noOfLeafs: [], conjoin: [], oddMemberLeftOut: []}
      if (memberOrder==nil)
        additionalErrors[:memberOrder].push("is required")
      elsif (!memberOrder.is_a?(Integer))
        additionalErrors[:memberOrder].push("should be an Integer")
      elsif (memberOrder < 1)
        additionalErrors[:memberOrder].push("should be greater than 0")
      end
      if (noOfLeafs==nil)
        additionalErrors[:noOfLeafs].push("is required")
      elsif (!noOfLeafs.is_a?(Integer))
        additionalErrors[:noOfLeafs].push("should be an Integer")
      elsif (noOfLeafs < 1 or noOfLeafs > 999)
        additionalErrors[:noOfLeafs].push("should range from 1 to 999")
      end
      if (conjoin != nil)
        if (!conjoin.is_a?(Boolean))
          additionalErrors[:conjoin].push("should be a Boolean")
        elsif (conjoin and noOfLeafs == 1)
          additionalErrors[:conjoin].push("should be false if the number of leaves is 1")
        end
      end
      if (oddMemberLeftOut != nil)
        if (!oddMemberLeftOut.is_a?(Integer))
          additionalErrors[:oddMemberLeftOut].push("should be an Integer")
        elsif (oddMemberLeftOut < 1 or oddMemberLeftOut > noOfLeafs)
          additionalErrors[:oddMemberLeftOut].push("should range from 1 to the number of leaves")
        elsif (noOfLeafs.even?)
          additionalErrors[:oddMemberLeftOut].push("should be present only if the number of leaves is odd")
        end
      end
      return additionalErrors
    end

  end
end

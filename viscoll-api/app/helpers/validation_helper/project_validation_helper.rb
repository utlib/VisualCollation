module ValidationHelper
  module ProjectValidationHelper
    def validateProjectCreateGroupsParams(allGroups)
      @group_errors = []
      if not allGroups
        allGroups = []
      end
      allGroups.each_with_index do |group, index|
        haveGroupError = false
        @group_error = {groupID: (index+1)}
        @group_error[:leaves] = []
        @group_error[:oddLeaf] = []
        @group_error[:conjoin] = []
        leaves = group["leaves"]
        oddLeaf = group["oddLeaf"]
        conjoin = group["conjoin"]
        if (!leaves.is_a?(Integer))
          @group_error[:leaves].push("should be an Integer")
          haveGroupError = true
        elsif (leaves < 1)
          @group_error[:leaves].push("should be greater than 0")
          haveGroupError = true
        end
        if (leaves.is_a?(Integer) and leaves.odd?)
          if (!oddLeaf.is_a?(Integer))
            @group_error[:oddLeaf].push("should be an Integer")
            haveGroupError = true
          else
            if (oddLeaf < 1)
              @group_error[:oddLeaf].push("should be greater than 0")
              haveGroupError = true
            end
            if (oddLeaf > leaves)
              @group_error[:oddLeaf].push("cannot be greater than leaves")
              haveGroupError = true
            end
          end
        end
        if (!conjoin.is_a?(Boolean))
          @group_error[:conjoin].push("should be a Boolean")
          haveGroupError = true
        end
        if (haveGroupError)
          @group_errors.push(@group_error)
        end
      end
      return {status: @group_errors.empty?, errors: @group_errors}
    end
  end
end
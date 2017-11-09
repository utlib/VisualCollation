module ControllerHelper
  module LeafsHelper

    # Auto-Conjoin the given leaves
    def autoConjoinLeaves(leaves, oddLeafNumber)
      if leaves.size.odd?
        oddLeaf = leaves[oddLeafNumber]
        if (oddLeaf.conjoined_to)
          @project.leaves.find(oddLeaf.conjoined_to).update(conjoined_to: nil)
          oddLeaf.update(conjoined_to: nil)
        end
        leaves.delete_at(oddLeafNumber-1)
      end
      leaves.each do |leaf|
        if leaf.conjoined_to
          old_conjoined_to_leaf =  @project.leafs.find(leaf.conjoined_to)
          if (old_conjoined_to_leaf.conjoined_to)
            old_conjoined_to_leaf.update(conjoined_to: nil)
          end
        end
      end
      leaves.size.times do |i|
        if (leaves.size/2 == i)
          break
        else
          leafOne = leaves[i]
          leafTwo = leaves[leaves.size-i-1]
          leafOne.update(conjoined_to: leafTwo.id.to_s)
          leafTwo.update(conjoined_to: leafOne.id.to_s)
        end
      end
    end

    def update_attached_to
      parent = @project.groups.find(@leaf.parentID)
      memberOrder = parent.memberIDs.index(@leaf.id.to_s)
      if memberOrder > 0
        # This leaf is not the first leaf in the group
        aboveLeaf = @project.leafs.find(parent.memberIDs[memberOrder-1])
        aboveLeaf.update(attached_below: @leaf.attached_above)
      end
      if memberOrder < parent.memberIDs.length - 1
        belowLeaf = @project.leafs.find(parent.memberIDs[memberOrder+1])
        belowLeaf.update(attached_above: @leaf.attached_below)
      end
    end

    def update_conjoined_partner(new_conjoined_to_leafID)
      # VALIDATIONS
      conjoinedToErrors = []
      begin
        new_conjoined_to_leaf = @project.leafs.find(new_conjoined_to_leafID)
      rescue Exception => e
        if new_conjoined_to_leafID
          conjoinedToErrors.push("leaf not found with id "+new_conjoined_to_leafID)
          render json: {leaf: conjoinedToErrors}, status: :unprocessable_entity
          return
        end
      end
      if (@leaf.conjoined_to)
        @old_conjoined_to_leaf =  @project.leafs.find(@leaf.conjoined_to)
      end
      if (@old_conjoined_to_leaf)
        @old_conjoined_to_leaf.update(conjoined_to: nil)
      end
      if new_conjoined_to_leaf
        if (new_conjoined_to_leaf.conjoined_to)
          new_conjoined_to_leaf_conjoined_to_leaf = @project.leafs.find(new_conjoined_to_leaf.conjoined_to)
          if (new_conjoined_to_leaf_conjoined_to_leaf)
            new_conjoined_to_leaf_conjoined_to_leaf.update(conjoined_to: nil)
          end
        end
        new_conjoined_to_leaf.update(conjoined_to: @leaf.id.to_s)
      end
    end
  end
end
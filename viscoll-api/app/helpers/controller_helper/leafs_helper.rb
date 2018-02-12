module ControllerHelper
  module LeafsHelper

    # Auto-Conjoin the given leaves
    def autoConjoinLeaves(leaves, oddLeafNumber)
      targetLeaves = leaves.dup
      leafIds = leaves.collect { |leaf| leaf.id.to_s }
      if targetLeaves.size.odd?
        oddLeaf = targetLeaves[oddLeafNumber-1]
        unless oddLeaf.conjoined_to.blank?
          @project.leafs.find(oddLeaf.conjoined_to).update(conjoined_to: nil)
          oddLeaf.update(conjoined_to: nil)
        end
        targetLeaves.delete_at(oddLeafNumber-1)
        leafIds.delete_at(oddLeafNumber-1)
      end
      targetLeaves.each do |leaf|
        if leaf.conjoined_to && !leafIds.include?(leaf.conjoined_to)
          old_conjoined_to_leaf =  @project.leafs.find(leaf.conjoined_to)
          if (old_conjoined_to_leaf.conjoined_to)
            old_conjoined_to_leaf.update(conjoined_to: nil)
          end
        end
      end
      (targetLeaves.size/2).times do |i|
        leafOne = targetLeaves[i]
        leafTwo = targetLeaves[-i-1]
        leafOne.update(conjoined_to: leafTwo.id.to_s)
        leafTwo.update(conjoined_to: leafOne.id.to_s)
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

    def handle_paper_update(leaf)
      recto = @project.sides.find(leaf.rectoID)
      verso = @project.sides.find(leaf.versoID)
      recto.update(:texture => "None")
      verso.update(:texture => "None")
    end
  end
end

class LeafsController < ApplicationController
  before_action :authenticate!
  before_action :set_leaf, only: [:update, :destroy]
  
  # POST /leafs
  def create
    memberOrder = additional_params.to_h[:memberOrder]
    noOfLeafs = additional_params.to_h[:noOfLeafs]
    conjoin = additional_params.to_h[:conjoin]
    oddMemberLeftOut = additional_params.to_h[:oddMemberLeftOut]
    project_id = leaf_params.to_h[:project_id]
    parentID = leaf_params.to_h[:parentID]
    
    # Validation error for leaf_params
    @leafErrors = validateLeafParams(project_id, parentID)
    if @leafErrors[:project_id].length>0 || @leafErrors[:parentID].length>0
      render json: {leaf: @leafErrors}, status: :unprocessable_entity
      return
    end

    # Validation errors checking for additional parameters
    @additionalErrors = validateAdditionalLeafParams(project_id, parentID, memberOrder, noOfLeafs, conjoin, oddMemberLeftOut)
    hasAdditionalErrors = false
    @additionalErrors.each_value do |value|
      if value.length>0
        hasAdditionalErrors = true
      end
    end
    if hasAdditionalErrors
      render json: {additional: @additionalErrors}, status: :unprocessable_entity
      return
    end

    newlyAddedLeafIDs = []
    newlyAddedLeafs = []
    noOfLeafs.times do |noOfLeafsIndex|
      @leaf = Leaf.new(leaf_params)
      @leaf.nestLevel = @group.nestLevel
      if @leaf.save
        newlyAddedLeafs.push(@leaf)
        newlyAddedLeafIDs.push(@leaf.id)
      else
        render json: {leaf: @leaf.errors}, status: :unprocessable_entity
        return
      end
    end
    
    # Time to Auto-Conjoin
    newlyAddedLeafs = newlyAddedLeafs.reverse
    if conjoin
      if newlyAddedLeafs.size.odd?
        newlyAddedLeafs.delete_at(oddMemberLeftOut-1)
      end
      newlyAddedLeafs.size.times do |i|
        if (newlyAddedLeafs.size/2 == i)
          break
        else
          leafOne = newlyAddedLeafs[i]
          leafTwo = newlyAddedLeafs[newlyAddedLeafs.size-i-1]
          leafOne.update(conjoined_to: leafTwo.id.to_s)
          leafTwo.update(conjoined_to: leafOne.id.to_s)
        end
      end
    end

    # Add leaves to parent group
    @group.add_members(newlyAddedLeafIDs, memberOrder)

    # SUCCESS
    @project = Project.find(project_id)
    @data = generateResponse()
    render :'projects/show', status: :ok
  end


  # PATCH/PUT /leafs/1
  def update
    if (leaf_params.to_h.key?(:conjoined_to))
      # HANDLE SPECIAL CASE FOR conjoined_to
      update_conjoined_partner(leaf_params.to_h[:conjoined_to])
    end
    if @leaf.update(leaf_params)
      if (leaf_params.to_h.key?(:attached_below)||leaf_params.to_h.key?(:attached_above))
        update_attached_to()
      end
      @data = generateResponse()
      render :'projects/show', status: :ok
    else
      render json: {leaf: @leaf.errors}, status: :unprocessable_entity
    end
  end


  # PATCH/PUT /leafs
  def updateMultiple
    begin
      allLeafs = leaf_params_batch_update.to_h[:leafs]
      @project = Project.find(leaf_params_batch_update.to_h[:project_id])
      allLeafs.each do |leaf_params, index|
        begin
          @leaf = Leaf.find(leaf_params[:id])
        rescue Exception => e
          render json: {leafs: ["leaf not found with id "+leaf_params[:id]]}, status: :unprocessable_entity
        end
        if !@leaf.update(leaf_params[:attributes])
          render json: {leafs: {attributes: {index: @leaf.errors}}}, status: :unprocessable_entity
          return
        end
        if (leaf_params[:attributes].key?(:attached_below)||leaf_params[:attributes].key?(:attached_above))
          update_attached_to()
        end
      end
      @data = generateResponse()
      render :'projects/show', status: :ok
    rescue Exception => e
      render json: {error: e.message}, status: :unprocessable_entity
    end
  end


  # DELETE /leafs/1
  def destroy
    begin
      parent = @project.groups.find(@leaf.parentID)
      memberOrder = parent.memberIDs.index(@leaf.id.to_s)
      # Detach its conjoined leaf
      if @leaf.conjoined_to
        @project.leafs.find(@leaf.conjoined_to).update(conjoined_to: nil)
      end
      if @leaf.attached_above != "None"
        # Detach its above attached leaf
        aboveLeaf = @project.leafs.find(parent.memberIDs[memberOrder-1])
        aboveLeaf.update(attached_below: "None")
      end
      if @leaf.attached_below != "None"
        # Detach its below attached leaf
        belowLeaf = @project.leafs.find(parent.memberIDs[memberOrder+1])
        belowLeaf.update(attached_above: "None")
      end
      @leaf.remove_from_group()
      @leaf.destroy
      @data = generateResponse()
      render :'projects/show', status: :ok
    rescue Exception => e
      render json: {error: e.message}, status: :unprocessable_entity
    end
  end


  # DELETE /leafs.json
  def destroyMultiple
    begin
      allLeafs = leaf_params_batch_delete.to_h[:leafs]
      project_id = Leaf.find(allLeafs[0]).project_id
      @project = Project.find(project_id)

      parentAndChildren = {}

      allLeafs.each_with_index do |leafID|
        leaf = Leaf.find(leafID)
        if !@parent || @parent.id.to_s != leaf.parentID
          @parent = @project.groups.find(leaf.parentID)
        end
        memberOrder = @parent.memberIDs.index(leaf.id.to_s)

        # Detach its conjoined leaf if any
        if leaf.conjoined_to
          @project.leafs.find(leaf.conjoined_to).update(conjoined_to: nil)
        end
        if leaf.attached_above != "None"
          # Detach its above attached leaf
          aboveLeaf = @project.leafs.find(@parent.memberIDs[memberOrder-1])
          aboveLeaf.update(attached_below: "None")
        end
        if leaf.attached_below != "None"
          # Detach its below attached leaf
          belowLeaf = @project.leafs.find(@parent.memberIDs[memberOrder+1])
          belowLeaf.update(attached_above: "None")
        end
        leaf.destroy
        # Add leaf to list of leaves to detach from parent
        if parentAndChildren[leaf.parentID] == nil 
          parentAndChildren[leaf.parentID] = [leaf.id.to_s]
        else
          parentAndChildren[leaf.parentID].push(leaf.id.to_s)
        end
      end

      # Detach all leaves from parent(s)
      parentAndChildren.each do |parentID, leafIDs|
        @project.groups.find(parentID).remove_members(leafIDs)
      end
      @data = generateResponse()
      render :'projects/show', status: :ok
    rescue Exception => e
      render json: {error: e.message}, status: :unprocessable_entity
    end
  end


  # CONJOIN /leafs.json
  def conjoinLeafs
    begin
      leafIDs = leaf_params_batch_delete.to_h[:leafs]
      leaves = []
      # VALIDATION ERRORS
      @errors = []
      haveErrors = false
      leafIDs.each do |leafID|
        begin
          leaves.push(Leaf.find(leafID))
        rescue Exception => e
          @errors.push("leaf not found with id "+leafID)
          haveErrors = true
        end
      end
      if leafIDs.size < 2
        @errors = "Minimum of 2 leaves required to conjoin"
        haveErrors = true
      end
      if haveErrors
        render json: {leafs: @errors}, status: :unprocessable_entity
        return
      end
      @project = Project.find(leaves[0].project_id)
      autoConjoinLeaves(leaves, leaves.length/2)
      @data = generateResponse()
      render :'projects/show', status: :ok
    rescue Exception => e
      render json: {error: e.message}, status: :unprocessable_entity
    end
  end


  private
    # Use callbacks to share common setup or constraints between actions.
    def set_leaf
      begin
        @leaf = Leaf.find(params[:id])
        @project = Project.find(@leaf.project_id)
        if (@project.user_id!=current_user.id)
          render json: {error: ""}, status: :unauthorized
          return
        end
      rescue Mongoid::Errors::DocumentNotFound
        render json: {error: "leaf not found with id "+params[:id]}, status: :not_found
      rescue Exception => e
        render json: {error: e.message}, status: :unprocessable_entity
      end
    end
    # Never trust parameters from the scary internet, only allow the white list through.
    def leaf_params
      params.require(:leaf).permit(:project_id, :parentID, :material, :type, :attachment_method, :conjoined_to, :stub, :attached_above, :attached_below)
    end

    def additional_params
      params.require(:additional).permit(:memberOrder, :noOfLeafs, :conjoin, :oddMemberLeftOut)
    end

    def leaf_params_batch_update
      params.permit(:project_id, :leafs => [:id, :attributes=>[:type, :material, :stub, :attached_above, :attached_below]])
    end

    def leaf_params_batch_delete
      params.permit(:leafs => [])
    end

    def leaf_params_conjoin
      params.permit(:leafs => [])
    end

end

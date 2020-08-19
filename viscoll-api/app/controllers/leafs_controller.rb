class LeafsController < ApplicationController
  before_action :authenticate!
  before_action :set_leaf, only: [:update, :destroy]
  
  # POST /leafs
  def create
    memberOrder = additional_params.to_h[:memberOrder]
    noOfLeafs = additional_params.to_h[:noOfLeafs]
    conjoin = additional_params.to_h[:conjoin]
    oddMemberLeftOut = additional_params.to_h[:oddMemberLeftOut]
    leafIDs = additional_params.to_h[:leafIDs]
    sideIDs = additional_params.to_h[:sideIDs]
    project_id = leaf_params.to_h[:project_id]
    parentID = leaf_params.to_h[:parentID]
    
    # Validation error for leaf_params
    @leafErrors = validateLeafParams(project_id, parentID)
    if @leafErrors[:project_id].length>0 || @leafErrors[:parentID].length>0
      render json: {leaf: @leafErrors}, status: :unprocessable_entity and return
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
      render json: {additional: @additionalErrors}, status: :unprocessable_entity and return
    end
    
    # Attempt to validate ownership
    @project = Project.find(project_id)
    if current_user.id != @project.user_id
      render json: { leaf: { project_id: ['unauthorized project_id'] } }, status: :unauthorized and return
    end

    # Skip all callbacks for side creation if leafIDs and SideIDs were give in the request
    begin
      if (leafIDs and sideIDs)
        Leaf.skip_callback(:create, :before, :create_sides)
      end
      newlyAddedLeafIDs = []
      newlyAddedLeafs = []
      sideIDIndex = 0
      noOfLeafs.times do |leafIDIndex|
        @leaf = Leaf.new(leaf_params)
        if leafIDs
          @leaf.id = leafIDs[leafIDIndex]
        end
        @leaf.nestLevel = @group.nestLevel
        if @leaf.save
          newlyAddedLeafs.push(@leaf)
          newlyAddedLeafIDs.push(@leaf.id.to_s)
          # Create new sides for this leaf with given SideIDs
          if (leafIDs and sideIDs)
            recto = Side.new({parentID: @leaf.id.to_s, project: @leaf.project, texture: "Hair", id: sideIDs[sideIDIndex]})
            verso = Side.new({parentID: @leaf.id.to_s, project: @leaf.project, texture: "Flesh", id: sideIDs[sideIDIndex+1] })
            recto.id = "Recto_"+recto.id.to_s
            verso.id = "Verso_"+verso.id.to_s
            recto.save
            verso.save
            @leaf.rectoID = recto.id
            @leaf.versoID = verso.id
            @leaf.save
          end
        else
          render json: {leaf: @leaf.errors}, status: :unprocessable_entity and return
        end
        sideIDIndex += 2
      end
    rescue
    ensure
      if (leafIDs and sideIDs)
        Leaf.set_callback(:create, :before, :create_sides)
      end
    end
    
    # Time to Auto-Conjoin
    autoConjoinLeaves(newlyAddedLeafs, oddMemberLeftOut) if conjoin

    # Add leaves to parent group
    @group.add_members(newlyAddedLeafIDs, memberOrder)

  end

  # PUT /leafs/generateFolio
  def generateFolio
    folioNumberCount = leaf_params_generate.to_h[:startNumber].to_i
    leafIDs = leaf_params_generate.to_h[:leafIDs]
    leafIDs.each_with_index do | leafID, index | 
      leaf = Leaf.find(leafID)
      leaf.update_attribute(:folio_number, folioNumberCount.to_s)
      folioNumberCount += 1
      if index==0
        @project = Project.find(leaf.project_id)
      end
    end
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
      elsif leaf_params.to_h.key?(:material) and leaf_params.to_h[:material] == "Paper"
        handle_paper_update(@leaf)
      end
    else
      render json: {leaf: @leaf.errors}, status: :unprocessable_entity and return
    end
  end


  # PATCH/PUT /leafs
  def updateMultiple
    begin
      allLeafs = leaf_params_batch_update.to_h[:leafs]
      begin
        @project = Project.find(leaf_params_batch_update.to_h[:project_id])
      rescue Mongoid::Errors::DocumentNotFound => e
        render json: {error: "project not found with id "+params[:project_id]}, status: :unprocessable_entity and return
      end
      allLeafs.each do |leaf_params, index|
        begin
          @leaf = Leaf.find(leaf_params[:id])
        rescue Exception => e
          render json: {leafs: ["leaf not found with id "+leaf_params[:id]]}, status: :unprocessable_entity and return
        end
        if @leaf.project.user_id != current_user.id
          render json: {error: ""}, status: :unauthorized and return
        end
        if !@leaf.update(leaf_params[:attributes])
          render json: {leafs: {attributes: {index: @leaf.errors}}}, status: :unprocessable_entity and return
        end
        if (leaf_params[:attributes].key?(:attached_below)||leaf_params[:attributes].key?(:attached_above))
          update_attached_to()
        elsif leaf_params[:attributes].key?(:material) and leaf_params[:attributes][:material] == "Paper"
          handle_paper_update(@leaf)
        end
      end
    rescue Exception => e
      render json: {error: e.message}, status: :unprocessable_entity and return
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
    rescue Exception => e
      render json: {error: e.message}, status: :unprocessable_entity and return
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
        if leaf.project.user_id != current_user.id
          render json: {error: ""}, status: :unauthorized and return
        end
        
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
    rescue Exception => e
      render json: {error: e.message}, status: :unprocessable_entity and return
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
      allowed_project_ids = current_user.projects.pluck(:id).collect { |pid| pid.to_s }
      leafIDs.each do |leafID|
        begin
          leaf = Leaf.find(leafID)
          if not allowed_project_ids.include?(leaf.project_id.to_s)
            render json: {error: ""}, status: :unauthorized and return
          end
          leaves.push(leaf)
        rescue Exception => e
          @errors.push("leaf not found with id "+leafID)
          haveErrors = true
        end
      end
      if leafIDs.size < 2
        @errors.push("Minimum of 2 leaves required to conjoin")
        haveErrors = true
      end
      if haveErrors
        render json: {leafs: @errors}, status: :unprocessable_entity and return
      end
      @project = Project.find(leaves[0].project_id)
      autoConjoinLeaves(leaves, (leaves.length+1)/2)
    rescue Exception => e
      render json: {error: e.message}, status: :unprocessable_entity and return
    end
  end




  private
    # Use callbacks to share common setup or constraints between actions.
    def set_leaf
      begin
        @leaf = Leaf.find(params[:id])
        @project = Project.find(@leaf.project_id)
        if (@project.user_id!=current_user.id)
          render json: {error: ""}, status: :unauthorized and return
        end
      rescue Mongoid::Errors::DocumentNotFound
        render json: {error: "leaf not found with id "+params[:id]}, status: :not_found and return
      rescue Exception => e
        render json: {error: e.message}, status: :unprocessable_entity and return
      end
    end
    # Never trust parameters from the scary internet, only allow the white list through.
    def leaf_params
      params.require(:leaf).permit(:folio_number, :id, :project_id, :parentID, :material, :type, :conjoined_to, :stub, :attached_above, :attached_below)
    end

    def additional_params
      params.require(:additional).permit(:memberOrder, :noOfLeafs, :conjoin, :oddMemberLeftOut, :leafIDs=>[], :sideIDs=>[])
    end

    def leaf_params_batch_update
      params.permit(:project_id, :leafs => [:id, :attributes=>[:folio_number, :conjoined_to, :type, :material, :stub, :attached_above, :attached_below]])
    end

    def leaf_params_batch_delete
      params.permit(:leafs => [])
    end

    def leaf_params_conjoin
      params.permit(:leafs => [])
    end

    def leaf_params_generate
      params.permit(:startNumber, :leafIDs => [])
    end

end

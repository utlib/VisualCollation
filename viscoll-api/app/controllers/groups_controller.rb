class GroupsController < ApplicationController 
  before_action :authenticate!
  before_action :set_group, only: [:update, :destroy]
  
  # POST /groups
  def create
    begin
      noOfGroups = additional_params.to_h[:noOfGroups]
      memberOrder = additional_params.to_h[:memberOrder]
      parentGroupID = additional_params.to_h[:parentGroupID]
      noOfLeafs = additional_params.to_h[:noOfLeafs]
      conjoin = additional_params.to_h[:conjoin]
      oddMemberLeftOut = additional_params.to_h[:oddMemberLeftOut]
      groupIDs = additional_params.to_h[:groupIDs]
      leafIDs = additional_params.to_h[:leafIDs]
      sideIDs = additional_params.to_h[:sideIDs]
      project_id = group_params.to_h[:project_id]
      order = additional_params.to_h[:order]
      # Validate group parameters
      @additionalErrors = validateAdditionalGroupParams(noOfGroups, parentGroupID, memberOrder, noOfLeafs, conjoin, oddMemberLeftOut)
      hasAdditionalErrors = false
      @additionalErrors.each_value do |value|
        if value.length>0
          hasAdditionalErrors = true
        end
      end
      if (hasAdditionalErrors)
        render json: {additional: @additionalErrors}, status: :unprocessable_entity and return
      end
      @groupErrors = {project_id: []}
      if (project_id == nil) 
        @groupErrors[:project_id].push("not found")
        render json: {group: @groupErrors}, status: :unprocessable_entity and return
      end
      begin
        @project = Project.find(project_id)
      rescue Exception => e
        @groupErrors[:project_id].push("project not found with id "+project_id)
        render json: {group: @groupErrors}, status: :unprocessable_entity and return
      end
      new_groups = []
      new_group_ids = []
      groupIDIndex = 0
      parent_group = nil
      if parentGroupID != nil
        parent_group = @project.groups.find(parentGroupID)
      end
      # Create groups
      noOfGroups.times do |i|
        group = Group.new(group_params)
        if groupIDs
          group.id = groupIDs[i]
        end
        if parentGroupID != nil
          group.parentID = parentGroupID
          group.nestLevel = parent_group.nestLevel + 1
        end
        if group.save
          new_groups.push(group)
          new_group_ids.push(group.id.to_s)
        else
          render json: {group: group.errors}, status: :unprocessable_entity and return
        end
      end
      # Add new group(s) to parent
      if parentGroupID != nil
        parent_group.add_members(new_group_ids, memberOrder)
      end
      # Add group(s) to global list 
      @project.add_groupIDs(new_group_ids, order.to_i - 1)
      # Add leaves inside each new group
      new_groups.each_with_index do |group, index|
        if noOfLeafs
          if (leafIDs and sideIDs)
            addLeavesInside(project_id, group, noOfLeafs, conjoin, oddMemberLeftOut, leafIDs[index*noOfLeafs..index*noOfLeafs+noOfLeafs-1], sideIDs[index*2*noOfLeafs..index*2*noOfLeafs+noOfLeafs*2-1])
          else
            addLeavesInside(project_id, group, noOfLeafs, conjoin, oddMemberLeftOut)
          end
        end
      end
    rescue Exception => e
      render json: {error: e.message}, status: :unprocessable_entity and return
    end
  end

  # PATCH/PUT /groups/1
  def update
    begin
      if !@group.update(group_params)
        render json: @group.errors, status: :unprocessable_entity and return
      end
    rescue Exception => e
      render json: {error: e.message}, status: :unprocessable_entity and return
    end
  end

  # PATCH/PUT /groups
  def updateMultiple
    begin
      allGroups = group_params_batch_update.to_h[:groups]
      # Run validations
      errors = validateGroupBatchUpdate(allGroups)
      if not errors.empty?
        render json: {groups: errors}, status: :unprocessable_entity and return
      end
      allGroups.each do |group_params|
        @group = Group.find(group_params[:id])
        @project = Project.find(@group.project_id)
        if (@project.user_id!=current_user.id)
          render json: {error: ""}, status: :unauthorized and return
        end
        if !@group.update(group_params[:attributes])
          render json: @group.errors, status: :unprocessable_entity and return
        end
      end
    rescue Exception => e
      render json: {error: e.message}, status: :unprocessable_entity and return
    end
  end

  # DELETE /groups/1
  def destroy
    begin
      @group = Group.find(params[:id])
      @group.destroy
    rescue Exception => e
      render json: {error: e.message}, status: :unprocessable_entity and return
    end
  end

  # DELETE /groups
  def destroyMultiple
    begin
      groupIDs = group_params_batch_delete.to_h[:groups]
      projectID = group_params_batch_delete.to_h[:projectID]
      # Delete groups
      groupIDs.each do |groupID|
        # Wrapping destroy in begin/rescue because group may no longer exist when it's nested
        begin
          group = Group.find(groupID)
          @project = Project.find(group.project_id)
          if (@project.user_id!=current_user.id)
            render json: {error: ""}, status: :unauthorized and return
          end
          group.destroy
        rescue Exception => e
          next
        end
      end
    rescue Exception => e
      render json: {error: e.message}, status: :unprocessable_entity and return
    end
  end


  private
  def set_group
    begin
      @group = Group.find(params[:id])
      @project = Project.find(@group.project_id)
      if (@project.user_id!=current_user.id)
        render json: {error: ""}, status: :unauthorized and return
      end
    rescue Exception => e
      render json: {error: "group not found"}, status: :not_found and return
    end    
  end

  def group_params
    params.require(:group).permit(:project_id, :type, :title, :tacketed=>[], :sewing=>[])
  end

  def additional_params
    params.require(:additional).permit(:order, :noOfGroups, :memberOrder, :parentGroupID, :noOfLeafs, :conjoin, :oddMemberLeftOut, :groupIDs=>[], :leafIDs=>[], :sideIDs=>[])
  end

  def group_params_batch_update
    params.permit(:groups => [:id, :attributes=>[:type, :title, :tacketed=>[], :sewing=>[]]])
  end

  def group_params_batch_delete
    params.permit(:projectID, :groups => [])
  end

end

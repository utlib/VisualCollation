class NotesController < ApplicationController
  before_action :authenticate!
  before_action :set_note, only: [:update, :link, :unlink, :destroy]
  before_action :set_attached_project, only: [:createType, :deleteType, :updateType]

  # POST /notes
  def create
    @note = Note.new(note_create_params)
    begin
      @project = Project.find(@note.project_id)
    rescue Mongoid::Errors::DocumentNotFound
      render json: {project_id: "project not found with id "+@note.project_id}, status: :unprocessable_entity and return
    end
    if @project.user != current_user
      render json: {error: ''}, status: :unauthorized and return
    end
    if @note.save
      if not Project.find(@note.project_id).noteTypes.include?(@note.type)
        @note.delete
        render json: {type: "should be one of " +Project.find(@note.project_id).noteTypes.to_s}, status: :unprocessable_entity and return
      end
    else
      render json: @note.errors, status: :unprocessable_entity and return
    end
  end

  # PATCH/PUT /notes/1
  def update
    type = note_update_params.to_h[:type]
    if not Project.find(@note.project_id).noteTypes.include?(type)
      render json: {type: "should be one of " +Project.find(@note.project_id).noteTypes.to_s}, status: :unprocessable_entity and return
    end
    if !@note.update(note_update_params)
      render json: @note.errors, status: :unprocessable_entity and return
    end
  end

  # DELETE /notes/1
  def destroy
    @note.destroy
  end

  # PUT /notes/1/link
  def link
    begin
      objects = note_object_link_params.to_h[:objects]
      objects.each do |object|
        type = object[:type]
        id = object[:id]
        begin
          case type
          when "Group"
            @object = Group.find(id)
            authorized = @object.project.user_id == current_user.id
          when "Leaf"
            @object = Leaf.find(id)
            authorized = @object.project.user_id == current_user.id
          when "Recto", "Verso"
            @object = Side.find(id)
            authorized = @object.project.user_id == current_user.id
          else
            render json: {type: "object not found with type "+type}, status: :unprocessable_entity and return
          end
          unless authorized
            render json: {error: ''}, status: :unauthorized and return
          end
        rescue Mongoid::Errors::DocumentNotFound
          render json: {id: type + " object not found with id "+id}, status: :unprocessable_entity and return
        end
        @object.notes.push(@note)
        @object.save
        if (not @note.objects[type].include?(id))
          @note.objects[type].push(id)
        end
        @note.save
      end
    rescue Exception => e
      render json: {error: e.message}, status: :unprocessable_entity and return
    end
  end

  # PUT /notes/1/unlink
  def unlink
    begin
      objects = note_object_link_params.to_h[:objects]
      objects.each do |object|
        type = object[:type]
        id = object[:id]
        begin
          case type
          when "Group"
            @object = Group.find(id)
            authorized = @object.project.user_id == current_user.id
          when "Leaf"
            @object = Leaf.find(id)
            authorized = @object.project.user_id == current_user.id
          when "Recto", "Verso"
            @object = Side.find(id)
            authorized = @object.project.user_id == current_user.id
          else
            render json: {type: "object not found with type "+type}, status: :unprocessable_entity and return
          end
          unless authorized
            render json: {error: ''}, status: :unauthorized and return
          end
        rescue Mongoid::Errors::DocumentNotFound
          render json: {id: type + " object not found with id "+id}, status: :unprocessable_entity and return
        end
        @object.notes.delete(@note)
        @object.save
        @note.objects[type].delete(id)
        @note.save
      end
    rescue Exception => e
      render json: {error: e.message}, status: :unprocessable_entity and return
    end
  end



  # POST /notes/type
  def createType
    type = note_type_params.to_h[:type]
    if @project.noteTypes.include?(type)
      render json: {type: type+" type already exists in the project"}, status: :unprocessable_entity and return
    else
      @project.noteTypes.push(type)
      @project.save
    end
  end


  # DELETE /notes/type
  def deleteType
    type = note_type_params.to_h[:type]
    if not @project.noteTypes.include?(type)
      render json: {type: type+" type doesn't exist in the project"}, status: :unprocessable_entity and return
    else
      @project.noteTypes.delete(type)
      @project.save
      @project.notes.where(type: type).each do |note|
        note.update(type: "Unknown")
        note.save
      end
    end
  end


  # PUT /notes/type
  def updateType
    old_type = note_type_params.to_h[:old_type]
    type = note_type_params.to_h[:type]
    if not @project.noteTypes.include?(old_type)
      render json: {old_type: old_type+" type doesn't exist in the project"}, status: :unprocessable_entity and return
    elsif @project.noteTypes.include?(type)
      render json: {type: type+" already exists in the project"}, status: :unprocessable_entity and return
    else
      indexToEdit = @project.noteTypes.index(old_type)
      @project.noteTypes[indexToEdit] = type
      @project.save
      @project.notes.where(type: old_type).each do |note|
        note.update(type: type)
        note.save
      end
    end
  end



  private
    # Use callbacks to share common setup or constraints between actions.
    def set_note
      begin
        @note = Note.find(params[:id])
        @project = Project.find(@note.project_id)
        if (@project.user_id!=current_user.id)
          render json: {error: ""}, status: :unauthorized and return
        end
      rescue Mongoid::Errors::DocumentNotFound
        render json: {error: "note not found with id "+params[:id]}, status: :not_found and return
      rescue Exception => e
        render json: {error: e.message}, status: :unprocessable_entity and return
      end
    end
    
    def set_attached_project
      project_id = note_type_params.to_h[:project_id]
      begin
        @project = Project.find(project_id)
        if @project.user_id != current_user.id
          render json: {error: ""}, status: :unauthorized and return
        end
      rescue Mongoid::Errors::DocumentNotFound
        render json: {project_id: "project not found with id "+project_id}, status: :unprocessable_entity and return
      end
    end

    # Never trust parameters from the scary internet, only allow the white list through.    
    def note_create_params
      params.require(:note).permit(:project_id, :id, :title, :type, :description, :uri, :show)
    end

    def note_update_params
      params.require(:note).permit(:title, :type, :description, :uri, :show)
    end

    def note_object_link_params
      params.permit(:objects => [:id, :type])
    end

    def note_type_params
      params.require(:noteType).permit(:type, :project_id, :old_type)
    end


end

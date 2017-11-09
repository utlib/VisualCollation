class ProjectsController < ApplicationController

  before_action :authenticate!
  before_action :set_project, only: [:show, :update, :destroy, :createManifest, :updateManifest, :deleteManifest]
  
  # GET /projects
  def index
    @projects = current_user.projects
  end

  # GET /projects/1
  def show
    begin
      @data = generateResponse()
    rescue Exception => e
      render json: {error: e.message}, status: :unprocessable_entity
      return
    end
  end

  # POST /projects
  def create
    begin
      # Run validatins for groups params
      allGroups = group_params.to_h["groups"]
      validationResult = validateProjectCreateGroupsParams(allGroups)
      if (not validationResult[:status])
        render json: {groups: validationResult[:errors]}, status: :unprocessable_entity
        return
      end
      # Instantiate a new project with the given params
      @project = Project.new(project_params)
      # If the project contains noteTypes, add the 'Unknown' type if its not present
      if (not @project.noteTypes.empty? and not @project.noteTypes.include?('Unknown'))
        @project.noteTypes.push('Unknown')
      end
       # Associate the current logged_in user to this project
      @project.user = current_user
      if @project.save
        # If groups params were given, create the Groups & Leaves & auto-conjoin if required
        if (not allGroups.empty?)
          addGroupsLeafsConjoin(@project, allGroups)
        end
        # Get list of all projects of current user to return in response
        @projects = current_user.projects.order_by(:updated_at => 'desc')
        render :index, status: :ok
      else
        render json: {project: @project.errors}, status: :unprocessable_entity
      end
    rescue Exception => e
      render json: {errors: e.message}, status: :bad_request
    end
  end

  # PATCH/PUT /projects/1
  def update
    begin
      @project = Project.find(params[:id])
      if @project.update(project_params)
        @projects = current_user.projects
        render :index, status: :ok
      else
        render json: {project: @project.errors}, status: :unprocessable_entity
      end
    rescue Exception => e
      render json: {errors: e.message}, status: :bad_request
    end
  end

  # DELETE /projects/1
  def destroy
    begin
      # Skip some callbacks
      Leaf.skip_callback(:destroy, :before, :unlink_notes)
      @project.destroy
      @projects = current_user.projects
      render :index, status: :ok
    rescue Exception => e
      render json: {errors: e.message}, status: :bad_request
    ensure
      # Enable callbacks again
      Leaf.set_callback(:destroy, :before, :unlink_notes)
    end
  end

  # POST /projects/:id/manifests
  def createManifest
    begin
      manifest = manifest_params.to_h
      manifestID = Project.new.id.to_s
      @project.manifests[manifestID] = {id: manifestID, url: manifest[:url]}
      @project.save
      @data = generateResponse()
      render :show, status: :ok
    rescue Exception => e
      render json: {errors: e}, status: :bad_request
    end
  end

  # PATCH/PUT /projects/:id/manifests
  def updateManifest
    begin
      manifest = manifest_params.to_h
      if not manifest.key?("id")
        render json: {error: "Param required: id."}, status: :unprocessable_entity
        return
      end
      if not @project.manifests.key?(manifest["id"])
        render json: {error: "Manifest with id: " + manifest["id"] + " not found in project with id: " + @project.id.to_s + "."}, status: :unprocessable_entity
        return
      end
      # ONLY UPDATING MANIFEST NAME FOR NOW 
      @project.manifests[manifest["id"]]["name"] = manifest["name"]
      @project.save
      @data = generateResponse()
      render :show, status: :ok
    rescue Exception => e
      render json: {errors: e.message}, status: :bad_request
    end
  end

  # DELETE /projects/:id/manifests
  def deleteManifest
    begin
      manifestIDToDelete = manifest_params.to_h[:id]
      if not @project.manifests.key?(manifestIDToDelete)
        render json: {error: "Manifest with id: " + manifestIDToDelete + " not found in project with id: " + @project.id.to_s + "."}, status: :unprocessable_entity
        return
      end
      @project.manifests.delete(manifestIDToDelete)
      # Update all sides that have the deleted manuscripts mapping
      @project.sides.each do |side|
        if side[:image][:manifestID] == manifestIDToDelete
          side.update(image: {})
        end
      end
      @project.save
      @data = generateResponse()
      render :show, status: :ok
    rescue Exception => e
      render json: {errors: e.message}, status: :bad_request
    end
  end

  private
  def set_project
    begin
      @project = Project.find(params[:id])
      if (@project.user_id!=current_user.id)
        render json: {error: ""}, status: :unauthorized
        return
      end
    rescue Exception => e
      render json: {error: "project not found with id "+params[:id]}, status: :not_found
      return
    end
  end

  # Never trust parameters from the scary Internet, only allow the white list through.
  def project_params
    params.require(:project).permit(:title, :shelfmark, :metadata=>{}, :noteTypes=>[], :preferences=>{})
  end

  def group_params
    params.permit(:groups => [:number, :leaves, :conjoin, :oddLeaf])
  end

  def manifest_params
    params.require(:manifest).permit(:id, :name, :url)
  end

end

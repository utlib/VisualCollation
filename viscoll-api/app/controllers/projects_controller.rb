class ProjectsController < ApplicationController
  before_action :authenticate!, except: [:viewOnly]
  before_action :set_project, only: [:show, :update, :destroy, :createManifest, :updateManifest, :deleteManifest, :clone]
  

  # GET /projects
  def index
    @projects = current_user.projects
    @images = current_user.images
  end

  # GET /projects/1
  def show
    @data = generateResponse()
    @projects = current_user.projects
    @images = current_user.images
  end

  # GET /projects/1/viewOnly
  def viewOnly
    @project = Project.find(params[:id])
    @data = generateResponse()
    render json: @data, status: :ok and return
  end

  # POST /projects
  def create
    begin
      # Run validatins for groups params
      allGroups = group_params.to_h["groups"]
      folioNumber = group_params.to_h["folioNumber"]
      pageNumber = group_params.to_h["pageNumber"]
      startingTexture = group_params.to_h["startingTexture"]

      validationResult = validateProjectCreateGroupsParams(allGroups)
      if (not validationResult[:status])
        render json: {groups: validationResult[:errors]}, status: :unprocessable_entity and return
      end
      # Instantiate a new project with the given params
      @project = Project.new(project_params)
      puts @project.inspect
      # If the project contains noteTypes, add the 'Unknown' type if its not present
      if (not @project.noteTypes.empty? and not @project.noteTypes.include?('Unknown'))
        @project.noteTypes.push('Unknown')
      end
       # Associate the current logged_in user to this project
      @project.user = current_user
      if @project.save
        # If groups params were given, create the Groups & Leaves & auto-conjoin if required
        if (not allGroups.empty?)
          addGroupsLeafsConjoin(@project, allGroups, folioNumber, pageNumber, startingTexture)
        end
        # Get list of all projects of current user to return in response
        @projects = current_user.projects.order_by(:updated_at => 'desc')
        @images = current_user.images
        render :index, status: :ok and return
      else
        render json: {project: @project.errors}, status: :unprocessable_entity and return
      end
    rescue Exception => e
      render json: {errors: e.message}, status: :bad_request and return
    end
  end

  # PATCH/PUT /projects/1
  def update
    begin
      @project = Project.find(params[:id])
      if @project.update(project_params)
        @projects = current_user.projects
        @images = current_user.images
        render :index, status: :ok and return
      else
        render json: {project: @project.errors}, status: :unprocessable_entity and return
      end
    rescue Exception => e
      render json: {errors: e.message}, status: :bad_request and return
    end
  end

  # DELETE /projects/1
  def destroy
    deleteUnlinkedImages = project_delete_params.to_h["deleteUnlinkedImages"]
    begin
      # Skip some callbacks
      Leaf.skip_callback(:destroy, :before, :unlink_notes)
      if deleteUnlinkedImages 
        Image.skip_callback(:destroy, :before, :unlink_sides_before_delete)
        current_user.images.where({ "projectIDs" => { '$eq': [@project.id.to_s] } }).each do | image | 
          image.destroy
        end
      end
      @project.destroy
      @projects = current_user.projects
      @images = current_user.images
      render :index, status: :ok and return
    rescue Exception => e
      render json: {errors: e.message}, status: :bad_request and return
    ensure
      # Enable callbacks again
      Image.set_callback(:destroy, :before, :unlink_sides_before_delete)
      Leaf.set_callback(:destroy, :before, :unlink_notes)
    end
  end

  # POST /projects/:id/manifests
  def createManifest
    begin
      manifest = manifest_params.to_h
      if not manifest.key?("id")
        manifestID = Project.new.id.to_s
      else 
        manifestID = manifest[:id]
      end
      @project.manifests[manifestID] = {id: manifestID, url: manifest[:url]}
      @project.save
      @data = generateResponse()
      @projects = current_user.projects
      @images = current_user.images
      render :show, status: :ok and return
    rescue Exception => e
      render json: {errors: e}, status: :bad_request and return
    end
  end

  # PATCH/PUT /projects/:id/manifests
  def updateManifest
    begin
      manifest = manifest_params.to_h
      if not manifest.key?("id")
        render json: {error: "Param required: id."}, status: :unprocessable_entity and return
      end
      if not @project.manifests.key?(manifest["id"])
        render json: {error: "Manifest with id: " + manifest["id"] + " not found in project with id: " + @project.id.to_s + "."}, status: :unprocessable_entity and return
      end
      # ONLY UPDATING MANIFEST NAME FOR NOW 
      @project.manifests[manifest["id"]]["name"] = manifest["name"]
      @project.save
    rescue Exception => e
      render json: {errors: e.message}, status: :bad_request and return
    end
  end

  # DELETE /projects/:id/manifests
  def deleteManifest
    begin
      manifestIDToDelete = manifest_params.to_h[:id]
      if not @project.manifests.key?(manifestIDToDelete)
        render json: {error: "Manifest with id: " + manifestIDToDelete + " not found in project with id: " + @project.id.to_s + "."}, status: :unprocessable_entity and return
      end
      @project.manifests.delete(manifestIDToDelete)
      # Update all sides that have the deleted manuscripts mapping
      @project.sides.each do |side|
        if side[:image][:manifestID] == manifestIDToDelete
          side.update(image: {})
        end
      end
      @project.save
    rescue Exception => e
      render json: {errors: e.message}, status: :bad_request and return
    end
  end


  # GET /projects/:id/clone
  def clone
    begin
      exportedData = buildJSON(@project)
      export = {
        project: exportedData[:project],
        Groups: exportedData[:groups],
        Leafs: exportedData[:leafs],
        Rectos: exportedData[:rectos],
        Versos: exportedData[:versos],
        Notes: exportedData[:notes],
      }
      handleJSONImport(JSON.parse(export.to_json))
      newProject = current_user.projects.order_by(:updated_at => 'desc').first
      newProject.sides.each do |side|
        if !side.image.empty? and side.image["manifestID"]=="DIYImages"
          filename = side.image["label"]
          image = current_user.images.where(:filename => filename).first
          !(image.sideIDs.include?(side.id.to_s)) ? image.sideIDs.push(side.id.to_s) : nil
          !(image.projectIDs.include?(newProject.id.to_s)) ? image.projectIDs.push(newProject.id.to_s) : nil
          image.save
        end
      end    
      @projects = current_user.projects.order_by(:updated_at => 'desc')
      @images = current_user.images
      render :index, status: :ok and return
    rescue Exception => e
      p e.message
    end
  end


  private
  def set_project
    begin
      @project = Project.find(params[:id])
      if (@project.user_id != current_user.id)
        render json: {error: ""}, status: :unauthorized and return
      end
    rescue Exception => e
      render json: {error: "project not found with id "+params[:id]}, status: :not_found and return
    end
  end

  # Never trust parameters from the scary Internet, only allow the white list through.
  def project_params
    params.require(:project).permit(:title, :shelfmark, :notationStyle, :metadata=>{}, :noteTypes=>[], :preferences=>{})
  end

  def project_delete_params
    params.permit(:deleteUnlinkedImages)
  end

  def group_params
    params.permit(:folioNumber, :pageNumber, :startingTexture, :groups => [:number, :leaves, :conjoin, :oddLeaf])
  end

  def manifest_params
    params.require(:manifest).permit(:id, :name, :url)
  end

end

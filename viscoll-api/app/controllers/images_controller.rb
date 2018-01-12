class ImagesController < ApplicationController 
  before_action :authenticate!, except: [:show, :getZipImages]
  
  # POST /images
  def uploadImages
    begin
      projectIDs = []
      if image_create_params.to_h.key?("projectID")
        @project = Project.find(image_create_params.to_h[:projectID])
        if (@project.user_id!=current_user.id)
          render json: {error: ""}, status: :unauthorized
          return
        end
        projectIDs.push(@project.id.to_s)
      end
    rescue Mongoid::Errors::DocumentNotFound
      render json: {error: "project not found with id #{params[:projectID]}"}, status: :not_found
      return
    rescue Exception => e
      render json: {error: e.message}, status: :unprocessable_entity
      return
    end
    newImages = []
    allImages = image_create_params.to_h[:images]
    allImages.each do |image_data|
      image = Paperclip.io_adapters.for(image_data[:content]) 
      filename = image_data[:filename].parameterize.underscore
      image.original_filename = filename
      image = Image.new(user: current_user, filename: filename, image: image, projectIDs: projectIDs)
      image.filename = "#{image.filename}.#{image.image_content_type.split('/')[1]}"
      image.image_file_name = filename
      if image.valid?
        image.save
      else
        copyCounter = 1
        while !image.save do
          if image.errors.key?("filename") and image.errors[:filename][0].include?("Image with filename")
            # Duplicate filename. Create Image with new filename+"_copy(copyCounter)"
            image = Paperclip.io_adapters.for(image_data[:content]) 
            filename = "#{image_data[:filename].parameterize.underscore}_copy(#{copyCounter})"
            image.original_filename = filename
            image = Image.new(user: current_user, filename: filename, image: image, projectIDs: projectIDs)
            image.filename = "#{image.filename}.#{image.image_content_type.split('/')[1]}"
            image.image_file_name = filename
            copyCounter += 1
          else
            render json: image.errors, status: :unprocessable_entity
            return
          end 
        end
      end
      newImages.push(image)
    end
    @projects = current_user.projects
    @images = newImages
    render :'projects/index', status: :ok
  end

  # GET /images/:imageID
  def show
    begin
      # p params[:imageID_filename]
      imageID = params[:imageID_filename].split("_", 2)[0]
      filename = params[:imageID_filename].split("_", 2)[1]
      @image = Image.find(imageID)
    rescue Mongoid::Errors::DocumentNotFound
      render json: {error: "image not found with id #{imageID}"}, status: :not_found
      return
    rescue Exception => e
      render json: {error: e.message}, status: :unprocessable_entity
      return
    end
    send_file @image.image.path, :type => @image.image_content_type, :disposition => 'inline'
  end


  # GET /images/zip/:imageID_projectID
  def getZipImages
    begin
      imageID = params[:id].split("_")[0]
      projectID = params[:id].split("_")[1]
      @image = Image.find(imageID)
      imagePath = @image.image.path.split("/")
      imagePath.pop
      imagePath = imagePath.join("/")
      zipFilePath = imagePath+"/"+projectID+"_images.zip"
    rescue Exception => e
      render json: {error: e.message}, status: :unprocessable_entity
      return
    end
    send_file zipFilePath, :type => 'application/zip', :disposition => 'inline'
  end



  # PUT/PATCH /images/link
  def link
    projectIDs = image_link_unlink_params.to_h[:projectIDs]
    imageIDs = image_link_unlink_params.to_h[:imageIDs]
    projects = []
    projectIDs.each do |projectID|
      begin
        project = Project.find(projectID)
        if (project.user_id!=current_user.id)
          render json: {error: ""}, status: :unauthorized
          return
        end
        projects.push(project)
      rescue Mongoid::Errors::DocumentNotFound
        render json: {error: "project not found with id #{projectID}"}, status: :not_found
        return
      rescue Exception => e
        render json: {error: e.message}, status: :unprocessable_entity
        return
      end
    end
    images = []
    imageIDs.each do |imageID|
      begin
        image = Image.find(imageID)
        if (image.user_id!=current_user.id)
          render json: {error: ""}, status: :unauthorized
          return
        end
        images.push(image)
      rescue Mongoid::Errors::DocumentNotFound
        render json: {error: "image not found with id #{imageID}"}, status: :not_found
        return
      rescue Exception => e
        render json: {error: e.message}, status: :unprocessable_entity
        return
      end
    end
    projects.each do |project|
      images.each do |image|
        if not image.projectIDs.include? project.id.to_s
          image.projectIDs.push(project.id.to_s)
          image.save
        end
      end
    end  
    @projects = current_user.projects
    @images = current_user.images
    render :'projects/index', status: :ok
  end


  # PUT/PATCH /images/unlink
  def unlink
    projectIDs = image_link_unlink_params.to_h[:projectIDs]
    imageIDs = image_link_unlink_params.to_h[:imageIDs]
    projects = []
    projectIDs.each do |projectID|
      begin
        project = Project.find(projectID)
        if (project.user_id!=current_user.id)
          render json: {error: ""}, status: :unauthorized
          return
        end
        projects.push(project)
      rescue Mongoid::Errors::DocumentNotFound
        render json: {error: "project not found with id #{projectID}"}, status: :not_found
        return
      rescue Exception => e
        render json: {error: e.message}, status: :unprocessable_entity
        return
      end
    end
    images = []
    imageIDs.each do |imageID|
      begin
        image = Image.find(imageID.split("_", 2)[0])
        if (image.user_id!=current_user.id)
          render json: {error: ""}, status: :unauthorized
          return
        end
        images.push(image)
      rescue Mongoid::Errors::DocumentNotFound
        render json: {error: "image not found with id #{imageID.split("_", 2)[0]}"}, status: :not_found
        return
      rescue Exception => e
        render json: {error: e.message}, status: :unprocessable_entity
        return
      end
    end
    projects.each do |project|
      images.each do |image|
        if image.projectIDs.include? project.id.to_s
          image.projectIDs.delete(project.id.to_s)
          # Unlink All Sides that belongs to this Project that has this Image mapped to it.
          image.sideIDs.each do |sideID|
            side = project.sides.where(:id => sideID).first
            if side
              side.image = {}
              side.save
              image.sideIDs.delete(sideID)
            end
          end
          image.save
        end
      end
    end
    @projects = current_user.projects
    @images = current_user.images
    render :'projects/index', status: :ok
  end


  # DELETE /images
  def destroy
    images = []
    images_destroy_params.to_h[:imageIDs].each do |imageIDParam|
      begin
        imageID = imageIDParam.split("_", 2)[0]
        image = Image.find(imageID)
        images.push(image)
      rescue Mongoid::Errors::DocumentNotFound
        render json: {error: "image not found with id #{imageID}"}, status: :not_found
        return
      rescue Exception => e
        render json: {error: e.message}, status: :unprocessable_entity
        return
      end
      if (image.user_id!=current_user.id)
        render json: {error: ""}, status: :unauthorized
        return
      end
    end
    images.each do |image|
      image.destroy
    end
    @projects = current_user.projects
    @images = current_user.images
    render :'projects/index', status: :ok
  end


  private 
  def image_create_params
    params.permit(:projectID, :images => [:filename, :content])
  end

  def images_destroy_params
    params.permit(:imageIDs => [])
  end

  def image_link_unlink_params
    params.permit(:projectIDs => [], :imageIDs => [])
  end

end

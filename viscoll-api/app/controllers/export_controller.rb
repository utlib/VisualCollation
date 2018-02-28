require 'zip'

class ExportController < ApplicationController
  before_action :authenticate!
  before_action :set_project, only: [:show]
  
  # GET /projects/:id/export/:format
  def show
    # Zip all DIY images and provide the link to download the file   
    begin
      @zipFilePath = nil
      images = []
      current_user.images.all.each do |image|
        if image.projectIDs.include? @project.id.to_s
          images.push(image)
        end
      end
      if !images.empty?
        basePath = images[0].image.path.split("/")
        basePath.pop
        basePath = basePath.join("/")
        zipFilename = basePath+'/'+@project.id.to_s+'_images.zip'
        File.delete(zipFilename) if File.exist?(zipFilename)
        ::Zip::File.open(zipFilename, Zip::File::CREATE) do |zip_file|
          images.each do |image|
            zip_file.add(image.id.to_s+"_"+image.filename, image.image.path)
          end
        end
        @zipFilePath = @base_api_url+"/images/zip/"+images[0].id.to_s+"_"+@project.id.to_s
      end
    rescue Exception => e
    end

    begin
      case @format
      when "xml"
        exportData = buildDotModel(@project)
        xml = Nokogiri::XML(exportData)
        schema = Nokogiri::XML::RelaxNG(File.open("public/viscoll-datamodel2.rng"))
        errors = schema.validate(xml)
        if errors.empty?
          render json: {data: exportData, type: @format, Images: {exportedImages:@zipFilePath ? @zipFilePath : false}}, status: :ok and return
        else
          render json: {data: errors, type: @format}, status: :unprocessable_entity and return
        end
      when "json"
        @data = buildJSON(@project)    
        render :'exports/show', status: :ok and return
      else
        render json: {error: "Export format must be one of [json, xml]"}, status: :unprocessable_entity and return
      end
    rescue Exception => e
      render json: {error: e.message}, status: :internal_server_error and return
    end
  end

  private
  def set_project
    begin
      @project = Project.find(params[:id])
      if (@project.user_id!=current_user.id)
        render json: {error: ""}, status: :unauthorized and return
      end
      @format = params[:format]
    rescue Exception => e
      render json: {error: "project not found with id "+params[:id]}, status: :not_found and return
    end
  end
    
end

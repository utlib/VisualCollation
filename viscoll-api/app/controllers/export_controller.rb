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
        basePath = "#{Rails.root}/public/uploads/"
        zipFilename = "#{basePath}#{@project.id.to_s}_images.zip"
        File.delete(zipFilename) if File.exist?(zipFilename)
        ::Zip::File.open(zipFilename, Zip::File::CREATE) do |zipFile|
          images.each do |image|
            fileExtension = image.metadata['mime_type'].split('/')[1]
            filenameOnly = image.filename.rpartition(".")[0]
            zipFile.add("#{filenameOnly}_#{image.fileID}.#{fileExtension}", "#{basePath}#{image.fileID}")
          end
        end
        @zipFilePath = "#{@base_api_url}/images/zip/#{@project.id.to_s}"
      end
    rescue Exception => e
    end

    begin
      case @format
      when "xml"
        exportData = buildDotModel(@project)
        xml = Nokogiri::XML(exportData)
        schema = Nokogiri::XML::RelaxNG(File.open("public/viscoll-datamodel81120.rng"))
        errors = schema.validate(xml)
        puts errors
        if errors.empty?
          render json: {data: exportData, type: @format, Images: {exportedImages:@zipFilePath ? @zipFilePath : false}}, status: :ok and return
        else
          render json: {data: errors, type: @format}, status: :unprocessable_entity and return
        end
        #skip validation and sending exportData even when errors
        # render json: {data: exportData, type: @format, Images: {exportedImages:@zipFilePath ? @zipFilePath : false}}, status: :ok and return
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

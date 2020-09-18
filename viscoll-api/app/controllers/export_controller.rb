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
      exportData = buildDotModel(@project)
      xml = Nokogiri::XML(exportData)
      schema = Nokogiri::XML::RelaxNG(File.open("public/viscoll-datamodel81120.rng"))
      errors = schema.validate(xml)
      
      if errors.empty?
        case @format
        when "xml"
          render json: {data: exportData, type: @format, Images: {exportedImages:@zipFilePath ? @zipFilePath : false}}, status: :ok and return
        when "json"
          @data = buildJSON(@project)
          render :'exports/show', status: :ok and return
        when 'svg', 'svg2'
          collation_file = @format == 'svg2' ? 'collation2.css' : 'collation.css'
          config_xml = %Q{<config><css xml:id="css">#{collation_file}</css></config>}
          
          job_response = process_pipeline 'viscoll2svg', xml.to_xml, config_xml
          
          outfile = "#{Rails.root}/public/xproc/#{@project.id}-svg.zip"
          File.open outfile, 'wb' do |f|
            f.puts job_response.body
          end
          @zipFilePath = "#{@base_api_url}/transformations/zip/#{@project.id}-svg"

          files = []
          Zip::File.open(outfile) do |zip_file|
            zip_file.each do |entry| 
              if File.extname(entry.name) === '.svg'
                files<<entry.get_input_stream.read
              end
            end
          end
          exportData = files

          render json: {data: exportData, type: @format, Images: {exportedImages:@zipFilePath ? @zipFilePath : false}}, status: :ok and return
        when 'formula'
          job_response = process_pipeline 'viscoll2formulas', xml.to_xml
          
          outfile = "#{Rails.root}/public/xproc/#{@project.id}-formula.zip"
          File.open outfile, 'wb' do |f|
            f.puts job_response.body
          end
          @zipFilePath = "#{@base_api_url}/transformations/zip/#{@project.id}-formula"

          files = []
          Zip::File.open(outfile) do |zip_file|
            formula_count = 0
            zip_file.each do |entry| 
              if File.basename(entry.name).include? "formula"
                formula_count += 1
                file_content = "Formula #{formula_count}: " + %r{>([^<]*)<}.match(entry.get_input_stream.read)[1]
                files << file_content
                files << "\n"
              end
            end
          end
          puts files
          exportData = files
          
          render json: {data: exportData, type: @format, Images: {exportedImages:@zipFilePath ? @zipFilePath : false}}, status: :ok and return
        else
          render json: {error: "Export format must be one of [json, xml, svg, formula]"}, status: :unprocessable_entity and return
        end
      else
        render json: {data: errors, type: @format}, status: :unprocessable_entity and return
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
  
  def process_pipeline pipeline, xml_string, config_xml = nil
    # run the pipeline
    xproc_uri = URI.parse "#{Rails.configuration.xproc['url']}/xproc/#{pipeline}/"
    xproc_req = Net::HTTP::Post.new(xproc_uri)
    form = [['input', StringIO.new(xml_string)]]
    form << ['config', StringIO.new(config_xml)] if config_xml
    
    xproc_req.set_form(form, 'multipart/form-data')
    xproc_response = Net::HTTP.start(xproc_uri.hostname, xproc_uri.port) do |http|
      http.request(xproc_req)
    end
    response_hash = JSON.parse(xproc_response.body)
    puts response_hash
    
    # TODO: Xproc#retreive_data; returns IO object
    job_url = response_hash["_links"]["job"]["href"]
    job_uri = URI.parse job_url
    job_req = Net::HTTP::Get.new(job_uri)
    job_req["Accept"] = 'application/zip'
    job_response = Net::HTTP.start(job_uri.hostname, job_uri.port) do |http|
      http.request(job_req)
    end
    job_response    
  end
end

class ImportController < ApplicationController
  before_action :authenticate!

  # POST /projects/import
  def index
    errorMessage = "Sorry, the imported data cannot be validated. Please check your file for errors and make sure the correct import format is selected above."
    importData = imported_data.to_h[:importData]
    importFormat = imported_data.to_h[:importFormat]
    begin
      case importFormat
      when "json"
        handleJSONImport(JSON.parse(importData))
      when "xml"
        xml = Nokogiri::XML(importData)
        schema = Nokogiri::XML::RelaxNG(File.open("public/viscoll-datamodel2.rng"))
        errors = schema.validate(xml)
        if errors.empty?
          handleXMLImport(Hash.from_xml(importData)["viscoll"]["manuscript"], xml)
        else
          render json: {error: errors}, status: :unprocessable_entity
          return
        end
      end
      # render json: {error: "RETURING ERROR FOR NOW"}, status: :unprocessable_entity
      @projects = current_user.projects.order_by(:updated_at => 'desc')
      render :'projects/index', status: :ok
    rescue Exception => e
      render json: {error: errorMessage}, status: :unprocessable_entity
    ensure
    end
  end



  private
  # Never trust parameters from the scary Internet, only allow the white list through.
  def imported_data
    params.permit(:importData, :importFormat)
  end


end




class ImportController < ApplicationController
  before_action :authenticate!

  # POST /projects/import
  def index
    errorMessage = "Sorry, the imported data cannot be validated. Please check your file for errors and make sure the correct import format is selected above."
    importData = imported_data.to_h[:importData]
    importFormat = imported_data.to_h[:importFormat]
    begin
      # Skip all callbacks
      Leaf.skip_callback(:create, :after, :create_sides)
      case importFormat
      when "json"
        handleJSONImport(JSON.parse(importData))
      when "xml"
        # handleXMLImport(Hash.from_xml(importData))
      when "formula"

      end
      # render json: {error: "RETURING ERROR FOR NOW"}, status: :unprocessable_entity
      @projects = current_user.projects.order_by(:updated_at => 'desc')
      render :'projects/index', status: :ok
    rescue Exception => e
      render json: {error: errorMessage}, status: :unprocessable_entity
    ensure
      # Add all callbacks again
      Leaf.set_callback(:create, :after, :create_sides)
    end
  end



  private
  # Never trust parameters from the scary Internet, only allow the white list through.
  def imported_data
    params.permit(:importData, :importFormat)
  end


end




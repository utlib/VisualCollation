class ExportController < ApplicationController
  before_action :authenticate!
  before_action :set_project, only: [:show]
  
  # PUT /projects/id/export/format
  def show
    begin
      case @format
      when "xml"
        exportData = buildDotModel(@project)
        render json: {data: exportData, type: @format}, status: :ok
      when "formula"
        exportData = buildFormula(@project)
        render json: {data: exportData, type: @format}, status: :ok
      when "json"
        @data = buildJSON(@project)
        render :'exports/show', status: :ok
      else
        render json: {error: "Export format must be one of [json, xml, formula]"}, status: :unprocessable_entity
      end
    rescue Exception => e
      render json: {error: e.message}, status: :internal_server_error
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
      @format = params[:format]
    rescue Exception => e
      render json: {error: "project not found with id "+params[:id]}, status: :not_found
      return
    end
  end
    
end

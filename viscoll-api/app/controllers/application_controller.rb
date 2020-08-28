class ApplicationController < ActionController::API
    before_action :set_base_api_url
    def set_base_api_url
      # TODO: we need an env var with a complete URL for this
      @base_api_url = Rails.application.secrets.api_url ? Rails.application.secrets.api_url : "https://#{ENV['APPLICATION_HOST']}"
    end

    include RailsJwtAuth::WardenHelper
    include ControllerHelper::ProjectsHelper
    include ControllerHelper::GroupsHelper
    include ControllerHelper::LeafsHelper
    include ControllerHelper::FilterHelper
    include ControllerHelper::ImportJsonHelper
    include ControllerHelper::ImportXmlHelper
    include ControllerHelper::ImportMappingHelper
    include ControllerHelper::ExportHelper
    include ValidationHelper::ProjectValidationHelper
    include ValidationHelper::GroupValidationHelper
    include ValidationHelper::LeafValidationHelper
end

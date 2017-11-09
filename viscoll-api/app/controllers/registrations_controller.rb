class RegistrationsController < RailsJwtAuth::RegistrationsController
  
  def create
    begin
      user = RailsJwtAuth.model.new(registration_create_params)
      user.save ? render_registration(user) : render_422(user.errors)
    rescue Exception => e
      render json: {error: e.message}, status: :unprocessable_entity
    end

  end

  private
  def registration_create_params
      params.require(RailsJwtAuth.model_name.underscore).permit(
        RailsJwtAuth.auth_field_name, :password, :password_confirmation, :name
      )
  end
end

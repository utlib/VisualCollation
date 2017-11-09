class SessionsController < RailsJwtAuth::SessionsController

  def create
    user = RailsJwtAuth.model.where(RailsJwtAuth.auth_field_name =>
      session_create_params[RailsJwtAuth.auth_field_name].to_s.downcase).first

    if !user
      render_422 session: [create_session_error]
    elsif user.respond_to?('confirmed?') && !user.confirmed?
      render_422 session: [I18n.t('rails_jwt_auth.errors.unconfirmed')]
    elsif user.authenticate(session_create_params[:password])
      @userProjects = []
      begin
        @userProjects = user.projects
      rescue
      end
      @userToken = get_jwt(user)
      @user = user
      render :index, status: :ok, location: {
        userProjects: @userProjects,
        userToken: @userToken,
        user: @user
      }
    else
      render_422 session: [create_session_error]
    end
  end

  def destroy
    begin
      authenticateDestroy!
      current_user.destroy_auth_token Jwt::Request.new(request).auth_token
      render_204
    rescue Exception => e
      render json: {error: "Authorization Header: "+e.message}, status: :unprocessable_entity
    end
  end
end



module Jwt
  class Request
    def initialize(request)
      return unless request.env['HTTP_AUTHORIZATION']
      @jwt = request.env['HTTP_AUTHORIZATION'].split.last

      begin
        @jwt_info = RailsJwtAuth::Jwt::Manager.decode(@jwt)
      rescue JWT::ExpiredSignature, JWT::VerificationError
        @jwt_info = false
      end
    end

    def valid?
      @jwt && @jwt_info && RailsJwtAuth::Jwt::Manager.valid_payload?(payload)
    end

    def payload
      @jwt_info ? @jwt_info[0] : nil
    end

    def header
      @jwt_info ? @jwt_info[1] : nil
    end

    def auth_token
      payload ? payload['auth_token'] : nil
    end
  end
end

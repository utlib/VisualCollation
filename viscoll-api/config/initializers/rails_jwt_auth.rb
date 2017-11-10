RailsJwtAuth.setup do |config|
  # authentication model class name
  #config.model_name = 'User'

  # field name used to authentication with password
  #config.auth_field_name = 'email'

  # set to true to validate auth_field email format
  #config.auth_field_email = true

  # expiration time for generated tokens
  #config.jwt_expiration_time = 7.days

  # the "iss" (issuer) claim identifies the principal that issued the JWT
  #config.jwt_issuer = 'RailsJwtAuth'

  # number of simultaneously sessions for an user
  #config.simultaneously_sessions = 3

  # mailer sender
  config.mailer_sender = 'noreply-utlviscoll@library.utoronto.ca'

  # url used to create email link with confirmation token
  config.confirmation_url = if Rails.env.production? then 'https://utlviscoll.library.utoronto.ca/confirmation' else 'http://127.0.0.1:3000/confirmation' end

  # expiration time for confirmation tokens
  #config.confirmation_expiration_time = 1.day

  # url used to create email link with reset password token
  config.reset_password_url = if Rails.env.production? then 'https://utlviscoll.library.utoronto.ca/password' else 'http://127.0.0.1:3000/password' end


  # expiration time for reset password tokens
  #config.reset_password_expiration_time = 1.day

  # uses deliver_later to send emails instead of deliver method
  #config.deliver_later = false
end

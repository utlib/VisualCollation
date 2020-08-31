class ApplicationMailer < ActionMailer::Base
  # TODO
  default from: Rails.application.secrets.mailer_default_from
  layout 'mailer'
end

class ApplicationMailer < ActionMailer::Base
  # TODO
  default from: Rails.application.config.action_mailer.smtp_settings[:from]
  layout 'mailer'
end

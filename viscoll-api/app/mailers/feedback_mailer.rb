class FeedbackMailer < ApplicationMailer
  def sendFeedback(title, message, browserInformation, projectJSONExport, current_user)
    @title = title
    @message = message
    @browserInformation = browserInformation
    @projectJSONExport = projectJSONExport
    @user = User.find(current_user)
    mail(
      subject: title,
      to: ENV['ADMIN_EMAIL'],
      template_name: 'sendFeedback'
    )
  end
end

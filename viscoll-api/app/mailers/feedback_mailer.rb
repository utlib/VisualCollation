class FeedbackMailer < ApplicationMailer
  def sendFeedback(title, message, current_user)
    @title = title
    @message = message
    @user = User.find(current_user)
    mail(
      subject: title, 
      to:"utlviscoll@library.utoronto.ca",
    )
  end
end

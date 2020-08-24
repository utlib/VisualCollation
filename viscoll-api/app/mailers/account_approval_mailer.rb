class AccountApprovalMailer < ApplicationMailer
  default from: RailsJwtAuth.mailer_sender
  
  def sendApprovalStatus(user)
    @user = User.find(user)
    mail(
      subject: "VisColl Account Approval",
      to: @user.email,
      template_name: 'sendApprovalStatus'
    )
  end
end
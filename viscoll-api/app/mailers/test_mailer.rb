class TestMailer < ApplicationMailer
  default from: 'emeryr@upenn.edu'

  def test_email
    mail to: 'emeryr@upenn.edu', subject: 'Test of the mailer', body: 'The body of the email'
  end
end

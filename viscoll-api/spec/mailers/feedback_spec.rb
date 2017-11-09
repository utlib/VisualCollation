require "rails_helper"

RSpec.describe FeedbackMailer, type: :mailer do
  context 'user submits a feedback' do
    before do
      @user = User.create(:name => "user", :email => "user@mail.com", :password => "user")
    end
    
    let(:mail) { FeedbackMailer.sendFeedback("Title of feedback", "My message", @user.id)}
    
    it "should send email" do
      expect(mail.subject).to eq("Title of feedback")
      expect(mail.to).to eq(["utlviscoll@library.utoronto.ca"])
    end

    it "should render body" do
      expect(mail.body.raw_source).to include("My message")
      expect(mail.body.raw_source).to include(@user.name)
      expect(mail.body.raw_source).to include(@user.email)
    end
  end
end

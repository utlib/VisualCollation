class FeedbackController < ApplicationController
  before_action :authenticate!

  # POST /feedback
  def create
    begin
      @title = feedback_params[:title]
      @message = feedback_params[:message]
      if not @title or not @message
        render json: {error: "[title] and [message] params required."}, status: :unprocessable_entity
        return
      end
      FeedbackMailer.sendFeedback(
        @title, 
        @message, 
        current_user
      ).deliver_now
    rescue Exception => e
      render json: {error: e.message}, status: :unprocessable_entity
    end
  end

  private 
  def feedback_params
    params.require(:feedback).permit(:title, :message)
  end
end
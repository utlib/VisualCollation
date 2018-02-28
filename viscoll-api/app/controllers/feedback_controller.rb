class FeedbackController < ApplicationController
  before_action :authenticate!

  # POST /feedback
  def create
    begin
      if not current_user
        render json: {}, status: :unprocessable_entity and return
      end
      @title = feedback_params[:title]
      @message = feedback_params[:message]
      @browserInformation = feedback_params[:browserInformation]
      @projectJSONExport = feedback_params[:project]
      if @title.blank? or @message.blank?
        render json: {error: "[title] and [message] params required."}, status: :unprocessable_entity and return
      end
      FeedbackMailer.sendFeedback(
        @title, 
        @message, 
        @browserInformation,
        @projectJSONExport,
        current_user
      ).deliver_now
      render json: {}, status: :ok and return
    rescue Exception => e
      render json: {error: e.message}, status: :unprocessable_entity and return
    end
  end

  private 
  def feedback_params
    params.require(:feedback).permit(:title, :message, :browserInformation, :project)
  end
end

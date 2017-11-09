class SidesController < ApplicationController
  before_action :authenticate!
  before_action :set_side, only: [:update]
  
  # PATCH/PUT /sides/1
  def update
    begin
      if @side.update(side_params)
        @data = generateResponse()
        render :'projects/show', status: :ok
      else
        render json: @side.errors, status: :unprocessable_entity
      end
    rescue Exception => e
      render json: {error: e.message}, status: :unprocessable_entity
    end
  end


  # PATCH/PUT /sides
  def updateMultiple
    begin
      allSides = side_params_batch_update.to_h[:sides]
      # VALIDATIONS
      @errors = []
      haveErrors = false
      sides = []
      allSides.each do |sideID|
        begin
          side = Side.find(sideID)
          sides.push(side)
        rescue Exception => e
          @errors.push("side not found with id "+sideID)
          haveErrors = true
        end
      end
      @project = Project.find(sides[0].project_id)
      if (@project.user_id!=current_user.id)
        render json: {error: ""}, status: :unauthorized
        return
      end
      if haveErrors
        render json: {sides: @errors}, status: :unprocessable_entity
        return
      end
      allSides.each_with_index do |side_params, index|
        side = sides[index]
        if !side.update(side_params[:attributes])
          render json: side.errors, status: :unprocessable_entity
          return
        end
      end
      @data = generateResponse()
      render :'projects/show', status: :ok
    rescue Exception => e
      render json: {error: e.message}, status: :unprocessable_entity
    end
  end


  private
    # Use callbacks to share common setup or constraints between actions.
    def set_side
      begin
        @side = Side.find(params[:id])
        @project = Project.find(@side.project_id)
        if (@project.user_id!=current_user.id)
          render json: {error: ""}, status: :unauthorized
          return
        end
      rescue Exception => e
        render json: {error: "side not found"}, status: :not_found
        return
      end   
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def side_params
      params.require(:side).permit(:folio_number, :texture, :script_direction, :image=>[:manifestID, :label, :url])
    end

    def side_params_batch_update
      params.permit(:sides => [:id, :attributes=>[:texture, :script_direction, :image=>[:manifestID, :label, :url]]])
    end

end

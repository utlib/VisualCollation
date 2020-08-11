class SidesController < ApplicationController
  before_action :authenticate!
  before_action :set_side, only: [:update]
  
  # PATCH/PUT /sides/1
  def update
    begin
      if !@side.update(side_params)
        render json: @side.errors, status: :unprocessable_entity and return
      end
    rescue Exception => e
      render json: {error: e.message}, status: :unprocessable_entity and return
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
        render json: {error: ""}, status: :unauthorized and return
      end
      if haveErrors
        render json: {sides: @errors}, status: :unprocessable_entity and return
      end
      allSides.each_with_index do |side_params, index|
        side = sides[index]
        previousSideImage = side.image.clone
        if !side.update(side_params[:attributes])
          render json: side.errors, status: :unprocessable_entity and return
        else
          # SPEICAL CASE FOR DIY IMAGE MAPPING
          if side_params[:attributes]["image"]
            newSideImage = side_params[:attributes]["image"].clone
            # If an image was linked, check if it was a DIY and link this Side to that Image
            if newSideImage and !(newSideImage.empty?) and newSideImage["manifestID"]=="DIYImages"
              imageID = newSideImage["url"].split("/")[-1].split("_", 2)[0]
              begin
                imageLinked = Image.find(imageID)
                !(imageLinked.sideIDs.include?(side.id.to_s)) ? imageLinked.sideIDs.push(side.id.to_s) : nil
                imageLinked.save
              rescue Exception => e
              end
            end
            # If an image was linked, check if this side was previously linked to a DIY Image and unlink this Side to that Image
            if newSideImage and !newSideImage.empty? and !previousSideImage.empty? and previousSideImage["manifestID"]=="DIYImages"
              imageID = previousSideImage["url"].split("/")[-1].split("_", 2)[0]
              begin
                imageUnlinked = Image.find(imageID)
                if !imageLinked or imageLinked.id.to_s != imageUnlinked.id.to_s
                  imageUnlinked.sideIDs.include?(side.id.to_s) ? imageUnlinked.sideIDs.delete(side.id.to_s) : nil
                  imageUnlinked.save
                end
              rescue Exception => e
              end
            end
            # If an Image was unlinked, check if it was a DIY and unlink this Side from the Image
            if newSideImage and newSideImage.empty? and !previousSideImage.empty? and previousSideImage["manifestID"]=="DIYImages"
              imageID = previousSideImage["url"].split("/")[-1].split("_", 2)[0]
              begin
                image = Image.find(imageID)
                image.sideIDs.include?(side.id.to_s) ? image.sideIDs.delete(side.id.to_s) : nil
                image.save
              rescue Exception => e
              end
            end
          end
        end
      end
    rescue Exception => e
      render json: {error: e.message}, status: :unprocessable_entity and return
    end
  end
  
  # PUT /sides/generatePageNumber
  def generatePageNumber
    pageNumberCount = side_params_generate.to_h[:startNumber].to_i
    rectoIDs = side_params_generate.to_h[:rectoIDs]
    versoIDs = side_params_generate.to_h[:versoIDs]
    rectoIDs.each_with_index do | rectoID, index | 
      recto = Side.find(rectoID)
      verso = Side.find(versoIDs[index])
      recto.update_attribute(:page_number, pageNumberCount.to_s)
      pageNumberCount += 1
      verso.update_attribute(:page_number, pageNumberCount.to_s)
      pageNumberCount += 1
      if index==0
        @project = Project.find(recto.project_id)
      end
    end
  end


  private
    # Use callbacks to share common setup or constraints between actions.
    def set_side
      begin
        @side = Side.find(params[:id])
        @project = Project.find(@side.project_id)
        if (@project.user_id!=current_user.id)
          render json: {error: ""}, status: :unauthorized and return
        end
      rescue Exception => e
        render json: {error: "side not found"}, status: :not_found and return
      end   
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def side_params
      params.require(:side).permit(:page_number, :texture, :script_direction, :image=>[:manifestID, :label, :url])
    end

    def side_params_batch_update
      params.permit(:sides => [:id, :attributes=>[:page_number, :texture, :script_direction, :image=>[:manifestID, :label, :url]]])
    end

    def side_params_generate
      params.permit(:startNumber, :rectoIDs => [], :versoIDs => [])
    end

end

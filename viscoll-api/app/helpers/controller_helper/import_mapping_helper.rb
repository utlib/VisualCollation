require 'zip'

module ControllerHelper
  module ImportMappingHelper

    def handleMappingImport(newProject, imageData, current_user)     
      begin
        uploadedImages = {}
        if imageData!=""
          zipFile = Paperclip.io_adapters.for(imageData) 
          Zip::File.open(zipFile.path) do |zip_file|
            zip_file.each do |file|
              # Go through each file and check if it exists in the user directory and link them.
              # If it doesn't exist, create a new Image and link it to newProject and its Side.
              tempfile = Tempfile.new([File.basename(file.name).split("_", 2)[1].split('.', 2)[0], File.basename(file.name).split("_", 2)[1].split('.', 2)[1]])
              tempfile.binmode
              tempfile.write file.get_input_stream.read
              tempfile.rewind
              imageID = File.basename(file.name).split("_", 2)[0]
              filename = File.basename(file.name).split("_", 2)[1]
              newImage = Image.new(user: current_user, filename: filename, image: tempfile, projectIDs: [newProject.id.to_s])
              uploadedImages[filename] = {:image => newImage, :file => file}
            end
          end
        end
        # Go though all the sides in the newProject that are mapped to DIYImages.
        # If it is not linked to Image that belongs to the current_user, unlink; otherwise update the link.
        newProject.sides.each do |side|
          if !side.image.empty? and side.image["manifestID"]=="DIYImages"
            imageID = side.image["url"].split("/")[-1].split("_", 2)[0]
            filename = side.image["url"].split("/")[-1].split("_", 2)[1]
            image = current_user.images.where(:id => imageID).first
            if not image
              # No Image exists in the current_user direcroty.
              # Check if any Image with 'filename' was uploaded during import.
              if uploadedImages.key?(filename)
                newImage = uploadedImages[filename][:image]
                # Check if uploaded Image Filename already exists in the current_user directory
                existingImage = current_user.images.where(:filename => filename).first
                if existingImage
                  # Check if this new Image is different from the existing Image
                  if newImage.image_fingerprint==existingImage.image_fingerprint
                    # Same Image. So Link this Image to the this Side
                    side.image["url"]=@base_api_url+"/images/"+existingImage.id.to_s+"_"+existingImage.filename
                    side.save
                    !(existingImage.sideIDs.include?(side.id.to_s)) ? existingImage.sideIDs.push(side.id.to_s) : nil
                    !(existingImage.projectIDs.include?(newProject.id.to_s)) ? existingImage.projectIDs.push(newProject.id.to_s) : nil
                    existingImage.save
                  else
                    # Different Image, but with already existing filename. Rename the newImage and link to this Side.
                    newFilename = "#{newImage.filename.split('.', 2)[0]}(copy).#{newImage.filename.split('.', 2)[1]}"
                    tempfile = Tempfile.new([newFilename.split(".", 2)[0], newFilename.split(".", 2)[1]])
                    tempfile.binmode
                    tempfile.write uploadedImages[filename][:file].get_input_stream.read
                    tempfile.rewind
                    newImage = Image.new(user: current_user, filename: newFilename, image: tempfile, projectIDs: [newProject.id.to_s])
                    side.image["url"]=@base_api_url+"/images/"+newImage.id.to_s+"_"+newFilename
                    side.save
                    !(newImage.sideIDs.include?(side.id.to_s)) ? newImage.sideIDs.push(side.id.to_s) : nil
                    !(newImage.projectIDs.include?(newProject.id.to_s)) ? newImage.projectIDs.push(newProject.id.to_s) : nil
                    newImage.save
                  end
                else
                  # New Image
                  side.image["url"]=@base_api_url+"/images/"+newImage.id.to_s+"_"+newImage.filename
                  side.save
                  !(newImage.sideIDs.include?(side.id.to_s)) ? newImage.sideIDs.push(side.id.to_s) : nil
                  !(newImage.projectIDs.include?(newProject.id.to_s)) ? newImage.projectIDs.push(newProject.id.to_s) : nil
                  newImage.save
                end
              else
                # No Image with with 'filename' was uploaded. So unlink this Side from existing mapping. 
                side.image = {}
                side.save
              end
            else
              # Image already exists with the curent_user. Link that Image to this Side.
                side.image["url"]=@base_api_url+"/images/"+image.id.to_s+"_"+image.filename
                side.save
                !(image.sideIDs.include?(side.id.to_s)) ? image.sideIDs.push(side.id.to_s) : nil
                !(image.projectIDs.include?(newProject.id.to_s)) ? image.projectIDs.push(newProject.id.to_s) : nil
                image.save
            end
          end
        end
      rescue Exception => e
        p e.message
      end
    end
  end
end

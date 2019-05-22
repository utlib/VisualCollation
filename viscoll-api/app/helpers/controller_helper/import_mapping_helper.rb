require 'zip'

module ControllerHelper
  module ImportMappingHelper
    def decodeZip(imageData)
      # Get the zip
      tempzip = Tempfile.new('images.zip')
      tempzip.binmode
      regexp = /\Adata:([-\w]+\/[-\w\+\.]+)?;base64,(.*)/m
      parts = imageData.match(regexp)
      data = StringIO.new(Base64.decode64(parts[-1] || ""))
      while part = data.read(16*1024)
        tempzip.write(part)
      end
      tempzip.rewind
      return tempzip
    end
    
    def handleMappingImport(newProject, imageData, current_user)
      begin
        uploadedImages = {}
        if imageData.present?
          tempzip = decodeZip(imageData)
          Zip::File.open(tempzip.path) do |zip_file|
            zip_file.each do |file|
              # Go through each file and collect its info
              # The exported filename structure is: userGivenFilename_fileID.fileExtension
              filename = file.name.rpartition('_')[0]
              fileID = file.name.rpartition('_')[2].split('.')[0]
              extension = file.name.split('.')[1]
              tempfile = Tempfile.new("#{filename}")
              tempfile.binmode
              tempfile.write file.get_input_stream.read
              tempfile.rewind
              uploadedImages["#{filename}.#{extension}"] = {:fileID => fileID, :file => tempfile, :extension => extension}
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
              # Image object doesn't exist for current_user
              # Check if any Image with 'filename' was uploaded during import.
              if uploadedImages.key?(filename)
                # Check if filename already exists for current_user 
                existingImage = current_user.images.where(:filename => filename).first
                if existingImage
                  # Check if this new Image is different from the existing Image
                  if uploadedImages[filename][:fileID] == existingImage.fileID
                    # Same Image, so link this Image to the Side
                    side.image["url"]=@base_api_url+"/images/"+existingImage.id.to_s+"_"+existingImage.filename
                    side.save
                    !(existingImage.sideIDs.include?(side.id.to_s)) ? existingImage.sideIDs.push(side.id.to_s) : nil
                    !(existingImage.projectIDs.include?(newProject.id.to_s)) ? existingImage.projectIDs.push(newProject.id.to_s) : nil
                    existingImage.save
                  else
                    # Different Image, but with already existing filename. Rename the newImage and link to this Side.
                    filenameOnly = filename.rpartition(".")[0]
                    newFilename = "#{filenameOnly}(copy).#{uploadedImages[filename][:extension]}"
                    # check if filename already exists, if it does, add another "(copy)"
                    imageWithFilename = current_user.images.where(:filename => newFilename).first
                    while imageWithFilename
                      newFilename = "#{newFilename.rpartition(".")[0]}(copy).#{uploadedImages[filename][:extension]}"
                      imageWithFilename = current_user.images.where(:filename => newFilename).first
                    end
                    uploader = Shrine.new(:store)
                    uploaded_file = uploader.upload(uploadedImages[filename][:file], metadata: {"filename"=>newFilename, "mime_type": "image/#{uploadedImages[filename][:extension]}"})
                    newImage = Image.new(user: current_user, filename: newFilename, fileID: uploaded_file.id, metadata: uploaded_file.metadata, projectIDs: [newProject.id.to_s])
                    side.image["url"]=@base_api_url+"/images/"+newImage.id.to_s+"_"+newFilename
                    side.save
                    !(newImage.sideIDs.include?(side.id.to_s)) ? newImage.sideIDs.push(side.id.to_s) : nil
                    !(newImage.projectIDs.include?(newProject.id.to_s)) ? newImage.projectIDs.push(newProject.id.to_s) : nil
                    newImage.save
                  end
                else
                  # Image object doesn't exist with filename
                  # Create Image
                  uploader = Shrine.new(:store)
                  uploaded_file = uploader.upload(uploadedImages[filename][:file], metadata: {"filename"=>"#{filename}", "mime_type": "image/#{uploadedImages[filename][:extension]}"})
                  newImage = Image.new(user: current_user, filename: filename, fileID: uploaded_file.id, metadata: uploaded_file.metadata, projectIDs: [newProject.id.to_s])
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

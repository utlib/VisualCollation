FactoryGirl.define do
  sequence :image_filename do |n|
    "Image #{n}"
  end

  sequence :image_fileid do |n|
    "#{n}"
  end
  
  sequence :image_original_filename do |n|
    "image_#{n}"
  end
  
  factory :image do
    filename { generate(:image_filename) }
    
    factory :pixel do
      filename { 'pixel.png'}
      fileID { 'pixel'}
      metadata { {
        "filename": "pixel.png",
        "size": 20470,
        "mime_type": "image/png"
      } }
    end
    
    factory :shiba_inu do
      filename { 'shiba_inu.png'}
      fileID { 'shiba_inu'}
      metadata { {
        "filename": "shiba_inu.png",
        "size": 20470,
        "mime_type": "image/png"
      } }
    end
    
    factory :viscoll_logo do
      filename { 'viscoll_logo.png'}
      fileID { 'viscoll_logo'}
      metadata { {
        "filename": "viscoll_logo.png",
        "size": 20470,
        "mime_type": "image/png"
      } }
    end
  end
end

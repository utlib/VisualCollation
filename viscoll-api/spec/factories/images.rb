FactoryGirl.define do
  sequence :image_filename do |n|
    "Image #{n}"
  end
  
  sequence :image_original_filename do |n|
    "image_#{n}"
  end
  
  factory :image do
    filename { generate(:image_filename) }
    
    factory :pixel do
      image { File.new(File.dirname(__FILE__) + '/../fixtures/pixel.png', 'rb') }
    end
    
    factory :shiba_inu do
      image { File.new(File.dirname(__FILE__) + '/../fixtures/shibainu.jpg', 'rb') }
    end
    
    factory :viscoll_logo do
      image { File.new(File.dirname(__FILE__) + '/../fixtures/viscoll.png', 'rb') }
    end
  end
end

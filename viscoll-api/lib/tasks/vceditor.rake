namespace :vce do
  desc "Update Leaf#stubType to Yes|No values"
  task :update_stubs => :environment do
    Leaf.all.each do |leaf|
      next if %w{No Yes}.include? leaf.stubType
      case leaf.stubType
      when 'None'
        leaf.stubType = 'No'
      when 'Added'
        leaf.stubType = 'Yes'
        leaf.type = 'Added'
      when 'Original'
        leaf.stubType = 'Yes'
        leaf.type = 'Original'
      end
      leaf.save!
    end
  end
end
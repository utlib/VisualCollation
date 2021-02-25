namespace :vce do
  desc "Update Leaf#stub_type to Yes|No values"
  task :update_stubs do
    Leaf.all.each do |leaf|
      next if %w{No Yes}.include? leaf.stub_type
      case leaf.stub_type
      when 'None'
        leaf.stub_type = 'No'
      when 'Added'
        leaf.stub_type = 'Yes'
        leaf.type = 'Added'
      when 'Original'
        leaf.stub_type = 'Yes'
        leaf.type = 'Original'
      end
      leaf.save!
    end
  end
end
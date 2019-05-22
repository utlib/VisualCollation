class Image
  include Mongoid::Document

  # Fields
  field :filename, type: String
  field :fileID, type: String
  field :metadata, type: Hash
  field :projectIDs, type: Array, default: []  # List of projectIDs this image belongs to
  field :sideIDs, type: Array, default: []  # List of sideIDs this image is mapped to

  # Relations
  belongs_to :user, inverse_of: :images

  # Callbacks
  before_destroy :unlink_sides_before_delete, :delete_file
  validates_uniqueness_of :filename, :message => "Image with filename: '%{value}', already exists.", scope: :user

  protected
  # If linked to side(s), remove link from the side(s)
  def unlink_sides_before_delete
    self.sideIDs.each do |sideID|
      if side = Side.where(:id => sideID).first
        side.image = {}
        side.save
      end
    end
  end

  def delete_file
    path = "#{Rails.root}/public/uploads/#{self.fileID}"
    if File.file?(path)
      File.delete(path)
    end
  end

end

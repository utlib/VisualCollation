class Image
  include Mongoid::Document
  include Mongoid::Paperclip

  # Fields
  has_mongoid_attached_file :image
  field :filename, type: String
  field :projectIDs, type: Array, default: []  # List of projectIDs this image belongs to
  field :sideIDs, type: Array, default: []  # List of sideIDs this image is mapped to

  # Relations
  belongs_to :user, inverse_of: :images

  # Callbacks
  before_destroy :unlink_sides_before_delete

  validates_attachment :image, content_type: { content_type: ["image/jpeg", "image/gif", "image/png"] }
  do_not_validate_attachment_file_type :image
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

  Paperclip.interpolates :userID do |attachment, style|
    attachment.instance.user.id.to_s
  end

  Paperclip.interpolates :extension do |attachment, style|
    attachment.instance.image_content_type.split("/")[-1]
  end

end

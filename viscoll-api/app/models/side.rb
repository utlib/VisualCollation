class Side
  include Mongoid::Document
  include Mongoid::Timestamps

  # Fields
  field :page_number, type: String, default: nil
  field :texture, type: String, default: "None"
  field :script_direction, type: String, default: "None"
  field :image, type: Hash, default: lambda { { } } # {manifestID: 123, label: "bla, " url: "https://iiif.library.utoronto.ca/image/v2/hollar:Hollar_a_3002_0001"}
  field :parentID, type: String
  field :side, type: String # either 'r' or 'v'

  # Relations
  belongs_to :project
  has_and_belongs_to_many :notes, inverse_of: nil

  # Callbacks
  before_destroy :unlink_notes, :unlink_image

  def parent_leaf
    Leaf.find(parentID)
  end

  protected
  # If linked to note(s), remove link from the note(s)'s side
  def unlink_notes
    self.notes.each do | note |
      note.objects[:Recto].delete(self.id.to_s)
      note.objects[:Verso].delete(self.id.to_s)
      note.save
    end
  end

  # If linked to image, remove link from the image's sides list
  def unlink_image
    if not self.image.empty?
      if (image = Image.where(:id => self.image[:url].split("/")[-1].split("_", 2)[0]).first)
        image.sideIDs.delete(self.id.to_s)
        image.save
      end
    end
  end
end

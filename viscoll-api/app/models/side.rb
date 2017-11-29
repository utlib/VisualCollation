class Side
  include Mongoid::Document
  include Mongoid::Timestamps

  # Fields
  field :folio_number, type: String, default: nil
  field :texture, type: String, default: "None"
  field :script_direction, type: String, default: "None"
  field :image, type: Hash, default: lambda { { } } # {manifestID: 123, label: "bla, " url: "https://iiif.library.utoronto.ca/image/v2/hollar:Hollar_a_3002_0001"}
  field :parentID, type: String
    
  # Relations
  belongs_to :project
  has_and_belongs_to_many :notes, inverse_of: nil

  # Callbacks
  before_destroy :unlink_notes

  protected
  # If linked to note(s), remove link from the note(s)'s side
  def unlink_notes 
    self.notes.each do | note | 
      note.objects[:Recto].delete(self.id.to_s)
      note.objects[:Verso].delete(self.id.to_s)
      note.save
    end
  end
end

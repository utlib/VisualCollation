class Note
  include Mongoid::Document
  include Mongoid::Timestamps

  # Fields
  field :title, type: String, default: "None"
  field :type, type: String, default: ""
  field :description, type: String, default: ""
  field :objects, type: Hash, default: {Group: [], Leaf: [], Recto: [], Verso: []}
  field :show, type: Boolean, default: false

  # Relations
  belongs_to :project, inverse_of: :notes

  # Validations
  validates_presence_of :title, :message => "Note title is required."
  validates_uniqueness_of :title, :message => "Note title should be unique.", scope: :project
  validates_presence_of :type, :message => "Note type is required."

  # Callbacks
  before_destroy :update_objects_before_delete

  def update_objects_before_delete
    self.objects[:Group].each do |groupID|
      if group = Group.where(:id => groupID).first
        group.notes.delete(self)
        group.save
      end
    end
    self.objects[:Leaf].each do |leafID|
      if leaf = Leaf.where(:id => leafID).first
        leaf.notes.delete(self)
        leaf.save
      end
    end
    self.objects[:Recto].each do |sideID|
      if side = Side.where(:id => sideID).first
        side.notes.delete(self)
        side.save
      end
    end
    self.objects[:Verso].each do |sideID|
      if side = Side.where(:id => sideID).first
        side.notes.delete(self)
        side.save
      end
    end
  end
end

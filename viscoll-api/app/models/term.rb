class Term
  include Mongoid::Document
  include Mongoid::Timestamps

  # Fields
  field :title, type: String, default: "None"
  field :taxonomy, type: String, default: ""
  field :description, type: String, default: ""
  field :uri, type: String, default: ""
  field :objects, type: Hash, default: {Group: [], Leaf: [], Recto: [], Verso: []}
  field :show, type: Boolean, default: false

  # Relations
  belongs_to :project, inverse_of: :terms

  # Validations
  validates_presence_of :title, :message => "Note title is required."
  validates_uniqueness_of :title, :message => "Note title should be unique.", scope: :project
  validates_presence_of :taxonomy, :message => "Taxonomy is required."

  # Callbacks
  before_destroy :update_objects_before_delete

  def update_objects_before_delete
    self.objects[:Group].each do |groupID|
      if group = Group.where(:id => groupID).first
        group.terms.delete(self)
        group.save
      end
    end
    self.objects[:Leaf].each do |leafID|
      if leaf = Leaf.where(:id => leafID).first
        leaf.terms.delete(self)
        leaf.save
      end
    end
    self.objects[:Recto].each do |sideID|
      if side = Side.where(:id => sideID).first
        side.terms.delete(self)
        side.save
      end
    end
    self.objects[:Verso].each do |sideID|
      if side = Side.where(:id => sideID).first
        side.terms.delete(self)
        side.save
      end
    end
  end
end

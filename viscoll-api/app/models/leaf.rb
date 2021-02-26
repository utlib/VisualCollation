class Leaf
  include Mongoid::Document
  include Mongoid::Timestamps

  # Fields
  field :folio_number, type: String, default: nil
  field :material, type: String, default: "None"
  field :type, type: String, default: "Original"
  field :conjoined_to, type: String
  field :attached_above, type: String, default: "None"
  field :attached_below, type: String, default: "None"
  field :stubType, :as => :stub, type: String, default: "No"
  field :parentID, type: String
  field :nestLevel, type: Integer, default: 1
  field :rectoID, type: String
  field :versoID, type: String

  # Relations
  belongs_to :project
  has_and_belongs_to_many :terms, inverse_of: nil

  # Callbacks
  before_create :edit_ID, :create_sides
  before_destroy :unlink_terms, :destroy_sides, :update_parent_group

  def parent_project
    group = Group.find(self.parentID)
    Project.find(group.parentID)
  end

  # Remove itself from its parent group
  def remove_from_group
    Group.find(self.parentID).remove_members([self.id.to_s])
  end

  def top_level_group
    parent = Group.find(self.parentID)
    nest_level = parent.nestLevel
    while nest_level > 1
      parent = Group.find(parent.parentID)
      nest_level = parent.nestLevel
    end
    parent
  end

  def position_in_top_level_group
    self.top_level_group.all_leafIDs_in_order.index(self.id) + 1
  end

  protected
  def edit_ID
    self.id = "Leaf_"+self.id.to_s unless self.id.to_s[0]=="L"
  end

  # If linked to term(s), remove link from the term(s)'s side
  def unlink_terms
    self.terms.each do | term |
      term.objects[:Leaf].delete(self.id.to_s)
      term.save
    end
  end

  # Create 2 sides(Recto & Verso) for this new leaf.
  def create_sides
    recto = Side.new({parentID: self.id.to_s, project: self.project})
    verso = Side.new({parentID: self.id.to_s, project: self.project})
    recto.id = "Recto_"+recto.id.to_s
    verso.id = "Verso_"+verso.id.to_s
    recto.save
    verso.save
    self.rectoID = recto.id
    self.versoID = verso.id
  end

  # Destroy its two sides
  def destroy_sides
    Side.find(self.rectoID).destroy
    Side.find(self.versoID).destroy
  end

  def update_attached_to
    project = Project.find(self.project_id)
    parent = project.groups.find(self.parentID)
    memberOrder = parent.memberIDs.index(self.id.to_s)
    if memberOrder > 0
      # This leaf is not the first leaf in the group
      aboveLeaf = project.leafs.find(parent.memberIDs[memberOrder-1])
      aboveLeaf.update(attached_below: self.attached_above)
    end
    if memberOrder < parent.memberIDs.length - 1
      belowLeaf = project.leafs.find(parent.memberIDs[memberOrder+1])
      belowLeaf.update(attached_above: self.attached_below)
    end
  end

  # Update leaf's parent Group's Tacketed & Sewing if it contains this leafID
  def update_parent_group
    group = Group.find(self.parentID)
    group.tacketed.include?(self.id.to_s) ? group.tacketed.delete(self.id.to_s) : nil
    group.sewing.include?(self.id.to_s) ? group.sewing.delete(self.id.to_s) : nil
    group.save
  end
end


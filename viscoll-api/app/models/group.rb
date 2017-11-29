class Group
  include Mongoid::Document
  include Mongoid::Timestamps

  # Fields
  field :title, type: String, default: "None"
  field :type, type: String, default: "None"
  field :tacketed, type: Array, default: []
  field :sewing, type: Array, default: []
  field :nestLevel, type: Integer, default: 1
  field :parentID, type: String
  field :memberIDs, type: Array, default: [] # eg [ id1, id2, ... ]

  # Relations
  belongs_to :project
  has_and_belongs_to_many :notes, inverse_of: nil

  # Callbacks
  before_create :edit_ID
  before_destroy :unlink_notes, :unlink_project, :unlink_group, :destroy_members


  def edit_ID
    self.id = "Group_"+self.id.to_s unless self.id.to_s[0] == "G"
  end

  # Add new members to this group
  def add_members(memberIDs, startOrder, save=true)
    if self.memberIDs.length==0 
      self.memberIDs = memberIDs
    elsif
      self.memberIDs.insert(startOrder-1, *memberIDs)
    end
    if save
      self.save
    end
    return self
  end

  def remove_members(ids)
    newList = self.memberIDs.reject{|id| ids.include?(id)}
    self.memberIDs = newList
    self.save
  end

  # If linked to note(s), remove link from the note(s)'s side
  def unlink_notes 
    if self.notes
      self.notes.each do | note | 
        note.objects[:Group].delete(self.id.to_s)
        note.save
      end
    end
  end

  # Remove itself from project
  def unlink_project
    self.project.remove_groupID(self.id.to_s)
  end

  # Remove itself from parent group (if nested)
  def unlink_group
    if self.parentID != nil
      Group.find(self.parentID).remove_members([self.id.to_s])
    end
  end

  def destroy_members
    self.memberIDs.each do | memberID | 
      if memberID[0] === "G"
        Group.find(memberID).destroy
      elsif memberID[0] === "L"
        Leaf.find(memberID).destroy
      end
    end
  end

end

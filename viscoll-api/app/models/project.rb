class Project
  include Mongoid::Document
  include Mongoid::Timestamps

  # Fields
  field :title, type: String
  field :shelfmark, type: String # (eg) "MS 1754"
  field :metadata, type: Hash, default: lambda { { } } # (eg) {date: "19th century"}
  field :manifests, type: Hash, default: lambda { { } } # (eg) { "1234556": { id: "123456, name: "", url: ""} }
  field :noteTypes, type: Array, default: ["Unknown"] # custom notetypes
  field :preferences, type: Hash, default: lambda { { :showTips => true } }
  field :groupIDs, type: Array, default: []

  # Relations
  belongs_to :user, inverse_of: :projects
  has_many :groups, dependent: :delete
  has_many :leafs, dependent: :delete
  has_many :sides, dependent: :delete
  has_many :notes, dependent: :delete
 
  # Validations
  validates_presence_of :title, :message => "Project title is required."
  validates_uniqueness_of :title, :message => "Project title: '%{value}', must be unique.", scope: :user

  def add_groupIDs(groupIDs, index)
    if self.groupIDs.length == 0
      self.groupIDs = groupIDs
    else 
      self.groupIDs.insert(index, *groupIDs)
    end
    self.save()
  end
  
  def remove_groupID(groupID)
    self.groupIDs.delete(groupID)
    self.save()
  end

end

class User
  include Mongoid::Document
  include RailsJwtAuth::Authenticatable
  include RailsJwtAuth::Confirmable
  include RailsJwtAuth::Recoverable
  include RailsJwtAuth::Trackable
  
  field :name, type: String, default: ""

  has_many :images, dependent: :destroy
  has_many :projects, dependent: :destroy

end

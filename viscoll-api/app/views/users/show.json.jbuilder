json.extract! @user, :id, :name, :email
json.projects(@user.projects) do | project |
  json.id project.id
  json.merge! project.attributes.except("_id", "user_id")
end
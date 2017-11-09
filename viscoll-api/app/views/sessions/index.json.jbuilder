json.session do
  json.jwt @userToken
  json.id @user.id
  json.email @user.email
  json.name @user.name
  json.lastLoggedIn @user.last_sign_in_at
  
  json.projects(@userProjects) do | project |
    json.id project.id
    json.merge! project.attributes.except("_id", "user_id")
  end
  
end

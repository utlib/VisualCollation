json.set! "projects" do
  json.array!(@projects.desc(:updated_at)) do | project |
    json.extract! project, :id, :title, :shelfmark, :notationStyle, :metadata, :created_at, :updated_at
  end
end

json.set! "images" do 
  json.array!(@images) do | image |
    json.extract! image, :id, :projectIDs, :sideIDs
    json.url @base_api_url+"/images/"+image.id.to_s+"_"+image.filename
    json.label image.filename
  end
end
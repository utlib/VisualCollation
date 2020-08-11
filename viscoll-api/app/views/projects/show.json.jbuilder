json.set! "active" do
  json.id @data[:project][:id]
  json.title @data[:project][:title]
  json.notationStyle @data[:project][:notationStyle]
  json.shelfmark @data[:project][:shelfmark]
  json.metadata @data[:project][:metadata]
  json.preferences @data[:project][:preferences]
  json.noteTypes @data[:project][:noteTypes]

  json.set! "manifests" do
    json.set! "DIYImages" do 
      json.id "DIYImages"
      json.images @diyImages
      json.name "Uploaded Images"
    end
    json.merge! @data[:project][:manifests]
  end

  json.groupIDs @data[:groupIDs]
  json.leafIDs @data[:leafIDs]
  json.rectoIDs @data[:rectoIDs]
  json.versoIDs @data[:versoIDs]

  json.Groups @data[:groups]
  json.Leafs @data[:leafs]
  json.Rectos @data[:rectos]
  json.Versos @data[:versos]
  json.Notes @data[:notes]
end

json.set! "dashboard" do
  json.set! "projects" do
    json.array!(@projects.desc(:updated_at)) do | project |
      json.extract! project, :id, :title, :shelfmark, :metadata, :created_at, :updated_at
    end
  end

  json.set! "images" do 
    json.array!(@images) do | image |
      json.extract! image, :id, :projectIDs, :sideIDs
      json.url @base_api_url+"/images/"+image.id.to_s+"_"+image.filename
      json.label image.filename
    end
  end
end
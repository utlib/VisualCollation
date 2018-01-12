json.id @data[:project][:id]
json.title @data[:project][:title]
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
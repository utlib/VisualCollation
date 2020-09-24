json.set! 'Export' do
  json.project @data[:project]
  json.Groups @data[:groups]
  json.Leafs @data[:leafs]
  json.Rectos @data[:rectos]
  json.Versos @data[:versos]
  json.Notes @data[:terms]
end

json.set! 'Images' do
  if @zipFilePath
    json.exportedImages @zipFilePath
  else
    json.exportedImages ""
  end
end

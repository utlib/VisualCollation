json.merge! @data[:project]

json.groupIDs @data[:groupIDs]
json.leafIDs @data[:leafIDs]
json.rectoIDs @data[:rectoIDs]
json.versoIDs @data[:versoIDs]

json.Groups @data[:groups]
json.Leafs @data[:leafs]
json.Rectos @data[:rectos]
json.Versos @data[:versos]
json.Notes @data[:notes]
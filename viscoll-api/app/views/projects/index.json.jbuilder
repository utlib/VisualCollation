json.array!(@projects.desc(:updated_at)) do | project |
 json.extract! project, :id, :title, :shelfmark, :metadata, :created_at, :updated_at
end
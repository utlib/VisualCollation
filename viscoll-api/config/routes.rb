Rails.application.routes.draw do

  # AUTHENTICATION ENDPOINTS
  resource :session, controller: 'sessions', only: [:create, :destroy], defaults: {format: :json}
  resource :registration, controller: 'registrations', only: [:create], defaults: {format: :json}
  resource :registration, controller: 'rails_jwt_auth/registrations', only: [:create, :update, :destroy]
  resource :password, controller: 'rails_jwt_auth/passwords', only: [:create, :update]
  resource :confirmation, controller: 'rails_jwt_auth/confirmations', only: [:create]
  resource :confirmation, controller: 'confirmations', only: [:update]

  # USER ENDPOINTS 
  resources :users, defaults: {format: :json}, only: [:show, :update, :destroy]
  post '/feedback', to: 'feedback#create', defaults: {format: :json}

  # PROJECT ENDPOINTS 
  put '/projects/:id/filter', to: 'filter#show', defaults: {format: :json}
  get '/projects/:id/export/:format', to: 'export#show', defaults: {format: :json}
  get '/projects/:id/clone', to: 'projects#clone', defaults: {format: :json}
  put '/projects/import', to: 'import#index', defaults: {format: :json}
  post '/projects/:id/manifests', to: 'projects#createManifest', defaults: {format: :json}
  put '/projects/:id/manifests', to: 'projects#updateManifest', defaults: {format: :json}
  delete '/projects/:id/manifests', to: 'projects#deleteManifest', defaults: {format: :json}
  resources :projects, defaults: {format: :json}, only: [:index, :show, :update, :destroy, :create]

  # DIY IMAGE ENDPOINTS 
  post '/images', to: 'images#uploadImages', defaults: {format: :json}
  put '/images/link', to: 'images#link', defaults: {format: :json}
  put '/images/unlink', to: 'images#unlink', defaults: {format: :json}
  get '/images/:imageID_filename', to: 'images#show', defaults: {format: :json}
  get '/images/zip/:id', to: 'images#getZipImages', defaults: {format: :json}
  delete '/images', to: 'images#destroy', defaults: {format: :json}

  # GROUP ENDPOINTS 
  resources :groups, defaults: {format: :json}, only: [:update, :destroy, :create]
  put '/groups', to: 'groups#updateMultiple', defaults: {format: :json}, only: [:update]
  delete '/groups', to: 'groups#destroyMultiple', defaults: {format: :json}, only: [:destroy]

  # LEAF ENDPOINTS 
  put '/leafs/generateFolio', to: 'leafs#generateFolio', defaults: {format: :json}, only: [:update]
  put '/leafs/conjoin', to: 'leafs#conjoinLeafs', defaults: {format: :json}, only: [:update]
  put '/leafs', to: 'leafs#updateMultiple', defaults: {format: :json}, only: [:update]
  delete '/leafs', to: 'leafs#destroyMultiple', defaults: {format: :json}, only: [:destroy]
  resources :leafs, defaults: {format: :json}, only: [:update, :destroy, :create]

  # SIDE ENDPOINTS 
  put '/sides/:id', to: 'sides#update', defaults: {format: :json}, only: [:update]
  put '/sides', to: 'sides#updateMultiple', defaults: {format: :json}, only: [:update]

  # NOTE ENDPOINTS 
  put '/notes/:id/link', to: 'notes#link', defaults: {format: :json}, only: [:update]
  put '/notes/:id/unlink', to: 'notes#unlink', defaults: {format: :json}, only: [:update]
  post '/notes/type', to: 'notes#createType', defaults: {format: :json}, only: [:create]
  put '/notes/type', to: 'notes#updateType', defaults: {format: :json}, only: [:update]
  delete '/notes/type', to: 'notes#deleteType', defaults: {format: :json}, only: [:destroy]
  resources :notes, defaults: {format: :json}, only: [:show, :update, :destroy, :create]

  # DOCUMENTATION
  get '/docs' => redirect('/docs/index.html')


end

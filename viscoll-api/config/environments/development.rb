Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  # In the development environment your application's code is reloaded on
  # every request. This slows down response time but is perfect for development
  # since you don't have to restart the web server when you make code changes.
  config.cache_classes = false

  # Do not eager load code on boot.
  config.eager_load = false

  # Show full error reports.
  config.consider_all_requests_local = true

  # Enable/disable caching. By default caching is disabled.
  if Rails.root.join('tmp/caching-dev.txt').exist?
    config.action_controller.perform_caching = true

    config.cache_store = :memory_store
    config.public_file_server.headers = {
      'Cache-Control' => 'public, max-age=172800'
    }
  else
    config.action_controller.perform_caching = false

    config.cache_store = :null_store
  end

  # Don't care if the mailer can't send.
  config.action_mailer.raise_delivery_errors = false

  config.action_mailer.perform_caching = false
  config.action_mailer.delivery_method = :smtp
  config.action_mailer.default_url_options = { :host => "localhost", :port => 3000 }
  # config.action_mailer.smtp_settings = {
  #   :address => 'smtp.ethereal.email',
  #   :port => 587,
  #   :user_name => 'brady.wiegand@ethereal.email',
  #   :password => '2DzDyRf6Q22n21FV2q'
  # }
  config.action_mailer.smtp_settings = {
    :address => ENV['MAILER_HOST'],
    :port => ENV['MAILER_PORT'],
    :user_name => ENV['MAILER_USR'],
    :password => ENV['MAILER_PWD']
  }
  # Print deprecation notices to the Rails logger.
  config.active_support.deprecation = :log


  # Raises error for missing translations
  # config.action_view.raise_on_missing_translations = true

  # Use an evented file watcher to asynchronously detect changes in source code,
  # routes, locales, etc. This feature depends on the listen gem.
  config.file_watcher = ActiveSupport::EventedFileUpdateChecker

  config.middleware.insert_before 0, Rack::Cors do
    allow do
      origins '*'
      resource '*', :headers => :any, :methods => [:get, :post, :put, :patch, :options, :delete]
    end
  end

  logger           = ActiveSupport::Logger.new(STDOUT)
  logger.formatter = config.log_formatter
  config.logger = ActiveSupport::TaggedLogging.new(logger)

end

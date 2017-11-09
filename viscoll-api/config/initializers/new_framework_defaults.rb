# Be sure to restart your server when you modify this file.
#
# This file contains migration options to ease your Rails 5.0 upgrade.
#
# Read the Guide for Upgrading Ruby on Rails for more info on each option.

Rails.application.config.raise_on_unfiltered_parameters = true

# Make Ruby 2.4 preserve the timezone of the receiver when calling `to_time`.
# Previous versions had false.
ActiveSupport.to_time_preserves_timezone = true

# Do not halt callback chains when a callback returns false. Previous versions had true.
# DEPRECATION WARNING: ActiveSupport.halt_callback_chains_on_return_false= is deprecated 
# and will be removed in Rails 5.2.
# ActiveSupport.halt_callback_chains_on_return_false = false

# Configure SSL options to enable HSTS with subdomains. Previous versions had false.
Rails.application.config.ssl_options = { hsts: { subdomains: true } }

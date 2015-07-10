require 'bundler/setup'

require 'pakyow'
require 'sequel'
require 'httparty'
require 'json'

# $db = Sequel.sqlite
#
# $db.create_table :profiles do
#   primary_key :id
#   String :email
#   String :objective
#   String :imgurl
#   String :name
#
# end

Pakyow::App.define do
  configure :global do
    app.name = 'Wall Me'
  end

  configure :development do
    # This creates a local environment file to avoid collisions of local settings.
    require 'dotenv'
    Dotenv.load

    app.errors_in_browser = false

    $db = Sequel.sqlite

    $db.create_table :profiles do
      primary_key :id
      String :email
      String :objective
      String :imgurl
      String :name

    end
  end

  configure :prototype do
    # an environment for running the front-end prototype with no backend
    app.ignore_routes = true
  end

  configure :production do
    require 'dotenv'
    Dotenv.load
    # suggested production configuration
    app.static = true
    app.log_output = true
    app.auto_reload = false
    app.errors_in_browser = false

    puts "Resetting the pg database."
    database = ENV['DATABASE_URL'].split('/').last
    `dropdb #{database}`
    `createdb #{database}`

    $db = Sequel.connect(ENV['DATABASE_URL'])
    $db.create_table :profiles do
      primary_key :id
      String :email
      String :objective
      String :imgurl
      String :name

    end
  end

  middleware do |builder|
    builder.use Rack::Session::Cookie, key: "#{Pakyow::Config.app.name}.session", secret: 'sekret'
  end
end

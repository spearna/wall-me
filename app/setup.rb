require 'bundler/setup'

require 'pakyow'
require 'sequel'
require 'httparty'
require 'json'
require 'csv'


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

  configure :staging do
    # an environment for running "production" locally with .env variales
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

  configure :production do
    # suggested production configuration
    app.static = true
    app.log_output = true
    app.auto_reload = false
    app.errors_in_browser = false
    realtime.redis = { url: ENV['REDIS_URL'] }

    $db = Sequel.connect(ENV['DATABASE_URL'])
    $db.run("DROP TABLE IF EXISTS profiles;")
    $db.create_table :profiles do
      primary_key :id
      String :email
      String :objective
      String :imgurl
      String :name

    end
  end
end

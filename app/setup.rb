require 'bundler/setup'

require 'pakyow'
require 'sequel'
require 'httparty'
require 'json'
require 'csv'

require 'pp'

# $db = Sequel.sqlite

# $db.create_table :profiles do
#  primary_key :id
#  String :firstName
#  String :lastName
#  String :imgurl
#  String :email
#  String :objective
# end


Pakyow::App.define do
  configure :global do
    Bundler.require :default, Pakyow::Config.env

    if defined?(Dotenv)
      env_path = ".env.#{Pakyow::Config.env}"
      Dotenv.load env_path if File.exist?(env_path)
      Dotenv.load
    end

    app.name = 'Wall Me'
  end

  configure :development do
    # This creates a local environment file to avoid collisions of local settings.
    require 'dotenv'
    Dotenv.load

    app.errors_in_browser = false
    # Points to the local .env file as to avoid collisions for developers
    # Performing check to see the DB ENV is set for a local database for development;
    #    if not, it defaults to use the remote development database.
    $db = Sequel.sqlite

    $db.create_table :profiles do
     primary_key :id
     String :firstName
     String :lastName
     String :imgurl
     String :email
     String :objective
   end
 end

 configure :production do

    # suggested production configuration
    app.static = true
    app.log_output = true
    app.auto_reload = false
    app.errors_in_browser = false

    $db = Sequel.connect(ENV['DATABASE_URL'])
    # $db = Sequel.connect('DATABASE_URL')
    # $db.create_table :profiles do
    #  primary_key :id
    #  String :firstName
    #  String :lastName
    #  String :imgurl
    #  String :email
    #  String :objective
   end


   realtime.redis = { url: ENV['REDISTOGO_URL'] }
   app.log_output = true
 end

end




  # configure :development do
  #   # This creates a local environment file to avoid collisions of local settings.
  #   require 'dotenv'
  #   Dotenv.load

  #   app.errors_in_browser = false

  #   $db = Sequel.sqlite

  #   $db.create_table :profiles do
  #     primary_key :id
  #     String :email
  #     String :objective
  #     String :imgurl
  #     String :name

  #   end
  # end

  # configure :staging do
  #   # an environment for running "production" locally with .env variales
  #   require 'dotenv'
  #   Dotenv.load
  #   # suggested production configuration
  #   app.static = true
  #   app.log_output = true
  #   app.auto_reload = false
  #   app.errors_in_browser = false

  #   puts "Resetting the pg database."
  #   database = ENV['DATABASE_URL'].split('/').last
  #   `dropdb #{database}`
  #   `createdb #{database}`

  #   $db = Sequel.connect(ENV['DATABASE_URL'])
  #   $db.create_table :profiles do
  #     primary_key :id
  #     String :email
  #     String :objective
  #     String :imgurl
  #     String :name

  #   end
  # end

  # configure :production do

  #   realtime.redis = { url: ENV['REDIS_URL'] }
  #   # suggested production configuration
  #   app.static = true
  #   app.log_output = true
  #   app.auto_reload = false
  #   app.errors_in_browser = false
  #   realtime.redis = { url: ENV['REDIS_URL'] }

  #   $db = Sequel.connect(ENV['DATABASE_URL'])
  #   $db.run("DROP TABLE IF EXISTS profiles;")
  #   $db.create_table :profiles do
  #     primary_key :id
  #     String :email
  #     String :objective
  #     String :imgurl
  #     String :name

  #   end
  # end
# end

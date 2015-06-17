require 'bundler/setup'

require 'pakyow'
require 'sequel'

$db = Sequel.sqlite

$db.create_table :messages do
  primary_key :id
  String :body
end

$db.create_table :profiles do
  primary_key :id
  String :email
  String :objective
  
end

Pakyow::App.define do
  configure :global do
    app.name = 'Wall Me'
  end

  middleware do |builder|
    builder.use Rack::Session::Cookie, key: "#{Pakyow::Config.app.name}.session", secret: 'sekret'
  end
end

require 'bundler/setup'

require 'pakyow'
require 'sequel'
require 'httparty'
require 'json'

$db = Sequel.sqlite

$db.create_table :profiles do
  primary_key :id
  String :email
  String :objective
  String :image_url
  String :name

end

Pakyow::App.define do
  configure :global do
    app.name = 'Wall Me'
  end

  middleware do |builder|
    builder.use Rack::Session::Cookie, key: "#{Pakyow::Config.app.name}.session", secret: 'sekret'
  end
end

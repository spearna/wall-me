require 'pakyow-rake'

# put your rake task here

require "sequel"

Sequel.extension :migration
# Import environment variables when dotenv is available
if Gem::Specification.find_all_by_name('dotenv').any?
  require 'dotenv'
  Dotenv.load
  Dotenv.overload(File.expand_path("../.env.#{ ENV['RACK_ENV'] || :development }", __FILE__))
end

Dir.glob('rake/*.rake').each { |r| import r }
Sequel.extension :migration

namespace :db do
  desc "Create and migrate the database"
  task :setup do
    puts "Setting up the database."

    %w(
    db:create
    db:migrate
    ).each {|t|
      puts "[Rake] #{t}"
      Rake::Task[t].invoke
    }
  end # :setup

  desc "Reset the database"
  task :reset do
    puts "Resetting the database."

    %w(
    db:drop
    db:setup
    ).each do |t|
      puts "[Rake] #{t}"
      Rake::Task[t].invoke
    end
  end # :reset

  desc "Drop the database"
  task :drop => [:terminate] do
    database = $db.opts[:database]
    $db.disconnect

    `dropdb #{database}`
  end # :drop

  desc "Create the database"
  task :create => [:'pakyow:prepare'] do
    database = $db.opts[:database]
    $db.disconnect

    `createdb #{database}`
  end #:create

  desc "Migrate the database"
  task :migrate => [:'pakyow:prepare'] do
    flags = "-M #{ENV['VERSION']}" if ENV['VERSION']
    `sequel -m migrations #{ENV['DATABASE_URL']} #{flags}`
    $db = Sequel.connect(ENV['DATABASE_URL']) if $db.nil?
    Sequel::Migrator.run($db, 'migrations', :use_transactions=>true)
  end # :migrate

  # via http://stackoverflow.com/questions/5108876/kill-a-postgresql-session-connection
  desc "Fix 'database is being accessed by other people'"
  task :terminate => [:'pakyow:prepare'] do
    unless $db.nil?
      $db.run <<-SQL
      SELECT
      pg_terminate_backend(pid)
      FROM
      pg_stat_activity
      WHERE
      -- don't kill my own connection!
      pid <> pg_backend_pid()
      -- don't kill the connections to other databases
      AND datname = '#{ENV['DB_NAME']}';
      SQL
    end
  end # :terminate

  # desc "Add data to the DB to test"
  # task :seed => ['pakyow:stage'] do
  #   profile = Profile.new
  #   profile.first_name = "Kyle"
  #   profile.last_name = "Newman"
  #   profile.email = "kyle@skylenewman.com"

  #   profile.password = "test123"
  #   profile.password_confirmation = "test123"

  #   profile.bio = "I’m not smart. I just wear glasses."
  #   profile.twitter = "skylenewman"
  #   profile.linkedin = "skylenewman"
  #   profile.facebook = "skylenewman"
  #   profile.image_url = nil
  #   profile.custom_url = nil
  #   profile.website_one = nil
  #   profile.website_two = nil
  #   profile.website_three = nil
  #   profile.company = nil

  #   profile.admin = true
  #   profile.client = true
  #   profile.staff = false
  #   profile.alum = false
  #   profile.save

  #   post = Post.new
  #   post.video_url = 'abc123'
  #   post.title = 'Batman'
  #   transcript = ''
  #   batman_lines = [
  #     "Bruce Wayne, eccentric billionaire.",
  #     "I can't do that as Bruce Wayne... as a man. I'm flesh and blood. I can be ignored, destroyed. But as a symbol, I can be incorruptible, I can be everlasting.",
  #     "I'll be standing where l belong. Between you and the peopIe of Gotham.",
  #     "I seek the means to fight injustice. To turn fear against those who prey on the fearful.",
  #     "Hero can be anyone. Even a man knowing something as simple and reassuring as putting a coat around a young boy shoulders to let him know the world hadn't ended.",
  #     "The first time I stole so that I wouldn't starve, yes. I lost many assumptions about the simple nature of right and wrong. And when I traveled I learned the fear before a crime and the thrill of success. But I never became one of them.",
  #     "Does it come in black?",
  #     "It's not who I am underneath but what I do that defines me.",
  #     "I'm Batman",
  #     "My anger outweights my guilt."
  #   ]
  #   batman_lines.each do |line|
  #     transcript = "#{transcript}<p>#{line}</p>"
  #   end
  #   post.transcript = transcript
  #   post.save

  # end
end
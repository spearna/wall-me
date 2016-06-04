require 'json'

module Rack
  class Request
    attr_accessor :flash
  end
end

Pakyow::App.routes do
  fn :flash do
    if session[:flash]
      request.flash = JSON.parse(session[:flash])
      session.delete :flash
    end
  end

  get '/', before: [:flash] do
    flash = request.flash
    profile = {}

    if flash and flash["profile"]
      profile = flash['profile']
    end
    
    view.partial(:short_form).scope(:profile).apply(profile)
    view.partial(:list).scope(:profile).mutate(:list, with: data(:profile).all).subscribe
  end

  get '/long_form', before: [:flash] do
    flash = request.flash
    profile = {}

    if flash and flash["profile"]
      profile = flash["profile"]
    end

    view.partial(:long_form).scope(:profile).apply(profile)
    view.partial(:list).scope(:profile).mutate(:list, with: data(:profile).all).subscribe
  end

  post '/' do
    profile = params[:profile]

    if profile["firstName"]
      profile = {email: profile["email.downcase"],
                 objective: profile["objective"],
                 name: "#{profile["firstName"]} #{profile["lastName"]}",
                 imgurl: "http://thecatapi.com/api/images/get?format=src&type=gif"}

      data(:profile).create(profile)
    else
      gravatar = Gravatar.fetch(profile[:email])

      if gravatar then
        profile.merge! name: gravatar.display_name, imgurl: gravatar.avatar_url
        data(:profile).create(profile)
      else
        session[:flash] = {profile: profile}.to_json
        redirect '/long_form'
      end
    end

    redirect '/'
  end                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           

  get '/export' do
    # Feature to locally export and save a roster.
    # Grab all Profile entries, build CSV, export to local machine via browser
    @profiles = Profile.all
    csv_string = CSV.generate do |csv|
         csv << ["Id", "Name", "Email", "Objective"]
         @profiles.each do |profile|
           csv << [profile.id, profile.name, profile.email, profile.objective]
         end
    end

   send csv_string, 'text/csv', 'profiles.csv'

  end

end #/routes

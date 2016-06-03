require 'json'

module Rack
  class Request
    attr_accessor :flash
  end
end

def form(request, view, form)
  puts "FLASH CONTENTS: #{request.flash}"
  flash = request.flash
  profile = {}

  if flash and flash["profile"]
    profile = flash['profile']
  end

  view.partial(form).scope(:profile).apply(profile)
  view.partial(:list).scope(:profile).mutate(:list, with: data(:profile).all).subscribe
end

Pakyow::App.routes do
  fn :flash do
    if session[:flash]
      request.flash = JSON.parse(session[:flash])
      session.delete :flash
    end
  end

  get '/', before: [:flash] do
    form(request, view, :short_form)
  end

  get '/long_form', before: [:flash] do
    form(request, view, :long_form)
  end

  post '/' do
    profile = params[:profile]

    if profile["firstName"]
      profile = {email: profile["email"],
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

end #/routes

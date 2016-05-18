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

  fn :flash_after do
    puts "HEY I GOT HERE"
  end

  get '/', before: [:flash] do
    flash = request.flash

    if flash and flash["profile"]
      view.partial(:form).scope(:profile).use(:long_form).bind(flash["profile"])
      view.partial(:form).scope(:error).bind({text: 'An error occurred'})
    else
      view.partial(:form).scope(:profile).use(:short_form).bind({})
    end

    view.partial(:list).scope(:profile).mutate(:list, with: data(:profile).all).subscribe
  end

  post '/', after: [:flash_after] do
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
      end
    end

    redirect '/'
  end

end #/routes

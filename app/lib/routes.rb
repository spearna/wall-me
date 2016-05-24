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
      profile['form_type'] = :long_form
      view.partial(:form).scope(:error).bind({text: 'An error occurred'})
    end

    view.partial(:form).scope(:profile).mutate(:render_form, with: profile).subscribe
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

    reroute '/', :get
  end

end #/routes

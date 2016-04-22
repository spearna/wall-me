# For the Wall Me app

# From a route, we can use the mutable to query for data:
#  # get all the users
#  data(:user).all
#
#  # get a specific user
#  data(:user).find(1)

Pakyow::App.routes do
  default do
    redirect router.group(:profile).path(:list)
  end

  restful :profile, '/profiles' do
    list do
      # Building view using data-version in _form.html to display short_form
      #  unless email lookup can't be found

      #TODO: Handle switching from short form to long if Gravatar can't find info
      view.partial(:form).scope(:profile).use(:short_form).bind({})

      # This is original view composition without data-versioning
      # view.partial(:form).scope(:profile).bind({})

      view.partial(:list).scope(:profile).mutate(:list, with: data(:profile).all).subscribe
    end

    create do
      # Getting email prop being submitted in form in profile view
      profile = params[:profile]
      gravatar = Gravatar.fetch(profile[:email])

      # If API response successful create record; else output error to view
      if gravatar then
        profile.merge! name: gravatar.display_name, imgurl: gravatar.avatar_url

        data(:profile).create(profile)
        redirect router.group(:profile).path(:list)

        #TODO: after record creation, re-autofocus form to email field
      else
        p "Couldn't find #{profile[:email]}"
        #TODO: Output error to view
      end

    end #/create
  end #/restful
end #/routes

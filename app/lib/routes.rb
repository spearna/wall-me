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
      view.partial(:form).scope(:profile).bind({})
      view.partial(:list).scope(:profile).mutate(:list, with: data(:profile).all).subscribe
    end

    create do
      #Getting email prop being submitted in form in profile view
      email_str = params[:profile][:email]

      #Building components of the API URL to Full Contact
      base_url = "https://api.fullcontact.com/v2/person.json?email="
      conj_url = "&apiKey="
      apiKey = ENV['FULL_CONTACT_API_KEY']
      # You can get a trial Full Contact API key from:
      # https://www.fullcontact.com/developer/try-fullcontact/

      url = [base_url, email_str, conj_url, apiKey].join

      #Calling API to get JSON response for parsing
      response = HTTParty.get(url)
      result = JSON.parse(response.body)

      #If API response successful create record; else output error to view
      if result['status'] == 200 then
        image_url = result['photos'][0]['url']
        name = result['contactInfo']['fullName']
        # p "Inspect params in Route Create:"
        # p params.inspect
        data(:profile).create(params[:profile].merge(:name => name, :imgurl => image_url))
        # p "Profile.all from Route Create:"
        # p Profile.all
        redirect router.group(:profile).path(:list)
        #TODO: after record creation, re-autofocus form to email field
      else
        p "Couldn't find " + params[:profile][:email]
        #TODO: Output error to view
      end

    end #/create
  end #/restful
end #/routes

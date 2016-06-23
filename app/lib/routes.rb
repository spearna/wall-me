Pakyow::App.routes do

  default do
    # render the profile list
    pp "render the profile list"
    view.partial(:'list').scope(:profile).mutate(:list,
      with: data(:profile).for_all_profiles
      ).subscribe

    # setup the form for a new object
    pp "setting up form for a new object"
    view.partial(:'manual_checkin').scope(:profile).bind({})
  end

  # setup restful resources for namespace 'profile', while keeping route on default url
  restful :profile, '/' do

    action :create do
      # create the profile
      pp "create the profile"
      data(:profile).create(params[:profile])
      
      pp "verify/print Profile records:"
      pp Profile.all

      # go back
      "redirecting back to default"
      redirect :default
    end

  end


  get '/export' do
    # Feature to locally export and save a roster.
    # Grab all Profile entries, build CSV, export to local machine via browser
    profiles = Profile.all
    csv_string = CSV.generate do |csv|
     csv << ["Id", "Name", "Email", "Objective"]
     profiles.each do |profile|
       csv << [profile.id, profile.name, profile.email, profile.objective]
     end
   end

   send csv_string, 'text/csv', 'profiles.csv'

 end

end #/routes

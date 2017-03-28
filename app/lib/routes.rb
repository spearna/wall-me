Pakyow::App.routes do

  default do
    # render the profile list
    pp "render the profile list"
    view.partial(:list).scope(:profile).mutate(:list,
      with: data(:profile).for_all_profiles
      ).subscribe

    # setup the form for a new object
    pp "setting up form for a new object"
    view.partial(:manual_checkin).scope(:profile).bind({objective: :look})
  end

  # setup restful resources for namespace 'profile', while keeping route on default url
  restful :profile do

    action :create do
      # create the profile
      # params[:profile][:imgurl] = "/images/" + random_image
      pp "create the profile"
      pp params[:profile]


      if params.has_key?('tempimage')
        unless params['tempimage'].nil? || params['tempimage'].length == 0
          image_basename = params['tempimage']
          image_filename = "/tmp/#{params['tempimage']}"

          if File.exists? image_filename
            # Get the image size.
            image = MiniMagick::Image.open(image_filename)

            # Upload to S3.
            s3 = Aws::S3::Resource.new(region: 'us-east-1')
            s3.bucket('wallme-images-prototype').object(image_basename).upload_file(image_filename, acl:'public-read')
            # Remove the image from /tmp after uploading it.
            FileUtils.rm(image_filename)
            params[:profile][:imgurl] = 'https://s3.amazonaws.com/wallme-images-prototype/' + image_basename
          else
            pp "File does not exist"
          end
        else
          puts "TEMPIMAGE NIL"
          pp params
        end
      end


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
     csv << ["Id", "First Name", "Last Name", "Email", "Objective"]
     profiles.each do |profile|
       csv << [profile.id, profile.firstName, profile.lastName, profile.email, profile.objective]
     end
   end

   send csv_string, 'text/csv', 'profiles.csv'

 end


 patch 'upload' do
  pp "hit patch"
  if request.xhr?
    filename = params['files'].first[:filename]
    uploaded_file = params['files'].first[:tempfile].path
    temp_image_file = "/tmp/#{SecureRandom.uuid}#{File.extname(uploaded_file)}"
    pp "filename"
    pp filename

      # Copy the uploaded file to /tmp.
      FileUtils.cp(uploaded_file, temp_image_file)
      pp "uploaded_file"
      pp uploaded_file
      pp "temp_image_file"
      pp temp_image_file

      # Resize the image.
      image = MiniMagick::Image.new(temp_image_file)
      image = resize_and_crop(image,160)
      pp "image var"
      pp image

      # Generate the JSON response.
      response_data = {}
      response_data['files'] = []
      response_data['files'] << {name: filename, temp: File.basename(temp_image_file), size: 256}
      pp "response_data"
      pp response_data

      send response_data.to_json, 'application/json'
    else
      puts "fail"
    end
  end


end #/routes

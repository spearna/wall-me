Pakyow::App.routes do
  default do

    redirect router.group(:profile).path(:list)
  end

# For the Wall Me app

# From a route, we can use the mutable to query for data:
#  # get all the users
#  data(:user).all
#
#  # get a specific user
#  data(:user).find(1)

  restful :profile, '/profiles' do
    list do
      view.partial(:form).scope(:profile).bind({})
      view.partial(:list).scope(:profile).mutate(:list, with: data(:profile).all).subscribe
    end

    post '/' do
      p 'post route'
      # base_url = "https://api.fullcontact.com/v2/person.json?email="
      # # TODO: how to get access to :email prop in form to build url?
      # puts "email str:"
      # puts params[:email]
      # email_str = params[:email]
      # # email_str = "spearna@gmail.com"
      # conj_url = "&apiKey="
      # apiKey = "99b62982ad4384d4"
      # url = [base_url, email_str, conj_url, apiKey].join
      # # hashed_email = Digest::MD5.hexdigest(email)
      # # view.partial(:form).scope(:profile).bind()
    	# response = HTTParty.get(url)
      # result = JSON.parse(response.body)
      # puts result
      # # puts "first photo url:"
      # puts result['photos'][0]['url']
    	# image_url = result['photos'][0]['url']
      # # view.scope(:profile).apply({:image => image_url})
    end

    create do
      # puts "params email:"
      # puts params[:email]
      data(:profile).create(params[:profile])
      redirect router.group(:profile).path(:list)
    end
  end

end

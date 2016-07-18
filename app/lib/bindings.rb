Pakyow::App.bindings do

  scope :profile do
    restful :profile

    options :objective do
      ["Look around",
       "Lead event",
       "Attend event",
       "Join a team",
       "Find a teammate",
       "Discuss an idea",
       "Get S* Done"
      ].map { |x| [x.to_sym, x] }
    end # options :objective do

    # binding(:imgurl) do
    #   # Default the image to superman
    #   url = '/images/superman_profile.jpg'
    #   # Title for mouseover
    #   title = 'Profile photo'
    #   unless bindable.imgurl.nil?
    #     url = bindable.imgurl
    #   end
    #   unless bindable.firstName.nil? || bindable.lastName.nil?
    #     title = "#{title} of #{bindable.firstName} #{bindable.lastName}"
    #   end
    #   {
    #     # TODO: Uncomment when upgrade ring.js
    #     # :class => ["media-object dp img-circle"],
    #     :src => url,
    #     :title => title
    #   }
    # end # binding(:imgurl) do

  end # scope :profile do

end # Pakyow::App.bindings do

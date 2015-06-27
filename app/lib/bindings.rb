Pakyow::App.bindings do

  scope :profile do
    restful :profile

    # Binding the person's image to the list view (img was found in profile
    #  route based on email address in form)
    binding(:imgurl) do
      tag = "<img src=" + bindable.imgurl + " width=90 height=90>"
		end

  end
end

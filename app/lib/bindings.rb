Pakyow::App.bindings do

  scope :profile do
    restful :profile

  #   # Binding the person's image to the list view (img was found in profile
  #   #  route based on email address in form)
  #   binding(:imgurl) do
  #     { src: bindable.imgurl }
		# end

  end
end

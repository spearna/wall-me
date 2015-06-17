Pakyow::App.routes do
  default do
    # redirect router.group(:message).path(:list)
    redirect router.group(:profile).path(:list)
  end

  restful :message, '/messages' do
    list do
      view.partial(:form).scope(:message).bind({})
      view.partial(:list).scope(:message).mutate(:list, with: data(:message).all).subscribe
    end

    create do
      data(:message).create(params[:message])
      redirect router.group(:message).path(:list)
    end
  end


  restful :profile, '/profiles' do
    list do
      view.partial(:form).scope(:profile).bind({})
      view.partial(:list).scope(:profile).mutate(:list, with: data(:profile).all).subscribe
    end

    create do
      data(:profile).create(params[:profile])
      redirect router.group(:profile).path(:list)
    end
  end

end

Pakyow::App.routes do
  default do
    redirect router.group(:message).path(:list)
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
end

Pakyow::App.bindings do

  scope :profile do
    restful :profile

    options :objective do
      [[:"Look around", "Look around"],
       [:"Join a team", "Join a team"]]
    end
  end

end

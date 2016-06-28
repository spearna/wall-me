Pakyow::App.bindings do

  scope :profile do
    restful :profile

    options :objective do
      ["Look around",
       "Join a team"
      ].map { |x| [x.to_sym, x] }
    end
  end

end

Pakyow::App.mutable :profile do
  model Profile

  query :all do
    Profile.order(Sequel.desc(:id)).all
  end

  action :create do |params|
    Profile.create(params)
  end
end

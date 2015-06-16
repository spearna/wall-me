Pakyow::App.mutable :message do
  model Message

  query :all do
    Message.order(Sequel.desc(:id)).all
  end

  action :create do |params|
    Message.create(params)
  end
end

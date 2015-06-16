Pakyow::App.mutators :message do
  mutator :list do |view, data|
    view.apply(data)
  end
end

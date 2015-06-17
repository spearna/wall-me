Pakyow::App.mutators :profile do
  mutator :list do |view, data|
    view.apply(data)
  end
end

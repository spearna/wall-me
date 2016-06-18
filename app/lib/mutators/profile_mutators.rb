# A mutator describes how to render a particular view with some particular data.
#
# Here's a mutator for rendering a list of users:
#
#  Pakyow::Mutators :user do
#    mutator :list do |view, users|
#      view.apply(users)
#    end
#  end
# From a route, you could invoke the mutator on a view like this:
#
#  view.scope(:user).mutate(:list, with: data(:user).all)
#
# Notice that we're mutating with the data from our mutable user. Pakyow will
# fetch the data using the all query and pass it to the list mutation where
# the view is rendered.

Pakyow::App.mutators :profile do
  mutator :list do |view, data|
    view.apply(data)
  end

end

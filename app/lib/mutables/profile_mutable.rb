# A mutable wraps a data model and defines two things:
#
#  1.) Actions that can occur on the model that cause state mutations.
#  2.) Queries that define how particular data is to be fetched.
#
# We can also change data through the mutable:
#
#  data(:user).create(params[:user])
#  Mutables are the first step in making the route declarative (what) rather
#  than imperative (how). All of the how is wrapped up in the mutable itself,
#  letting us express only what should happen from the route.
#
#  This is important.

Pakyow::App.mutable :profile do
  model Profile

  # query :for_all_profiles do
  #   redis.lrange(:profiles, 0, -1).each_with_index.map { |profile, id|
  #     {
  #       id: id + 1,
  #       profile: profile
  #     }
  #   }
  # end

  # action :create do |params|
  #   redis.lpush(:profiles, params[:profile])
  # end

  query :for_all_profiles do
    Profile.order(Sequel.desc(:id)).all
  end

  action :create do |params|
    Profile.create(params)
  end

end

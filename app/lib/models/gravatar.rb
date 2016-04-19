require 'digest'

class Gravatar

  attr_reader :avatar_url, :display_name

  def initialize(email_hash, profile)
    @email_hash = email_hash
    @profile = profile['entry'][0]
  end

  def avatar_url
    "http://www.gravatar.com/avatar/#{@email_hash}"
  end

  def display_name
    @profile['displayName']
  end


  class << self

    def fetch(email_address)
      email_hash = hash email_address
      response = HTTParty.get profile_url(email_hash)

      if response.code == 200 then
        result = JSON.parse(response.body)
        Gravatar.new(email_hash, result)
      end
    end

    def profile_url(email_hash)
      "http://www.gravatar.com/#{email_hash}.json"
    end

    def hash(s)
      md5 = Digest::MD5.new
      md5.update s
      md5.hexdigest
    end

  end

  private_class_method :hash

end

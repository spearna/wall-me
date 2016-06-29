module Pakyow::Helpers
#   def redis
#     Pakyow::Realtime.redis
#   end

	def random_image
		image_files = %w( .jpg .gif .png )
		files = Dir.entries(
			"./public/images" 
			).delete_if { |x| !image_files.index(x[-4,4]) }
		files[rand(files.length)]
	end

end

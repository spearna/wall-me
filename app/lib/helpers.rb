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

	def resize_and_crop(image, size)
    if image.width < image.height
      remove = ((image.height - image.width)/2).round
      image.shave("0x#{remove}")
    elsif image.width > image.height
      remove = ((image.width - image.height)/2).round
      image.shave("#{remove}x0")
    end
    image.resize("#{size}x#{size}")
    return image
  end

end

require 'flickraw'
require 'yaml'
require 'json'

class ZenjaFlickr
  @@flickr_yaml = YAML.load(File.open("./config/flickr.yaml"))
  @@zenja_id = @@flickr_yaml['app']['zenja_id']

  def ZenjaFlickr.init
    FlickRaw.api_key = @@flickr_yaml['app']['api_key']
    FlickRaw.shared_secret = @@flickr_yaml['app']['shared_secret']
  end

  def photosets
    response_list = flickr.photosets.getList :user_id => @@zenja_id

    # return type: Array
    response_list.map { |r| r.to_hash }
  end

  def photos_in_set(set_id)
    response = flickr.photosets.getPhotos :photoset_id => set_id, 
                                          :privacy_filter => 1, 
                                          :media => 'photos', 
                                          :extras => 'date_taken,url_sq'
    # return type: Array of hashes
    response['photo'].map { |r| r.to_hash }
  end

  def photo(photo_id)
    # response's class: Flickr::Response
    response = flickr.photos.getInfo :photo_id => photo_id
    response_hash = response.to_hash

    # add url_z
    response_hash['url_z'] = url_z(response)

    # return a hash
    response_hash
  end

  def url_s(info)
    FlickRaw.url_s info
  end

  def url(info)
    FlickRaw.url info
  end

  def url_c(info)
    FlickRaw.url_c info
  end

  def url_z(info)
    FlickRaw.url_z info
  end

  def test
    info = flickr.photos.getInfo :photo_id => '7559507782'
    list = flickr.photosets.getList :user_id => @@zenja_id

    puts list.class
    p list
    puts info.title
    puts info.dates.taken
    puts FlickRaw.url_photosets(info)
    #puts list
  end
end

ZenjaFlickr.init

=begin
zf = ZenjaFlickr.new
#zf.test
list = zf.photos_in_set(zf.photosets[0].id)
puts list.class
p list
puts zf.url_s(list['photo'][0])
puts zf.url_c(list['photo'][0])
puts zf.url(list['photo'][0])
p flickr.urls.lookupUser :url => 'http://www.flickr.com/photos/gazkinz/sets/'
=end

=begin
zf = ZenjaFlickr.new
photo = zf.photo('4412059703')
p photo.class
puts
puts photo
puts
puts photo['farm']
puts photo.to_json
=end


require 'sinatra'
require 'json'
require './zenja_flickr.rb'

before do
  @zf = ZenjaFlickr.new
end

get '/' do
  erb :index
end

get '/service/photosets' do
  content_type :json
  @zf.photosets.to_json
end

get '/service/photos_in_set' do
  content_type :json
  set_id = params["set_id"];
  @zf.photos_in_set(set_id).to_json
end

get '/service/photo' do
  content_type :json
  photo_id = params["photo_id"]
  @zf.photo(photo_id).to_hash.to_json
end


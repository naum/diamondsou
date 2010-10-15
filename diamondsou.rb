require 'sinatra'
require 'dm-core'

DataMapper.setup(:default, 'appengine://auto')

helpers do
  include Rack::Utils
  alias_method :h, :escape_html
end

get '/' do
  erb :index
end

get '/scrutiny' do
  erb :scrutiny
end

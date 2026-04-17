require_relative "snapsharp/version"
require_relative "snapsharp/errors"
require_relative "snapsharp/client"

module SnapSharp
  # Convenience constructor — same as SnapSharp::Client.new
  def self.new(api_key, **opts)
    Client.new(api_key, **opts)
  end
end

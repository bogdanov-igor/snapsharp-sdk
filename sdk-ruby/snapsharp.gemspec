require_relative "lib/snapsharp/version"

Gem::Specification.new do |spec|
  spec.name        = "snapsharp"
  spec.version     = SnapSharp::VERSION
  spec.summary     = "Official Ruby SDK for SnapSharp Screenshot & OG Image API"
  spec.description = "Capture screenshots, generate OG images, and render HTML to images with the SnapSharp API."
  spec.authors     = ["SnapSharp"]
  spec.homepage    = "https://snapsharp.dev"
  spec.license     = "MIT"

  spec.metadata["homepage_uri"]    = spec.homepage
  spec.metadata["documentation_uri"] = "https://snapsharp.dev/docs"
  spec.metadata["source_code_uri"] = "https://github.com/bogdanov-igor/snapsharp-sdk"

  spec.files         = Dir["lib/**/*", "README.md", "LICENSE"]
  spec.require_paths = ["lib"]

  spec.required_ruby_version = ">= 2.7"
end

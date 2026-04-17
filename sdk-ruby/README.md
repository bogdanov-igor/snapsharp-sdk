# snapsharp

Official Ruby SDK for [SnapSharp](https://snapsharp.dev) — Screenshot & OG Image API.

## Install

```bash
gem install snapsharp
```

Or add to your `Gemfile`:

```ruby
gem "snapsharp"
```

## Quick Start

```ruby
require "snapsharp"

snap = SnapSharp.new(ENV["SNAPSHARP_API_KEY"])

# Screenshot
image = snap.screenshot("https://example.com",
  width: 1920, height: 1080, format: "webp", full_page: true
)
File.binwrite("screenshot.webp", image)

# OG Image
og = snap.og_image("blog-post", { title: "My Article", author: "Jane Doe" })
File.binwrite("og.png", og)

# HTML to Image
card = snap.html_to_image(
  '<div style="padding:40px;background:#1a1a2e;color:white">Hello</div>',
  width: 1200, height: 630
)
File.binwrite("card.png", card)
```

## Error Handling

```ruby
require "snapsharp"

snap = SnapSharp.new(ENV["SNAPSHARP_API_KEY"])

begin
  image = snap.screenshot("https://example.com")
rescue SnapSharp::AuthError
  puts "Invalid API key"
rescue SnapSharp::RateLimitError => e
  puts "Rate limited. Retry after #{e.retry_after}s"
rescue SnapSharp::TimeoutError
  puts "Screenshot timed out"
rescue SnapSharp::APIError => e
  puts "API error #{e.status}: #{e.message}"
end
```

## API Reference

See full documentation at [snapsharp.dev/docs](https://snapsharp.dev/docs).

## License

MIT

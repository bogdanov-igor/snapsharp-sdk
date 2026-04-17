# snapsharp-go

Official Go SDK for [SnapSharp](https://snapsharp.dev) — Screenshot & OG Image API.

## Install

```bash
go get github.com/bogdanov-igor/snapsharp-sdk/sdk-go
```

## Quick Start

```go
package main

import (
    "os"
    snapsharp "github.com/bogdanov-igor/snapsharp-sdk/sdk-go"
)

func main() {
    client := snapsharp.New(os.Getenv("SNAPSHARP_API_KEY"))

    // Screenshot
    data, err := client.Screenshot("https://example.com", &snapsharp.ScreenshotParams{
        Width:    1920,
        Height:   1080,
        Format:   "webp",
        FullPage: true,
        DarkMode: true,
        BlockAds: true,
    })
    if err != nil {
        panic(err)
    }
    os.WriteFile("screenshot.webp", data, 0644)

    // OG Image
    og, err := client.OgImage("blog-post", map[string]string{
        "title":  "My Article",
        "author": "Jane Doe",
    }, nil)
    os.WriteFile("og.png", og, 0644)

    // HTML to Image
    card, err := client.HtmlToImage(
        `<div style="padding:40px;background:#1a1a2e;color:white;font-size:48px">Hello</div>`,
        &snapsharp.ImageOptions{Width: 1200, Height: 630},
    )
    os.WriteFile("card.png", card, 0644)
}
```

## Error Handling

```go
import (
    snapsharp "github.com/bogdanov-igor/snapsharp-sdk/sdk-go"
    "errors"
)

data, err := client.Screenshot("https://example.com", nil)
if err != nil {
    var authErr *snapsharp.AuthError
    var rateLimitErr *snapsharp.RateLimitError
    var timeoutErr *snapsharp.TimeoutError

    switch {
    case errors.As(err, &authErr):
        // Invalid API key
    case errors.As(err, &rateLimitErr):
        fmt.Printf("Retry after %d seconds\n", rateLimitErr.RetryAfter)
    case errors.As(err, &timeoutErr):
        // Screenshot timed out
    default:
        panic(err)
    }
}
```

## API Reference

See full documentation at [snapsharp.dev/docs](https://snapsharp.dev/docs).

## License

MIT

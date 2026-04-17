# snapsharp

Official Python SDK for [SnapSharp](https://snapsharp.dev) — Screenshot & OG Image API.

## Install

```bash
pip install snapsharp
```

## Quick Start

```python
from snapsharp import SnapSharp
import os

snap = SnapSharp(os.environ["SNAPSHARP_API_KEY"])

# Screenshot
image = snap.screenshot("https://example.com", width=1920, format="webp", full_page=True)
with open("screenshot.webp", "wb") as f:
    f.write(image)

# OG Image from template
og = snap.og_image("blog-post", {"title": "My Article", "author": "Jane Doe"})
with open("og.png", "wb") as f:
    f.write(og)

# HTML to Image
card = snap.html_to_image(
    '<div style="padding:40px;background:#1a1a2e;color:white;font-size:48px">Hello</div>',
    width=1200, height=630
)
with open("card.png", "wb") as f:
    f.write(card)
```

## Context Manager

```python
with SnapSharp("sk_live_...") as snap:
    image = snap.screenshot("https://example.com")
```

## Error Handling

```python
from snapsharp import SnapSharp, AuthError, RateLimitError, TimeoutError

snap = SnapSharp("sk_live_...")

try:
    image = snap.screenshot("https://example.com")
except AuthError:
    print("Invalid API key")
except RateLimitError as e:
    print(f"Rate limited. Retry after {e.retry_after}s")
except TimeoutError:
    print("Screenshot timed out")
```

## API Reference

See full documentation at [snapsharp.dev/docs](https://snapsharp.dev/docs).

## License

MIT

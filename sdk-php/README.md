# snapsharp/sdk

Official PHP SDK for [SnapSharp](https://snapsharp.dev) — Screenshot & OG Image API.

## Install

```bash
composer require snapsharp/sdk
```

## Quick Start

```php
<?php
require 'vendor/autoload.php';

use SnapSharp\SnapSharp;

$snap = new SnapSharp($_ENV['SNAPSHARP_API_KEY']);

// Screenshot
$image = $snap->screenshot('https://example.com', [
    'width'     => 1920,
    'height'    => 1080,
    'format'    => 'webp',
    'full_page' => true,
    'dark_mode' => true,
]);
file_put_contents('screenshot.webp', $image);

// OG Image
$og = $snap->ogImage('blog-post', [
    'title'  => 'My Article',
    'author' => 'Jane Doe',
]);
file_put_contents('og.png', $og);

// HTML to Image
$card = $snap->htmlToImage(
    '<div style="padding:40px;background:#1a1a2e;color:white;font-size:48px">Hello</div>',
    ['width' => 1200, 'height' => 630]
);
file_put_contents('card.png', $card);
```

## Error Handling

```php
use SnapSharp\Errors\{AuthException, RateLimitException, TimeoutException};

try {
    $image = $snap->screenshot('https://example.com');
} catch (AuthException $e) {
    echo "Invalid API key\n";
} catch (RateLimitException $e) {
    echo "Rate limited. Retry after {$e->getRetryAfter()}s\n";
} catch (TimeoutException $e) {
    echo "Screenshot timed out\n";
}
```

## API Reference

See full documentation at [snapsharp.dev/docs](https://snapsharp.dev/docs).

## License

MIT

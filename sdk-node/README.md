# @snapsharp/sdk

Official Node.js SDK for [SnapSharp](https://snapsharp.dev) — Screenshot & OG Image API.

## Install

```bash
npm install @snapsharp/sdk
# or
yarn add @snapsharp/sdk
# or
pnpm add @snapsharp/sdk
```

## Quick Start

```typescript
import { SnapSharp } from '@snapsharp/sdk';
import fs from 'fs';

const snap = new SnapSharp('sk_live_your_api_key');

// Screenshot
const screenshot = await snap.screenshot('https://example.com', {
  width: 1920,
  height: 1080,
  format: 'webp',
  fullPage: true,
  darkMode: true,
  blockAds: true,
});
fs.writeFileSync('screenshot.webp', screenshot);

// OG Image from template
const ogImage = await snap.ogImage('blog-post', {
  title: 'My Article',
  author: 'John Doe',
  date: '2026-03-25',
});
fs.writeFileSync('og.png', ogImage);

// HTML to Image
const card = await snap.htmlToImage(
  '<div style="padding:40px;background:#1a1a2e;color:white;font-size:48px">Hello</div>',
  { width: 1200, height: 630 }
);
fs.writeFileSync('card.png', card);
```

## Error Handling

```typescript
import { SnapSharp, AuthError, RateLimitError, TimeoutError } from '@snapsharp/sdk';

const snap = new SnapSharp(process.env.SNAPSHARP_API_KEY!);

try {
  const buffer = await snap.screenshot('https://example.com');
  fs.writeFileSync('out.png', buffer);
} catch (err) {
  if (err instanceof AuthError) {
    console.error('Invalid API key');
  } else if (err instanceof RateLimitError) {
    console.error(`Rate limited. Retry after ${err.retryAfter}s`);
  } else if (err instanceof TimeoutError) {
    console.error('Screenshot timed out');
  } else {
    throw err;
  }
}
```

## API Reference

See full documentation at [snapsharp.dev/docs](https://snapsharp.dev/docs).

## License

MIT

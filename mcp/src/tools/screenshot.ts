import type { SnapSharpClient } from '../client.js';

export const screenshotTool = {
  name: 'snapsharp_screenshot',
  description: 'Capture a screenshot of any website. Returns the image as base64. Use when you need to visually inspect a webpage, check its design, or capture it for reporting.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      url: { type: 'string', description: 'URL to screenshot (must include https://)' },
      width: { type: 'number', description: 'Viewport width in pixels', default: 1280 },
      height: { type: 'number', description: 'Viewport height in pixels', default: 720 },
      format: { type: 'string', enum: ['png', 'jpeg', 'webp'], default: 'png' },
      quality: { type: 'number', description: 'Image quality 1-100 (jpeg/webp only)', default: 80 },
      full_page: { type: 'boolean', description: 'Capture full page height', default: false },
      dark_mode: { type: 'boolean', description: 'Enable dark mode', default: false },
      block_ads: { type: 'boolean', description: 'Block ads and trackers', default: false },
      block_cookie_banners: { type: 'boolean', description: 'Block cookie consent banners', default: false },
      stealth: { type: 'boolean', description: 'Bypass bot detection (Growth+ plan)', default: false },
      device: { type: 'string', description: 'Device preset, e.g. "iPhone 14", "iPad Pro"' },
      delay: { type: 'number', description: 'Wait N milliseconds before screenshot (0-10000)', default: 0 },
      wait_for: { type: 'string', description: 'CSS selector to wait for before capturing' },
      retina: { type: 'boolean', description: 'Capture at 2x resolution (retina)', default: false },
    },
    required: ['url'],
  },
  async handler(client: SnapSharpClient, args: Record<string, unknown>) {
    const { buffer, contentType } = await client.screenshot(args);
    return {
      content: [
        {
          type: 'image',
          data: buffer.toString('base64'),
          mimeType: contentType,
        },
        {
          type: 'text',
          text: `Screenshot of ${args.url} captured successfully (${buffer.length} bytes, ${contentType})`,
        },
      ],
    };
  },
};

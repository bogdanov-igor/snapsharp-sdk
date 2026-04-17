import type { SnapSharpClient } from '../client.js';

export const scrollTool = {
  name: 'snapsharp_scroll',
  description: 'Capture a scrolling screenshot of a webpage as GIF or MP4. The page auto-scrolls from top to bottom. Use for product demos, bug reports, or full-page design reviews. Returns base64-encoded binary.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      url: { type: 'string', description: 'URL to record (must include https://)' },
      format: { type: 'string', enum: ['gif', 'mp4', 'webm'], description: 'Output format', default: 'gif' },
      width: { type: 'number', description: 'Viewport width in pixels', default: 1280 },
      height: { type: 'number', description: 'Viewport height in pixels', default: 720 },
      duration: { type: 'number', description: 'Recording duration in seconds (1-60)', default: 5 },
      scroll_speed: { type: 'number', description: 'Scroll speed multiplier 1 (slow) to 10 (fast)', default: 3 },
      dark_mode: { type: 'boolean', description: 'Enable dark mode emulation', default: false },
      block_ads: { type: 'boolean', description: 'Block ads and cookie banners', default: false },
    },
    required: ['url'],
  },
  async handler(client: SnapSharpClient, args: Record<string, unknown>) {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(args)) {
      if (value !== undefined && value !== null) qs.set(key, String(value));
    }
    const result = await client.post('/v1/scroll?' + qs.toString(), {}, true) as { buffer: Buffer; contentType: string };
    const format = (args.format as string) || 'gif';
    return {
      content: [
        {
          type: 'text',
          text: `Scrolling screenshot of ${args.url} captured as ${format.toUpperCase()} (${result.buffer.length} bytes). Note: GIF/MP4 binary cannot be displayed inline — use snapsharp_screenshot for static previews.`,
        },
        {
          type: 'text',
          text: `Base64 ${format}: ${result.buffer.toString('base64').slice(0, 100)}...`,
        },
      ],
    };
  },
};

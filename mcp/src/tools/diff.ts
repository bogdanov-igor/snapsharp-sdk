import type { SnapSharpClient } from '../client.js';

export const diffTool = {
  name: 'snapsharp_diff',
  description: 'Compare two webpages pixel-by-pixel. Returns a diff percentage and an overlay image showing changed areas highlighted in red. Use for visual regression testing, comparing before/after deploys, or detecting layout changes.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      url1: { type: 'string', description: 'First URL to compare (must include https://)' },
      url2: { type: 'string', description: 'Second URL to compare (must include https://)' },
      width: { type: 'number', description: 'Viewport width in pixels', default: 1280 },
      height: { type: 'number', description: 'Viewport height in pixels', default: 720 },
      full_page: { type: 'boolean', description: 'Compare full page height', default: false },
      dark_mode: { type: 'boolean', description: 'Enable dark mode for both pages', default: false },
      threshold: { type: 'number', description: 'Pixel difference threshold 0-1 (default 0.1)', default: 0.1 },
    },
    required: ['url1', 'url2'],
  },
  async handler(client: SnapSharpClient, args: Record<string, unknown>) {
    const result = await client.post('/v1/diff', args, false) as {
      diff_percent: number;
      changed_pixels: number;
      total_pixels: number;
      diff_image_base64?: string;
    };

    const contents: Array<{ type: string; data?: string; mimeType?: string; text?: string }> = [
      {
        type: 'text',
        text: `Diff result: ${result.diff_percent.toFixed(2)}% changed (${result.changed_pixels?.toLocaleString() ?? '?'} of ${result.total_pixels?.toLocaleString() ?? '?'} pixels)`,
      },
    ];

    if (result.diff_image_base64) {
      contents.push({
        type: 'image',
        data: result.diff_image_base64,
        mimeType: 'image/png',
      });
    }

    return { content: contents };
  },
};

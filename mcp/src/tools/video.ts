import type { SnapSharpClient } from '../client.js';

export const videoTool = {
  name: 'snapsharp_video',
  description: 'Record a webpage as a video (MP4, WebM, or GIF). Use when you need to capture animations, interactions, or create demo recordings of websites.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      url: { type: 'string', description: 'URL to record (must include https://)' },
      format: { type: 'string', enum: ['mp4', 'webm', 'gif'], description: 'Video format', default: 'mp4' },
      duration: { type: 'number', description: 'Recording duration in seconds (1-60)', default: 5 },
      width: { type: 'number', description: 'Viewport width in pixels', default: 1280 },
      height: { type: 'number', description: 'Viewport height in pixels', default: 720 },
      fps: { type: 'number', description: 'Frames per second (10-30)', default: 24 },
      scroll: { type: 'boolean', description: 'Auto-scroll the page during recording', default: false },
      scroll_speed: { type: 'number', description: 'Scroll speed multiplier (1-10)', default: 3 },
      dark_mode: { type: 'boolean', description: 'Enable dark mode', default: false },
      block_ads: { type: 'boolean', description: 'Block ads', default: false },
      stealth: { type: 'boolean', description: 'Bypass bot detection', default: false },
      device: { type: 'string', description: 'Device preset, e.g. "iPhone 14"' },
      delay: { type: 'number', description: 'Wait N milliseconds before recording starts', default: 0 },
    },
    required: ['url'],
  },
  async handler(client: SnapSharpClient, args: Record<string, unknown>) {
    const result = await client.post('/v1/video', args, true) as { buffer: Buffer; contentType: string };
    const format = (args.format as string) || 'mp4';
    const ext = format === 'gif' ? 'GIF' : format.toUpperCase();
    return {
      content: [
        {
          type: 'text',
          text: `Video recording of ${args.url} completed (${result.buffer.length} bytes, ${ext} format, ${args.duration || 5}s). The video data is available as base64:\n\ndata:${result.contentType};base64,${result.buffer.toString('base64').slice(0, 100)}... [${result.buffer.length} bytes total]`,
        },
      ],
    };
  },
};

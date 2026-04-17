import type { SnapSharpClient } from '../client.js';

export const batchTool = {
  name: 'snapsharp_batch_screenshot',
  description: 'Start an async batch screenshot job for multiple URLs. Returns a job ID to poll for status. Use when you need to screenshot many pages at once (up to 500 URLs).',
  inputSchema: {
    type: 'object' as const,
    properties: {
      urls: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of URLs to screenshot (1-500)',
        minItems: 1,
        maxItems: 500,
      },
      width: { type: 'number', description: 'Viewport width in pixels', default: 1280 },
      height: { type: 'number', description: 'Viewport height in pixels', default: 720 },
      format: { type: 'string', enum: ['png', 'jpeg', 'webp'], default: 'png' },
      quality: { type: 'number', description: 'Image quality 1-100', default: 80 },
      full_page: { type: 'boolean', description: 'Capture full page', default: false },
      dark_mode: { type: 'boolean', description: 'Enable dark mode', default: false },
      block_ads: { type: 'boolean', description: 'Block ads', default: false },
      stealth: { type: 'boolean', description: 'Bypass bot detection', default: false },
      device: { type: 'string', description: 'Device preset, e.g. "iPhone 14"' },
      delay: { type: 'number', description: 'Wait N milliseconds per page', default: 0 },
      callback_url: { type: 'string', description: 'Webhook URL to notify when job completes' },
    },
    required: ['urls'],
  },
  async handler(client: SnapSharpClient, args: Record<string, unknown>) {
    const { urls, ...params } = args;
    const result = await client.post('/v1/batch', { urls, ...params }, false) as {
      job_id: string;
      status: string;
      total_urls: number;
      poll_url: string;
      download_url: string;
      expires_at: string;
    };
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            message: 'Batch job started',
            job_id: result.job_id,
            status: result.status,
            total_urls: result.total_urls,
            poll_url: result.poll_url,
            download_url: result.download_url,
            expires_at: result.expires_at,
            instructions: 'Poll poll_url to check progress. Download ZIP from download_url when status is "completed".',
          }, null, 2),
        },
      ],
    };
  },
};

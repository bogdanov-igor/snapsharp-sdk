import type { SnapSharpClient } from '../client.js';

export const extractTool = {
  name: 'snapsharp_extract',
  description: 'Extract metadata from any webpage using a real browser: title, description, Open Graph tags, Twitter Card tags, canonical URL, favicons, and more. Use when you need accurate metadata from a live URL without parsing raw HTML.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      url: { type: 'string', description: 'URL to extract metadata from (must include https://)' },
      wait_until: {
        type: 'string',
        enum: ['load', 'domcontentloaded', 'networkidle'],
        description: 'When to consider the page loaded',
        default: 'load',
      },
      stealth: { type: 'boolean', description: 'Bypass bot detection before extracting (Growth+ plan)', default: false },
    },
    required: ['url'],
  },
  async handler(client: SnapSharpClient, args: Record<string, unknown>) {
    const result = await client.post('/v1/extract', args, false) as Record<string, unknown>;
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  },
};

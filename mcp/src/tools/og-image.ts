import type { SnapSharpClient } from '../client.js';

export const ogImageTool = {
  name: 'snapsharp_og_image',
  description: 'Generate an Open Graph (OG) image from a template. Use when you need to create social media preview images, blog post covers, or link preview cards.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      template: {
        type: 'string',
        description: 'Template name, e.g. "blog-post", "social-card", "product-card", "github-readme", "quote-card"',
      },
      data: {
        type: 'object',
        description: 'Template variables as key-value pairs (e.g. {"title": "My Post", "author": "Jane"})',
        additionalProperties: { type: 'string' },
      },
      width: { type: 'number', description: 'Image width in pixels', default: 1200 },
      height: { type: 'number', description: 'Image height in pixels', default: 630 },
      format: { type: 'string', enum: ['png', 'jpeg', 'webp'], default: 'png' },
    },
    required: ['template'],
  },
  async handler(client: SnapSharpClient, args: Record<string, unknown>) {
    const result = await client.post('/v1/og-image', args, true) as { buffer: Buffer; contentType: string };
    return {
      content: [
        {
          type: 'image',
          data: result.buffer.toString('base64'),
          mimeType: result.contentType,
        },
        {
          type: 'text',
          text: `OG image generated using template "${args.template}" (${result.buffer.length} bytes)`,
        },
      ],
    };
  },
};

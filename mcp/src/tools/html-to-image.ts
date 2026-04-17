import type { SnapSharpClient } from '../client.js';

export const htmlToImageTool = {
  name: 'snapsharp_html_to_image',
  description: 'Render HTML/CSS markup to an image. Use when you need to convert HTML templates, cards, or custom-styled content to PNG/JPEG/WebP.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      html: {
        type: 'string',
        description: 'HTML content to render (max 1MB). Inline styles are supported; external resources are fetched.',
      },
      width: { type: 'number', description: 'Viewport width in pixels', default: 800 },
      height: { type: 'number', description: 'Viewport height in pixels', default: 600 },
      format: { type: 'string', enum: ['png', 'jpeg', 'webp'], default: 'png' },
    },
    required: ['html'],
  },
  async handler(client: SnapSharpClient, args: Record<string, unknown>) {
    const result = await client.post('/v1/html-to-image', args, true) as { buffer: Buffer; contentType: string };
    return {
      content: [
        {
          type: 'image',
          data: result.buffer.toString('base64'),
          mimeType: result.contentType,
        },
        {
          type: 'text',
          text: `HTML rendered to image successfully (${result.buffer.length} bytes, ${result.contentType})`,
        },
      ],
    };
  },
};

import type { SnapSharpClient } from '../client.js';

export const pdfTool = {
  name: 'snapsharp_pdf',
  description: 'Generate a PDF from a URL, HTML content, or a built-in template (invoice, report, etc.). Use when you need to create printable documents or convert webpages to PDF.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      url: { type: 'string', description: 'URL to convert to PDF (optional if html or template is provided)' },
      html: { type: 'string', description: 'HTML content to render as PDF (optional if url or template is provided)' },
      template: { type: 'string', description: 'Built-in template name, e.g. "invoice", "report"' },
      data: {
        type: 'object',
        description: 'Template variables as key-value pairs',
        additionalProperties: true,
      },
      format: {
        type: 'string',
        enum: ['A4', 'A3', 'Letter', 'Legal'],
        description: 'Paper format',
        default: 'A4',
      },
      landscape: { type: 'boolean', description: 'Landscape orientation', default: false },
      dark_mode: { type: 'boolean', description: 'Enable dark mode', default: false },
      block_ads: { type: 'boolean', description: 'Block ads', default: false },
      delay: { type: 'number', description: 'Wait N milliseconds before generating', default: 0 },
    },
  },
  async handler(client: SnapSharpClient, args: Record<string, unknown>) {
    const result = await client.post('/v1/pdf', args, true) as { buffer: Buffer; contentType: string };
    return {
      content: [
        {
          type: 'text',
          text: `PDF generated successfully (${result.buffer.length} bytes). Base64 data:\n\ndata:application/pdf;base64,${result.buffer.toString('base64').slice(0, 100)}... [${result.buffer.length} bytes total]`,
        },
      ],
    };
  },
};

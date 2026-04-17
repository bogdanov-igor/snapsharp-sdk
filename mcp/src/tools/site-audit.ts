import type { SnapSharpClient } from '../client.js';

export const siteAuditTool = {
  name: 'snapsharp_site_audit',
  description: 'Extract design tokens from a website: colors, fonts, headings, technology stack, accessibility data. Returns structured JSON. Use when you need to analyze a site\'s design system or tech stack.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      url: { type: 'string', description: 'URL to audit (must include https://)' },
      format: {
        type: 'string',
        enum: ['json', 'png', 'pdf'],
        description: 'Output format: json (data), png (visual report), pdf (printable report)',
        default: 'json',
      },
      sections: {
        type: 'array',
        items: { type: 'string', enum: ['colors', 'fonts', 'headings', 'stack', 'accessibility'] },
        description: 'Which sections to include in the audit',
        default: ['colors', 'fonts', 'headings', 'stack', 'accessibility'],
      },
      include_screenshot: { type: 'boolean', description: 'Include a screenshot in the result', default: true },
      width: { type: 'number', description: 'Viewport width for audit', default: 1280 },
      dark_mode: { type: 'boolean', description: 'Audit in dark mode', default: false },
    },
    required: ['url'],
  },
  async handler(client: SnapSharpClient, args: Record<string, unknown>) {
    const format = (args.format as string) || 'json';

    if (format === 'json') {
      const result = await client.post('/v1/site-audit', args, false) as unknown;
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    const result = await client.post('/v1/site-audit', args, true) as { buffer: Buffer; contentType: string };
    return {
      content: [
        {
          type: 'image',
          data: result.buffer.toString('base64'),
          mimeType: result.contentType,
        },
        {
          type: 'text',
          text: `Site audit report for ${args.url} (${result.buffer.length} bytes, format: ${format})`,
        },
      ],
    };
  },
};

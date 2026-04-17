import type { SnapSharpClient } from '../client.js';

export const analyzeTool = {
  name: 'snapsharp_analyze',
  description: 'Capture a screenshot of a webpage and analyze it with AI vision. Returns UX feedback, accessibility audit, content summary, or custom analysis. Requires a BYOK AI provider configured in the SnapSharp dashboard. Use when you need actionable design or accessibility feedback on a live URL.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      url: { type: 'string', description: 'URL to screenshot and analyze (must include https://)' },
      template_id: { type: 'string', description: 'UUID of an AI prompt template (optional, uses default if omitted)' },
      width: { type: 'number', description: 'Viewport width in pixels', default: 1280 },
      height: { type: 'number', description: 'Viewport height in pixels', default: 720 },
      full_page: { type: 'boolean', description: 'Capture and analyze the full page', default: false },
      dark_mode: { type: 'boolean', description: 'Analyze the dark-mode version', default: false },
      include_screenshot: { type: 'boolean', description: 'Include the screenshot in the response', default: true },
    },
    required: ['url'],
  },
  async handler(client: SnapSharpClient, args: Record<string, unknown>) {
    const result = await client.post('/v1/analyze', args, false) as {
      analysis: string;
      provider: string;
      model: string;
      screenshot_base64?: string;
      meta?: Record<string, unknown>;
    };

    const contents: Array<{ type: string; data?: string; mimeType?: string; text?: string }> = [];

    if (result.screenshot_base64) {
      contents.push({
        type: 'image',
        data: result.screenshot_base64,
        mimeType: 'image/png',
      });
    }

    contents.push({
      type: 'text',
      text: result.analysis,
    });

    if (result.provider || result.model) {
      contents.push({
        type: 'text',
        text: `Analysis by ${result.provider ?? 'AI'} (${result.model ?? 'unknown model'})`,
      });
    }

    return { content: contents };
  },
};

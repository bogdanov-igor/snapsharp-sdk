#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { SnapSharpClient } from './client.js';
import { screenshotTool } from './tools/screenshot.js';
import { ogImageTool } from './tools/og-image.js';
import { htmlToImageTool } from './tools/html-to-image.js';
import { siteAuditTool } from './tools/site-audit.js';
import { videoTool } from './tools/video.js';
import { scrollTool } from './tools/scroll.js';
import { pdfTool } from './tools/pdf.js';
import { batchTool } from './tools/batch.js';
import { diffTool } from './tools/diff.js';
import { extractTool } from './tools/extract.js';
import { analyzeTool } from './tools/analyze.js';

const apiKey = process.env.SNAPSHARP_API_KEY;
if (!apiKey) {
  console.error('Error: SNAPSHARP_API_KEY environment variable is required.');
  console.error('Get your API key at https://snapsharp.dev/dashboard/api-keys');
  process.exit(1);
}

const baseUrl = process.env.SNAPSHARP_BASE_URL || 'https://api.snapsharp.dev';
const client = new SnapSharpClient(apiKey, baseUrl);

const server = new Server(
  { name: 'snapsharp-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } },
);

const tools = [
  screenshotTool,
  ogImageTool,
  htmlToImageTool,
  siteAuditTool,
  videoTool,
  scrollTool,
  pdfTool,
  batchTool,
  diffTool,
  extractTool,
  analyzeTool,
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: tools.map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: t.inputSchema,
  })),
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const tool = tools.find((t) => t.name === request.params.name);
  if (!tool) {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }

  try {
    return await tool.handler(client, (request.params.arguments || {}) as Record<string, unknown>);
  } catch (err) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${(err as Error).message}`,
        },
      ],
      isError: true,
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);

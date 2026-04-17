import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

const API_BASE = 'https://api.snapsharp.dev';

export class SnapSharp implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'SnapSharp',
    name: 'snapSharp',
    icon: 'file:snapsharp.svg',
    group: ['output'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Screenshot, OG image, site audit, video, PDF and more via SnapSharp API',
    defaults: {
      name: 'SnapSharp',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'snapSharpApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Screenshot',
            value: 'screenshot',
            description: 'Capture a screenshot of any URL',
            action: 'Capture a screenshot of any URL',
          },
          {
            name: 'OG Image',
            value: 'ogImage',
            description: 'Generate an Open Graph image from a template',
            action: 'Generate an Open Graph image from a template',
          },
          {
            name: 'HTML to Image',
            value: 'htmlToImage',
            description: 'Render HTML/CSS to an image',
            action: 'Render HTML CSS to an image',
          },
          {
            name: 'Site Audit',
            value: 'siteAudit',
            description: 'Extract colors, fonts, tech stack and accessibility data',
            action: 'Extract colors fonts tech stack and accessibility data',
          },
          {
            name: 'Video Recording',
            value: 'video',
            description: 'Record a webpage as MP4, WebM, or GIF',
            action: 'Record a webpage as MP4 WebM or GIF',
          },
          {
            name: 'PDF',
            value: 'pdf',
            description: 'Generate a PDF from a URL, HTML, or template',
            action: 'Generate a PDF from a URL HTML or template',
          },
        ],
        default: 'screenshot',
      },

      // ── SCREENSHOT ─────────────────────────────────────────────────
      {
        displayName: 'URL',
        name: 'url',
        type: 'string',
        default: '',
        placeholder: 'https://example.com',
        description: 'URL to capture',
        displayOptions: {
          show: { operation: ['screenshot', 'siteAudit', 'video', 'pdf'] },
        },
        required: true,
      },
      {
        displayName: 'Format',
        name: 'format',
        type: 'options',
        options: [
          { name: 'PNG', value: 'png' },
          { name: 'JPEG', value: 'jpeg' },
          { name: 'WebP', value: 'webp' },
        ],
        default: 'png',
        displayOptions: { show: { operation: ['screenshot', 'htmlToImage'] } },
      },
      {
        displayName: 'Additional Options',
        name: 'screenshotOptions',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        displayOptions: { show: { operation: ['screenshot'] } },
        options: [
          { displayName: 'Width', name: 'width', type: 'number', default: 1280, description: 'Viewport width in pixels' },
          { displayName: 'Height', name: 'height', type: 'number', default: 720, description: 'Viewport height in pixels' },
          { displayName: 'Full Page', name: 'full_page', type: 'boolean', default: false, description: 'Whether to capture full page height' },
          { displayName: 'Dark Mode', name: 'dark_mode', type: 'boolean', default: false },
          { displayName: 'Block Ads', name: 'block_ads', type: 'boolean', default: false },
          { displayName: 'Block Cookie Banners', name: 'block_cookie_banners', type: 'boolean', default: false },
          { displayName: 'Stealth Mode', name: 'stealth', type: 'boolean', default: false, description: 'Bypass bot detection (Growth+ plan)' },
          { displayName: 'Device', name: 'device', type: 'string', default: '', placeholder: 'iPhone 14', description: 'Device preset' },
          { displayName: 'Delay (ms)', name: 'delay', type: 'number', default: 0 },
          { displayName: 'Wait For Selector', name: 'wait_for', type: 'string', default: '', description: 'CSS selector to wait for' },
          { displayName: 'Retina', name: 'retina', type: 'boolean', default: false, description: 'Whether to capture at 2x resolution' },
        ],
      },

      // ── OG IMAGE ───────────────────────────────────────────────────
      {
        displayName: 'Template',
        name: 'ogTemplate',
        type: 'string',
        default: 'blog-post',
        placeholder: 'blog-post',
        description: 'OG image template name (e.g. blog-post, social-card, product-card)',
        displayOptions: { show: { operation: ['ogImage'] } },
        required: true,
      },
      {
        displayName: 'Template Data',
        name: 'ogData',
        type: 'fixedCollection',
        typeOptions: { multipleValues: true },
        default: {},
        description: 'Key-value pairs for the template',
        displayOptions: { show: { operation: ['ogImage'] } },
        options: [
          {
            name: 'data',
            displayName: 'Data',
            values: [
              { displayName: 'Key', name: 'key', type: 'string', default: '' },
              { displayName: 'Value', name: 'value', type: 'string', default: '' },
            ],
          },
        ],
      },
      {
        displayName: 'OG Options',
        name: 'ogOptions',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        displayOptions: { show: { operation: ['ogImage'] } },
        options: [
          { displayName: 'Width', name: 'width', type: 'number', default: 1200 },
          { displayName: 'Height', name: 'height', type: 'number', default: 630 },
          { displayName: 'Format', name: 'format', type: 'options', options: [{ name: 'PNG', value: 'png' }, { name: 'JPEG', value: 'jpeg' }, { name: 'WebP', value: 'webp' }], default: 'png' },
        ],
      },

      // ── HTML TO IMAGE ──────────────────────────────────────────────
      {
        displayName: 'HTML',
        name: 'html',
        type: 'string',
        typeOptions: { rows: 6 },
        default: '',
        placeholder: '<div style="padding:40px;background:#fff">Hello World</div>',
        description: 'HTML content to render as image',
        displayOptions: { show: { operation: ['htmlToImage'] } },
        required: true,
      },
      {
        displayName: 'HTML Options',
        name: 'htmlOptions',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        displayOptions: { show: { operation: ['htmlToImage'] } },
        options: [
          { displayName: 'Width', name: 'width', type: 'number', default: 800 },
          { displayName: 'Height', name: 'height', type: 'number', default: 600 },
        ],
      },

      // ── SITE AUDIT ─────────────────────────────────────────────────
      {
        displayName: 'Audit Format',
        name: 'auditFormat',
        type: 'options',
        options: [
          { name: 'JSON', value: 'json' },
          { name: 'PNG Report', value: 'png' },
          { name: 'PDF Report', value: 'pdf' },
        ],
        default: 'json',
        displayOptions: { show: { operation: ['siteAudit'] } },
      },

      // ── VIDEO ──────────────────────────────────────────────────────
      {
        displayName: 'Video Options',
        name: 'videoOptions',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        displayOptions: { show: { operation: ['video'] } },
        options: [
          { displayName: 'Format', name: 'format', type: 'options', options: [{ name: 'MP4', value: 'mp4' }, { name: 'WebM', value: 'webm' }, { name: 'GIF', value: 'gif' }], default: 'mp4' },
          { displayName: 'Duration (seconds)', name: 'duration', type: 'number', default: 5 },
          { displayName: 'Width', name: 'width', type: 'number', default: 1280 },
          { displayName: 'Height', name: 'height', type: 'number', default: 720 },
          { displayName: 'FPS', name: 'fps', type: 'number', default: 24 },
          { displayName: 'Auto Scroll', name: 'scroll', type: 'boolean', default: false },
          { displayName: 'Dark Mode', name: 'dark_mode', type: 'boolean', default: false },
        ],
      },

      // ── PDF ────────────────────────────────────────────────────────
      {
        displayName: 'PDF Source',
        name: 'pdfSource',
        type: 'options',
        options: [
          { name: 'URL', value: 'url' },
          { name: 'HTML Content', value: 'html' },
          { name: 'Template', value: 'template' },
        ],
        default: 'url',
        displayOptions: { show: { operation: ['pdf'] } },
      },
      {
        displayName: 'HTML Content',
        name: 'pdfHtml',
        type: 'string',
        typeOptions: { rows: 6 },
        default: '',
        displayOptions: { show: { operation: ['pdf'], pdfSource: ['html'] } },
        required: true,
      },
      {
        displayName: 'Template Name',
        name: 'pdfTemplate',
        type: 'string',
        default: 'invoice',
        displayOptions: { show: { operation: ['pdf'], pdfSource: ['template'] } },
        required: true,
      },
      {
        displayName: 'PDF Options',
        name: 'pdfOptions',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        displayOptions: { show: { operation: ['pdf'] } },
        options: [
          { displayName: 'Paper Format', name: 'format', type: 'options', options: [{ name: 'A4', value: 'A4' }, { name: 'A3', value: 'A3' }, { name: 'Letter', value: 'Letter' }, { name: 'Legal', value: 'Legal' }], default: 'A4' },
          { displayName: 'Landscape', name: 'landscape', type: 'boolean', default: false },
        ],
      },

      // ── OUTPUT ─────────────────────────────────────────────────────
      {
        displayName: 'Output',
        name: 'output',
        type: 'options',
        options: [
          { name: 'Binary (File)', value: 'binary', description: 'Return image/video/PDF as binary data' },
          { name: 'Base64 String', value: 'base64', description: 'Return as base64 encoded string' },
          { name: 'JSON (audit only)', value: 'json', description: 'Return JSON data (site audit only)' },
        ],
        default: 'binary',
        displayOptions: { show: { operation: ['screenshot', 'ogImage', 'htmlToImage', 'video', 'pdf'] } },
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const credentials = await this.getCredentials('snapSharpApi');
    const apiKey = credentials.apiKey as string;

    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const operation = this.getNodeParameter('operation', i) as string;
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'n8n-nodes-snapsharp/1.0.0',
      };

      try {
        if (operation === 'screenshot') {
          const url = this.getNodeParameter('url', i) as string;
          const format = this.getNodeParameter('format', i) as string;
          const options = this.getNodeParameter('screenshotOptions', i) as Record<string, unknown>;
          const output = this.getNodeParameter('output', i) as string;

          const qs = new URLSearchParams({ url, format, ...Object.fromEntries(
            Object.entries(options).filter(([, v]) => v !== '' && v !== false).map(([k, v]) => [k, String(v)])
          )}).toString();

          const res = await this.helpers.httpRequest({
            method: 'GET',
            url: `${API_BASE}/v1/screenshot?${qs}`,
            headers,
            encoding: 'arraybuffer',
            returnFullResponse: true,
          });

          if (output === 'binary') {
            const binaryData = await this.helpers.prepareBinaryData(
              Buffer.from(res.body as Buffer),
              `screenshot.${format}`,
              res.headers['content-type'] as string,
            );
            returnData.push({ json: { url, format }, binary: { data: binaryData } });
          } else {
            const b64 = Buffer.from(res.body as Buffer).toString('base64');
            returnData.push({ json: { url, format, data: b64, mimeType: res.headers['content-type'] } });
          }
        } else if (operation === 'ogImage') {
          const template = this.getNodeParameter('ogTemplate', i) as string;
          const rawData = this.getNodeParameter('ogData', i) as { data?: Array<{ key: string; value: string }> };
          const options = this.getNodeParameter('ogOptions', i) as Record<string, unknown>;
          const output = this.getNodeParameter('output', i) as string;

          const data: Record<string, string> = {};
          (rawData.data || []).forEach(({ key, value }) => { if (key) data[key] = value; });

          const body = { template, data, ...options };
          const res = await this.helpers.httpRequest({
            method: 'POST',
            url: `${API_BASE}/v1/og-image`,
            headers: { ...headers, 'Content-Type': 'application/json' },
            body,
            encoding: 'arraybuffer',
            returnFullResponse: true,
          });

          const fmt = (options.format as string) || 'png';
          if (output === 'binary') {
            const binaryData = await this.helpers.prepareBinaryData(
              Buffer.from(res.body as Buffer),
              `og-image.${fmt}`,
              res.headers['content-type'] as string,
            );
            returnData.push({ json: { template }, binary: { data: binaryData } });
          } else {
            returnData.push({ json: { template, data: Buffer.from(res.body as Buffer).toString('base64') } });
          }
        } else if (operation === 'htmlToImage') {
          const html = this.getNodeParameter('html', i) as string;
          const format = this.getNodeParameter('format', i) as string;
          const options = this.getNodeParameter('htmlOptions', i) as Record<string, unknown>;
          const output = this.getNodeParameter('output', i) as string;

          const res = await this.helpers.httpRequest({
            method: 'POST',
            url: `${API_BASE}/v1/html-to-image`,
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: { html, format, ...options },
            encoding: 'arraybuffer',
            returnFullResponse: true,
          });

          if (output === 'binary') {
            const binaryData = await this.helpers.prepareBinaryData(
              Buffer.from(res.body as Buffer),
              `rendered.${format}`,
              res.headers['content-type'] as string,
            );
            returnData.push({ json: { format }, binary: { data: binaryData } });
          } else {
            returnData.push({ json: { data: Buffer.from(res.body as Buffer).toString('base64') } });
          }
        } else if (operation === 'siteAudit') {
          const url = this.getNodeParameter('url', i) as string;
          const auditFormat = this.getNodeParameter('auditFormat', i) as string;

          const body = { url, format: auditFormat };

          if (auditFormat === 'json') {
            const result = await this.helpers.httpRequest({
              method: 'POST',
              url: `${API_BASE}/v1/site-audit`,
              headers: { ...headers, 'Content-Type': 'application/json' },
              body,
            });
            returnData.push({ json: result as IDataObject });
          } else {
            const res = await this.helpers.httpRequest({
              method: 'POST',
              url: `${API_BASE}/v1/site-audit`,
              headers: { ...headers, 'Content-Type': 'application/json' },
              body,
              encoding: 'arraybuffer',
              returnFullResponse: true,
            });
            const ext = auditFormat === 'pdf' ? 'pdf' : 'png';
            const binaryData = await this.helpers.prepareBinaryData(
              Buffer.from(res.body as Buffer),
              `site-audit.${ext}`,
              res.headers['content-type'] as string,
            );
            returnData.push({ json: { url }, binary: { data: binaryData } });
          }
        } else if (operation === 'video') {
          const url = this.getNodeParameter('url', i) as string;
          const options = this.getNodeParameter('videoOptions', i) as Record<string, unknown>;
          const output = this.getNodeParameter('output', i) as string;
          const fmt = (options.format as string) || 'mp4';

          const res = await this.helpers.httpRequest({
            method: 'POST',
            url: `${API_BASE}/v1/video`,
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: { url, ...options },
            encoding: 'arraybuffer',
            returnFullResponse: true,
          });

          if (output === 'binary') {
            const mimeMap: Record<string, string> = { mp4: 'video/mp4', webm: 'video/webm', gif: 'image/gif' };
            const binaryData = await this.helpers.prepareBinaryData(
              Buffer.from(res.body as Buffer),
              `recording.${fmt}`,
              mimeMap[fmt] || 'video/mp4',
            );
            returnData.push({ json: { url, format: fmt }, binary: { data: binaryData } });
          } else {
            returnData.push({ json: { url, format: fmt, data: Buffer.from(res.body as Buffer).toString('base64') } });
          }
        } else if (operation === 'pdf') {
          const pdfSource = this.getNodeParameter('pdfSource', i) as string;
          const options = this.getNodeParameter('pdfOptions', i) as Record<string, unknown>;
          const output = this.getNodeParameter('output', i) as string;

          const body: Record<string, unknown> = { ...options };
          if (pdfSource === 'url') {
            body.url = this.getNodeParameter('url', i) as string;
          } else if (pdfSource === 'html') {
            body.html = this.getNodeParameter('pdfHtml', i) as string;
          } else {
            body.template = this.getNodeParameter('pdfTemplate', i) as string;
          }

          const res = await this.helpers.httpRequest({
            method: 'POST',
            url: `${API_BASE}/v1/pdf`,
            headers: { ...headers, 'Content-Type': 'application/json' },
            body,
            encoding: 'arraybuffer',
            returnFullResponse: true,
          });

          if (output === 'binary') {
            const binaryData = await this.helpers.prepareBinaryData(
              Buffer.from(res.body as Buffer),
              'document.pdf',
              'application/pdf',
            );
            returnData.push({ json: { source: pdfSource }, binary: { data: binaryData } });
          } else {
            returnData.push({ json: { data: Buffer.from(res.body as Buffer).toString('base64') } });
          }
        } else {
          throw new NodeOperationError(this.getNode(), `Unsupported operation: ${operation}`);
        }
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({ json: { error: (error as Error).message }, pairedItem: i });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}

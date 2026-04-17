const SDK_VERSION = '1.0.0';

export class SnapSharpClient {
  private readonly baseUrl: string;

  constructor(
    private readonly apiKey: string,
    baseUrl = 'https://api.snapsharp.dev',
  ) {
    this.baseUrl = baseUrl;
  }

  async screenshot(params: Record<string, unknown>): Promise<{ buffer: Buffer; contentType: string }> {
    const qs = this.buildQuery(params);
    const res = await this.fetch(`/v1/screenshot?${qs}`, { method: 'GET' });
    const buffer = Buffer.from(await res.arrayBuffer());
    return { buffer, contentType: res.headers.get('content-type') || 'image/png' };
  }

  async post(path: string, body: Record<string, unknown>, isBinary = false): Promise<{ buffer: Buffer; contentType: string } | unknown> {
    const res = await this.fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (isBinary) {
      const buffer = Buffer.from(await res.arrayBuffer());
      return { buffer, contentType: res.headers.get('content-type') || 'application/octet-stream' };
    }
    return res.json();
  }

  private async fetch(path: string, init: RequestInit): Promise<Response> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'User-Agent': `snapsharp-mcp/${SDK_VERSION}`,
      ...(init.headers as Record<string, string> || {}),
    };
    const res = await globalThis.fetch(url, { ...init, headers });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`SnapSharp API error: ${res.status} ${text}`);
    }
    return res;
  }

  private buildQuery(params: Record<string, unknown>): string {
    const sp = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        sp.set(key, String(value));
      }
    }
    return sp.toString();
  }
}

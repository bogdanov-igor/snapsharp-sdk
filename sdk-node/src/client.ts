import type {
  ExtractResponse,
  ScreenshotParams,
  SiteAuditParams,
  Template,
  UsageResponse,
  SnapSharpOptions,
  VideoParams,
  ScrollParams,
  PdfParams,
  PdfTemplateInfo,
  BatchParams,
  SitemapParams,
  JobResponse,
} from './types.js';
import { SnapSharpError, RateLimitError, AuthError, TimeoutError } from './errors.js';

const DEFAULT_BASE_URL = 'https://api.snapsharp.dev';
const DEFAULT_TIMEOUT = 30_000;
const SDK_VERSION = '1.0.0';

export class SnapSharp {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(apiKey: string, options?: SnapSharpOptions) {
    if (!apiKey) throw new Error('API key is required');
    this.apiKey = apiKey;
    this.baseUrl = options?.baseUrl ?? DEFAULT_BASE_URL;
    this.timeout = options?.timeout ?? DEFAULT_TIMEOUT;
  }

  /**
   * Take a screenshot of a URL.
   *
   * @example
   * const snap = new SnapSharp('sk_live_...');
   * const buffer = await snap.screenshot('https://example.com');
   * fs.writeFileSync('screenshot.png', buffer);
   *
   * @example
   * const buffer = await snap.screenshot('https://example.com', {
   *   width: 1920, height: 1080, format: 'webp',
   *   fullPage: true, darkMode: true, blockAds: true,
   * });
   */
  async screenshot(url: string, params?: Partial<ScreenshotParams>): Promise<Buffer> {
    const allParams: Record<string, unknown> = { url, ...params };
    const hasComplexParams = params?.headers || params?.cookies || params?.css || params?.js;

    const snaked = this.toSnakeCase(allParams);

    if (hasComplexParams) {
      return this.postBinary('/v1/screenshot', snaked);
    }
    return this.getBinary('/v1/screenshot?' + this.buildQuery(snaked));
  }

  /**
   * Generate an OG image from a template.
   *
   * @example
   * const buffer = await snap.ogImage('blog-post', {
   *   title: 'My Article', author: 'Jane Doe',
   * });
   * fs.writeFileSync('og.png', buffer);
   */
  async ogImage(
    template: string,
    data: Record<string, string>,
    options?: { width?: number; height?: number; format?: 'png' | 'jpeg' | 'webp'; quality?: number },
  ): Promise<Buffer> {
    return this.postBinary('/v1/og-image', { template, data, ...options });
  }

  /**
   * Render HTML/CSS to an image.
   *
   * @example
   * const buffer = await snap.htmlToImage(
   *   '<div style="padding:40px;background:#1a1a2e;color:white;font-size:48px">Hello</div>',
   *   { width: 800, height: 400 }
   * );
   */
  async htmlToImage(
    html: string,
    options?: { width?: number; height?: number; format?: 'png' | 'jpeg' | 'webp'; quality?: number },
  ): Promise<Buffer> {
    return this.postBinary('/v1/html-to-image', { html, ...options });
  }

  /** List available OG image templates. */
  async templates(): Promise<Template[]> {
    const res = await this.request('/v1/templates', { method: 'GET' });
    const json = await res.json() as { templates: Template[] };
    return json.templates;
  }

  /** Get current API usage statistics. */
  async usage(): Promise<UsageResponse> {
    const res = await this.request('/v1/usage', { method: 'GET' });
    return res.json() as Promise<UsageResponse>;
  }

  /** Check API health (no auth required). */
  async health(): Promise<{ status: string; version: string; uptime: number }> {
    const res = await this.request('/health', { method: 'GET', noAuth: true });
    return res.json() as Promise<{ status: string; version: string; uptime: number }>;
  }

  /**
   * Extract design tokens from a website (colors, fonts, headings, stack).
   * Returns JSON by default, or Buffer for PNG/PDF formats.
   */
  async siteAudit(url: string, params?: Partial<Omit<SiteAuditParams, 'url'>>): Promise<Record<string, unknown> | Buffer> {
    const body = this.toSnakeCase({ url, ...params });
    if (params?.format === 'png' || params?.format === 'pdf') {
      return this.postBinary('/v1/site-audit', body);
    }
    const res = await this.request('/v1/site-audit', { method: 'POST', body });
    return res.json() as Promise<Record<string, unknown>>;
  }

  /**
   * Record a webpage as video (MP4, WebM, or GIF).
   *
   * @example
   * const buffer = await snap.video('https://stripe.com', { format: 'mp4', duration: 5 });
   * fs.writeFileSync('recording.mp4', buffer);
   */
  async video(url: string, params?: VideoParams): Promise<Buffer> {
    const body = this.toSnakeCase({ url, ...params });
    return this.postBinary('/v1/video', body);
  }

  /**
   * Record an auto-scrolling page as GIF or MP4.
   *
   * @example
   * const buffer = await snap.scroll('https://stripe.com', { format: 'gif', duration: 6 });
   * fs.writeFileSync('scroll.gif', buffer);
   */
  async scroll(url: string, params?: ScrollParams): Promise<Buffer> {
    const snaked = this.toSnakeCase({ url, ...params });
    return this.getBinary('/v1/scroll?' + this.buildQuery(snaked));
  }

  /**
   * Generate a PDF from a built-in template or custom HTML.
   *
   * @example
   * const buffer = await snap.pdf({
   *   template: 'invoice',
   *   data: { company_name: 'Acme', invoice_number: 'INV-001', ... },
   * });
   * fs.writeFileSync('invoice.pdf', buffer);
   */
  async pdf(params: PdfParams): Promise<Buffer> {
    const body = this.toSnakeCase(params as unknown as Record<string, unknown>);
    return this.postBinary('/v1/pdf', body);
  }

  /**
   * List available PDF templates.
   */
  async pdfTemplates(): Promise<PdfTemplateInfo[]> {
    const res = await this.request('/v1/pdf/templates', { method: 'GET', noAuth: true });
    const json = await res.json() as { templates: PdfTemplateInfo[] };
    return json.templates;
  }

  /**
   * Start an async batch screenshot job. Returns a job ID — poll getJob() for status.
   */
  async batch(urls: string[], params?: BatchParams): Promise<JobResponse> {
    const body = { urls, ...this.toSnakeCase((params ?? {}) as Record<string, unknown>) };
    const res = await this.request('/v1/batch', { method: 'POST', body });
    const json = await res.json() as Record<string, unknown>;
    return {
      jobId: json['job_id'] as string,
      status: (json['status'] as JobResponse['status']) ?? 'pending',
      type: 'batch',
      totalUrls: json['total_urls'] as number,
      pollUrl: json['poll_url'] as string,
      downloadUrl: json['download_url'] as string,
      expiresAt: json['expires_at'] as string,
    };
  }

  /**
   * Start an async sitemap crawl job.
   */
  async sitemap(sitemapUrl: string, params?: SitemapParams): Promise<JobResponse> {
    const body = {
      sitemap_url: sitemapUrl,
      ...this.toSnakeCase((params ?? {}) as Record<string, unknown>),
    };
    const res = await this.request('/v1/sitemap', { method: 'POST', body });
    const json = await res.json() as Record<string, unknown>;
    return {
      jobId: json['job_id'] as string,
      status: (json['status'] as JobResponse['status']) ?? 'pending',
      type: 'sitemap',
      pollUrl: json['poll_url'] as string,
      downloadUrl: json['download_url'] as string,
      expiresAt: json['expires_at'] as string,
    };
  }

  /**
   * Poll the status of an async job.
   */
  async getJob(jobId: string): Promise<JobResponse> {
    const res = await this.request(`/v1/jobs/${jobId}`, { method: 'GET' });
    const json = await res.json() as Record<string, unknown>;
    return {
      jobId: json['id'] as string,
      status: (json['status'] as JobResponse['status']) ?? 'pending',
      type: json['type'] as string,
      progress: json['progress'] as JobResponse['progress'],
      downloadUrl: json['download_url'] as string,
      expiresAt: json['expires_at'] as string | undefined,
      error: (json['error'] as string) ?? null,
      createdAt: json['created_at'] as string,
      startedAt: (json['started_at'] as string) ?? null,
      completedAt: (json['completed_at'] as string) ?? null,
    };
  }

  /**
   * Download the ZIP result of a completed job.
   */
  async downloadJob(jobId: string): Promise<Buffer> {
    return this.getBinary(`/v1/jobs/${jobId}/download`);
  }

  /**
   * List the authenticated user's jobs.
   */
  async listJobs(options?: { status?: string; limit?: number; offset?: number }): Promise<JobResponse[]> {
    const qs = options ? '?' + new URLSearchParams(
      Object.entries(options)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString() : '';
    const res = await this.request(`/v1/jobs${qs}`, { method: 'GET' });
    const json = await res.json() as { jobs: Record<string, unknown>[] };
    return json.jobs.map((j) => ({
      jobId: j['id'] as string,
      status: (j['status'] as JobResponse['status']) ?? 'pending',
      type: j['type'] as string,
      progress: j['progress'] as JobResponse['progress'],
      downloadUrl: j['download_url'] as string,
      expiresAt: j['expires_at'] as string | undefined,
      error: (j['error'] as string) ?? null,
      createdAt: j['created_at'] as string,
      startedAt: (j['started_at'] as string) ?? null,
      completedAt: (j['completed_at'] as string) ?? null,
    }));
  }

  /**
   * Extract page metadata (OG tags, title, description, favicons) from a URL.
   */
  async extract(url: string): Promise<ExtractResponse> {
    const res = await this.request('/v1/extract?url=' + encodeURIComponent(url), { method: 'GET' });
    return res.json() as Promise<ExtractResponse>;
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private async request(
    path: string,
    options: { method: string; body?: unknown; noAuth?: boolean },
  ): Promise<Response> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'User-Agent': `@snapsharp/sdk/${SDK_VERSION}`,
    };

    if (!options.noAuth) headers['Authorization'] = `Bearer ${this.apiKey}`;
    if (options.body) headers['Content-Type'] = 'application/json';

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const res = await fetch(url, {
        method: options.method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      if (!res.ok) await this.handleError(res);
      return res;
    } catch (err) {
      if (err instanceof SnapSharpError) throw err;
      if ((err as Error).name === 'AbortError') {
        throw new TimeoutError(`Request timed out after ${this.timeout}ms`);
      }
      throw new SnapSharpError(`Network error: ${(err as Error).message}`, 0, 'network_error');
    } finally {
      clearTimeout(timer);
    }
  }

  private async getBinary(path: string): Promise<Buffer> {
    const res = await this.request(path, { method: 'GET' });
    return Buffer.from(await res.arrayBuffer());
  }

  private async postBinary(path: string, body: unknown): Promise<Buffer> {
    const res = await this.request(path, { method: 'POST', body });
    return Buffer.from(await res.arrayBuffer());
  }

  private async handleError(res: Response): Promise<never> {
    let body: { error?: string; message?: string } = {};
    try { body = await res.json() as typeof body; } catch { /* ignore */ }

    const message = body.message ?? body.error ?? `HTTP ${res.status}`;

    if (res.status === 401) throw new AuthError(message);
    if (res.status === 429) {
      const retryAfter = parseInt(res.headers.get('Retry-After') ?? '30');
      throw new RateLimitError(message, retryAfter);
    }
    if (res.status === 504) throw new TimeoutError(message);
    throw new SnapSharpError(message, res.status, body.error ?? 'unknown');
  }

  private buildQuery(params: Record<string, unknown>): string {
    const sp = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) sp.set(key, String(value));
    }
    return sp.toString();
  }

  private toSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
      result[snakeKey] = value;
    }
    return result;
  }
}

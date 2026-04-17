export interface SnapSharpOptions {
  baseUrl?: string;
  timeout?: number;
}

export interface ScreenshotParams {
  width?: number;
  height?: number;
  format?: 'png' | 'jpeg' | 'webp' | 'pdf';
  quality?: number;
  fullPage?: boolean;
  retina?: boolean;
  delay?: number;
  waitFor?: string;
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
  css?: string;
  js?: string;
  hideSelectors?: string | string[];
  click?: string;
  darkMode?: boolean;
  blockAds?: boolean;
  stealth?: boolean;
  device?: string;
  clip?: { x: number; y: number; width: number; height: number };
  userAgent?: string;
  headers?: Record<string, string>;
  cookies?: Array<{ name: string; value: string; domain?: string; path?: string }>;
  proxy?: string;
  country?: string;
  cache?: boolean;
  cacheTtl?: number;
  bypassCsp?: boolean;
}

export interface OgImageParams {
  template: string;
  data: Record<string, string>;
  width?: number;
  height?: number;
  format?: 'png' | 'jpeg' | 'webp';
  quality?: number;
}

export interface HtmlToImageParams {
  html: string;
  width?: number;
  height?: number;
  format?: 'png' | 'jpeg' | 'webp';
  quality?: number;
}

export interface SiteAuditParams {
  url: string;
  format?: 'json' | 'png' | 'pdf';
  includeScreenshot?: boolean;
  width?: number;
  sections?: Array<'colors' | 'fonts' | 'headings' | 'stack' | 'accessibility'>;
}

export interface ExtractResponse {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
  'og:title': string | null;
  'og:description': string | null;
  'og:image': string | null;
  'og:url': string | null;
  'twitter:card': string | null;
  favicons: Array<{ url: string; size?: string; type: string }>;
}

export interface VideoParams {
  format?: 'mp4' | 'webm' | 'gif';
  duration?: number;
  width?: number;
  height?: number;
  fps?: number;
  scroll?: boolean;
  scrollSpeed?: number;
  darkMode?: boolean;
  blockAds?: boolean;
  stealth?: boolean;
  delay?: number;
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
  hideSelectors?: string;
  proxy?: string;
  country?: 'US' | 'GB' | 'DE' | 'JP';
}

export interface ScrollParams {
  format?: 'mp4' | 'webm' | 'gif';
  width?: number;
  height?: number;
  duration?: number;
  scrollSpeed?: number;
  darkMode?: boolean;
  blockAds?: boolean;
  stealth?: boolean;
  delay?: number;
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
}

export interface PdfMargin {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
}

export interface PdfParams {
  template?: string;
  data?: Record<string, unknown>;
  html?: string;
  format?: 'A4' | 'A3' | 'Letter' | 'Legal';
  landscape?: boolean;
  margin?: PdfMargin;
  headerHtml?: string;
  footerHtml?: string;
}

export interface PdfTemplateInfo {
  id: string;
  name: string;
  variables: string[];
}

export interface BatchParams {
  format?: 'png' | 'jpeg' | 'webp';
  width?: number;
  height?: number;
  quality?: number;
  fullPage?: boolean;
  darkMode?: boolean;
  blockAds?: boolean;
  stealth?: boolean;
  device?: string;
  callbackUrl?: string;
}

export interface SitemapParams {
  includePattern?: string;
  excludePattern?: string;
  maxPages?: number;
  format?: 'png' | 'jpeg' | 'webp';
  width?: number;
  height?: number;
  quality?: number;
  fullPage?: boolean;
  darkMode?: boolean;
  blockAds?: boolean;
  stealth?: boolean;
  callbackUrl?: string;
}

export interface JobProgress {
  total: number;
  completed: number;
  failed: number;
  percentage: number;
}

export interface JobResponse {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'partial';
  type: string;
  progress?: JobProgress;
  totalUrls?: number;
  pollUrl?: string;
  downloadUrl?: string;
  expiresAt?: string;
  error?: string | null;
  createdAt?: string;
  startedAt?: string | null;
  completedAt?: string | null;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  preview_url: string;
  variables: string[];
}

export interface UsageResponse {
  plan: string;
  period: { start: string; end: string };
  usage: {
    requests: number;
    limit: number;
    remaining: number;
    percentage: number;
  };
  breakdown: {
    screenshot: number;
    og_image: number;
    html_to_image: number;
    site_audit: number;
    extract: number;
  };
  cache_hit_rate: number;
  avg_response_time_ms: number;
}

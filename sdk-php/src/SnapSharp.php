<?php

namespace SnapSharp;

use SnapSharp\Errors\{SnapSharpException, AuthException, RateLimitException, TimeoutException};

class SnapSharp
{
    private string $apiKey;
    private string $baseUrl;
    private int $timeout;

    public function __construct(string $apiKey, array $options = [])
    {
        if (empty($apiKey)) {
            throw new \InvalidArgumentException('API key is required');
        }
        $this->apiKey   = $apiKey;
        $this->baseUrl  = rtrim($options['base_url'] ?? 'https://api.snapsharp.dev', '/');
        $this->timeout  = $options['timeout'] ?? 30;
    }

    /**
     * Take a screenshot of a URL.
     *
     * @param  string $url    The URL to screenshot.
     * @param  array  $params Optional parameters (width, height, format [png|jpeg|webp|pdf], full_page, etc.)
     * @return string         Binary image/PDF data.
     */
    public function screenshot(string $url, array $params = []): string
    {
        $params['url'] = $url;
        $hasComplex = isset($params['headers']) || isset($params['cookies']) || isset($params['css']);

        if ($hasComplex) {
            return $this->postBinary('/v1/screenshot', $params);
        }
        return $this->getBinary('/v1/screenshot', $params);
    }

    /**
     * Generate an OG image from a template.
     *
     * @param  string $template Template ID.
     * @param  array  $data     Template variables.
     * @param  array  $options  Optional: width, height, format, quality.
     * @return string           Binary image data.
     */
    public function ogImage(string $template, array $data, array $options = []): string
    {
        return $this->postBinary('/v1/og-image', array_merge([
            'template' => $template,
            'data'     => $data,
        ], $options));
    }

    /**
     * Render HTML to an image.
     *
     * @param  string $html    HTML string.
     * @param  array  $options Optional: width, height, format, quality.
     * @return string          Binary image data.
     */
    public function htmlToImage(string $html, array $options = []): string
    {
        return $this->postBinary('/v1/html-to-image', array_merge(['html' => $html], $options));
    }

    /**
     * List available OG image templates.
     *
     * @return array<int, array<string, mixed>>
     */
    public function templates(): array
    {
        $res = $this->request('GET', '/v1/templates');
        return json_decode($res, true)['templates'] ?? [];
    }

    /**
     * Get current usage statistics.
     *
     * @return array<string, mixed>
     */
    public function usage(): array
    {
        $res = $this->request('GET', '/v1/usage');
        return json_decode($res, true) ?? [];
    }

    /**
     * Extract design tokens from a website.
     *
     * @param  string $url    The URL to audit.
     * @param  array  $params Optional: format, include_screenshot, width, sections.
     * @return mixed          Decoded JSON array for json format, binary string for png/pdf.
     */
    public function siteAudit(string $url, array $params = []): mixed
    {
        $params['url'] = $url;
        $format = $params['format'] ?? 'json';
        $raw = $this->postBinary('/v1/site-audit', $params);
        if ($format === 'json') {
            return json_decode($raw, true);
        }
        return $raw;
    }

    /**
     * Record a webpage as video or GIF. Returns binary video data.
     *
     * @param  string $url    The URL to record.
     * @param  array  $params Optional: format (mp4|webm|gif), duration, width, height, fps, scroll, scroll_speed, dark_mode, block_ads, stealth.
     * @return string         Binary video data.
     */
    public function video(string $url, array $params = []): string
    {
        $params['url'] = $url;
        return $this->postBinary('/v1/video', $params);
    }

    /**
     * Record an auto-scrolling page as GIF or MP4. Returns binary video data.
     *
     * @param  string $url    The URL to record.
     * @param  array  $params Optional: format (gif|mp4|webm), duration, scroll_speed, width, height.
     * @return string         Binary video data.
     */
    public function scroll(string $url, array $params = []): string
    {
        $params['url'] = $url;
        return $this->getBinary('/v1/scroll', $params);
    }

    /**
     * Generate a PDF from a built-in template or custom HTML.
     *
     * @param  array $params Required: template+data OR html. Optional: format, landscape, margin, header_html, footer_html.
     * @return string        Binary PDF data.
     */
    public function pdf(array $params): string
    {
        return $this->postBinary('/v1/pdf', $params);
    }

    /**
     * List available built-in PDF templates.
     *
     * @return array<int, array<string, mixed>>
     */
    public function pdfTemplates(): array
    {
        $res = $this->request('GET', '/v1/pdf/templates');
        return json_decode($res, true)['templates'] ?? [];
    }

    /**
     * Extract page metadata (OG tags, title, favicons) from a URL.
     *
     * @param  string $url The URL to extract metadata from.
     * @return array<string, mixed>
     */
    /**
     * Start an async batch screenshot job.
     *
     * @param  string[] $urls   Array of URLs to screenshot.
     * @param  array    $params format, width, height, full_page, dark_mode, etc.
     * @return array            Job info with job_id, status, poll_url, download_url.
     */
    public function batch(array $urls, array $params = []): array
    {
        $body = array_merge(['urls' => $urls], $params);
        $res  = $this->request('POST', '/v1/batch', $body);
        return json_decode($res, true) ?? [];
    }

    /**
     * Start an async sitemap crawl job.
     *
     * @param  string $sitemapUrl URL of the sitemap.xml.
     * @param  array  $params     max_pages, include_pattern, exclude_pattern, format, etc.
     * @return array              Job info.
     */
    public function sitemap(string $sitemapUrl, array $params = []): array
    {
        $body = array_merge(['sitemap_url' => $sitemapUrl], $params);
        $res  = $this->request('POST', '/v1/sitemap', $body);
        return json_decode($res, true) ?? [];
    }

    /**
     * Get the status of an async job.
     *
     * @param  string $jobId UUID of the job.
     * @return array         Job status, progress, result_url.
     */
    public function getJob(string $jobId): array
    {
        $res = $this->request('GET', "/v1/jobs/$jobId");
        return json_decode($res, true) ?? [];
    }

    /**
     * List the user's async jobs.
     *
     * @param  array $params status, limit, offset.
     * @return array         Array of job objects.
     */
    public function listJobs(array $params = []): array
    {
        $query = http_build_query(array_filter($params, fn($v) => $v !== null));
        $res = $this->request('GET', "/v1/jobs" . ($query ? "?$query" : ''));
        return json_decode($res, true)['jobs'] ?? [];
    }

    /**
     * Download the ZIP result of a completed batch or sitemap job.
     *
     * @param  string $jobId UUID of the job.
     * @return string        ZIP binary data.
     */
    public function downloadJob(string $jobId): string
    {
        return $this->request('GET', "/v1/jobs/$jobId/download", null, true);
    }

    public function extract(string $url): array
    {
        $query = http_build_query(['url' => $url]);
        $res = $this->request('GET', "/v1/extract?$query");
        return json_decode($res, true) ?? [];
    }

    // ── Private ───────────────────────────────────────────────────────────────

    private function getBinary(string $path, array $params): string
    {
        $clean = array_filter($params, fn($v) => $v !== null);
        $query = http_build_query($clean);
        return $this->request('GET', "$path?$query", null, true);
    }

    private function postBinary(string $path, array $body): string
    {
        return $this->request('POST', $path, $body, true);
    }

    private function request(string $method, string $path, ?array $body = null, bool $binary = false): string
    {
        $ch = curl_init($this->baseUrl . $path);
        if ($ch === false) {
            throw new SnapSharpException('Failed to initialise cURL');
        }

        $headers = [
            "Authorization: Bearer {$this->apiKey}",
            "User-Agent: snapsharp-php/1.0.0",
        ];

        if ($body !== null) {
            $headers[] = "Content-Type: application/json";
            curl_setopt($ch, CURLOPT_POSTFIELDS, (string) json_encode($body));
        }

        $responseHeaders = [];
        curl_setopt_array($ch, [
            CURLOPT_CUSTOMREQUEST  => $method,
            CURLOPT_HTTPHEADER     => $headers,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => $this->timeout,
            CURLOPT_HEADERFUNCTION => function ($ch, $header) use (&$responseHeaders) {
                $parts = explode(':', $header, 2);
                if (count($parts) === 2) {
                    $responseHeaders[strtolower(trim($parts[0]))] = trim($parts[1]);
                }
                return strlen($header);
            },
        ]);

        $response   = (string) curl_exec($ch);
        $statusCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError  = curl_error($ch);
        curl_close($ch);

        if ($curlError !== '') {
            throw new SnapSharpException("cURL error: $curlError");
        }

        if ($statusCode >= 400) {
            $this->handleError($statusCode, $response, $responseHeaders);
        }

        return $response;
    }

    private function handleError(int $status, string $body, array $headers = []): never
    {
        $data = json_decode($body, true) ?? [];
        $msg  = $data['message'] ?? $data['error'] ?? "HTTP $status";

        match ($status) {
            401     => throw new AuthException($msg),
            429     => throw new RateLimitException($msg, (int) ($headers['retry-after'] ?? 30)),
            504     => throw new TimeoutException($msg),
            default => throw new SnapSharpException($msg, $status),
        };
    }
}

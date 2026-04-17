// Package snapsharp provides the official Go client for the SnapSharp API.
package snapsharp

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"time"
)

const (
	defaultBaseURL = "https://api.snapsharp.dev"
	sdkVersion     = "1.0.0"
)

// Client is the SnapSharp API client.
type Client struct {
	APIKey  string
	BaseURL string
	HTTP    *http.Client
}

// New creates a new SnapSharp client with the given API key.
//
// Example:
//
//	client := snapsharp.New("sk_live_your_api_key")
//	data, err := client.Screenshot("https://example.com", nil)
func New(apiKey string) *Client {
	return &Client{
		APIKey:  apiKey,
		BaseURL: defaultBaseURL,
		HTTP:    &http.Client{Timeout: 30 * time.Second},
	}
}

// Screenshot captures a URL and returns the image bytes.
//
// Example:
//
//	data, err := client.Screenshot("https://example.com", &snapsharp.ScreenshotParams{
//	    Width: 1920, Height: 1080, Format: "webp", FullPage: true,
//	})
func (c *Client) Screenshot(targetURL string, params *ScreenshotParams) ([]byte, error) {
	if params == nil {
		params = &ScreenshotParams{}
	}

	q := url.Values{}
	q.Set("url", targetURL)
	if params.Width > 0 { q.Set("width", strconv.Itoa(params.Width)) }
	if params.Height > 0 { q.Set("height", strconv.Itoa(params.Height)) }
	if params.Format != "" { q.Set("format", params.Format) }
	if params.Quality > 0 { q.Set("quality", strconv.Itoa(params.Quality)) }
	if params.FullPage { q.Set("full_page", "true") }
	if params.Retina { q.Set("retina", "true") }
	if params.DarkMode { q.Set("dark_mode", "true") }
	if params.BlockAds { q.Set("block_ads", "true") }
	if params.Stealth { q.Set("stealth", "true") }
	if params.BypassCSP { q.Set("bypass_csp", "true") }
	if params.Device != "" { q.Set("device", params.Device) }
	if params.Delay > 0 { q.Set("delay", strconv.Itoa(params.Delay)) }
	if params.WaitFor != "" { q.Set("wait_for", params.WaitFor) }
	if params.WaitUntil != "" { q.Set("wait_until", params.WaitUntil) }
	if params.HideSelectors != "" { q.Set("hide_selectors", params.HideSelectors) }
	if params.Click != "" { q.Set("click", params.Click) }
	if params.UserAgent != "" { q.Set("user_agent", params.UserAgent) }
	if params.Proxy != "" { q.Set("proxy", params.Proxy) }
	if params.Cache { q.Set("cache", "true") }
	if params.CacheTTL > 0 { q.Set("cache_ttl", strconv.Itoa(params.CacheTTL)) }
	if params.Country != "" { q.Set("country", params.Country) }
	if params.CSS != "" { q.Set("css", params.CSS) }
	if params.JS != "" { q.Set("js", params.JS) }

	if params.Headers != nil || params.Cookies != nil || params.Clip != nil {
		body := map[string]interface{}{}
		for k, vs := range q {
			if len(vs) > 0 {
				body[k] = vs[0]
			}
		}
		if params.Headers != nil { body["headers"] = params.Headers }
		if params.Cookies != nil { body["cookies"] = params.Cookies }
		if params.Clip != nil { body["clip"] = params.Clip }
		return c.postBinary("/v1/screenshot", body)
	}
	return c.getBinary("/v1/screenshot?" + q.Encode())
}

// OgImage generates an OG image from a template and returns the image bytes.
//
// Example:
//
//	data, err := client.OgImage("blog-post", map[string]string{
//	    "title":  "My Article",
//	    "author": "Jane Doe",
//	}, nil)
func (c *Client) OgImage(template string, data map[string]string, opts *ImageOptions) ([]byte, error) {
	body := map[string]interface{}{
		"template": template,
		"data":     data,
	}
	if opts != nil {
		if opts.Width > 0 { body["width"] = opts.Width }
		if opts.Height > 0 { body["height"] = opts.Height }
		if opts.Format != "" { body["format"] = opts.Format }
		if opts.Quality > 0 { body["quality"] = opts.Quality }
	}
	return c.postBinary("/v1/og-image", body)
}

// HtmlToImage renders HTML/CSS to an image and returns the image bytes.
//
// Example:
//
//	data, err := client.HtmlToImage(`<div style="padding:40px;color:white">Hello</div>`, &snapsharp.ImageOptions{
//	    Width: 1200, Height: 630,
//	})
func (c *Client) HtmlToImage(html string, opts *ImageOptions) ([]byte, error) {
	body := map[string]interface{}{"html": html}
	if opts != nil {
		if opts.Width > 0 { body["width"] = opts.Width }
		if opts.Height > 0 { body["height"] = opts.Height }
		if opts.Format != "" { body["format"] = opts.Format }
		if opts.Quality > 0 { body["quality"] = opts.Quality }
	}
	return c.postBinary("/v1/html-to-image", body)
}

// Templates lists the available OG image templates.
func (c *Client) Templates() ([]Template, error) {
	res, err := c.request("GET", "/v1/templates", nil)
	if err != nil { return nil, err }
	defer res.Body.Close()

	var result struct {
		Templates []Template `json:"templates"`
	}
	if err := json.NewDecoder(res.Body).Decode(&result); err != nil {
		return nil, err
	}
	return result.Templates, nil
}

// Usage returns the current API usage statistics.
func (c *Client) Usage() (*UsageResponse, error) {
	res, err := c.request("GET", "/v1/usage", nil)
	if err != nil { return nil, err }
	defer res.Body.Close()

	var usage UsageResponse
	if err := json.NewDecoder(res.Body).Decode(&usage); err != nil {
		return nil, err
	}
	return &usage, nil
}

// SiteAudit extracts design tokens from a website.
// Returns raw JSON bytes for "json" format, or binary image/PDF data for "png"/"pdf".
func (c *Client) SiteAudit(targetURL string, params *SiteAuditParams) ([]byte, error) {
	body := map[string]interface{}{"url": targetURL}
	if params != nil {
		if params.Format != "" { body["format"] = params.Format }
		if params.IncludeScreenshot { body["include_screenshot"] = true }
		if params.Width > 0 { body["width"] = params.Width }
		if params.Sections != nil { body["sections"] = params.Sections }
	}
	res, err := c.request("POST", "/v1/site-audit", body)
	if err != nil { return nil, err }
	defer res.Body.Close()
	return io.ReadAll(res.Body)
}

// Extract extracts page metadata (OG tags, title, favicons) from a URL.
// Video records a webpage as MP4, WebM, or GIF.
func (c *Client) Video(targetURL string, params *VideoParams) ([]byte, error) {
	body := map[string]interface{}{"url": targetURL}
	if params != nil {
		if params.Format != "" { body["format"] = params.Format }
		if params.Duration > 0 { body["duration"] = params.Duration }
		if params.Width > 0 { body["width"] = params.Width }
		if params.Height > 0 { body["height"] = params.Height }
		if params.FPS > 0 { body["fps"] = params.FPS }
		if params.Scroll { body["scroll"] = true }
		if params.ScrollSpeed > 0 { body["scroll_speed"] = params.ScrollSpeed }
		if params.DarkMode { body["dark_mode"] = true }
		if params.BlockAds { body["block_ads"] = true }
		if params.Stealth { body["stealth"] = true }
		if params.Delay > 0 { body["delay"] = params.Delay }
		if params.WaitUntil != "" { body["wait_until"] = params.WaitUntil }
		if params.HideSelectors != "" { body["hide_selectors"] = params.HideSelectors }
		if params.Country != "" { body["country"] = params.Country }
	}
	return c.postBinary("/v1/video", body)
}

// Scroll records an auto-scrolling page as GIF or MP4.
func (c *Client) Scroll(targetURL string, params *VideoParams) ([]byte, error) {
	q := url.Values{}
	q.Set("url", targetURL)
	if params != nil {
		if params.Format != "" { q.Set("format", params.Format) }
		if params.Duration > 0 { q.Set("duration", strconv.Itoa(params.Duration)) }
		if params.Width > 0 { q.Set("width", strconv.Itoa(params.Width)) }
		if params.Height > 0 { q.Set("height", strconv.Itoa(params.Height)) }
		if params.ScrollSpeed > 0 { q.Set("scroll_speed", fmt.Sprintf("%g", params.ScrollSpeed)) }
		if params.DarkMode { q.Set("dark_mode", "true") }
		if params.BlockAds { q.Set("block_ads", "true") }
		if params.Stealth { q.Set("stealth", "true") }
	}
	return c.getBinary("/v1/scroll?" + q.Encode())
}

// PDF generates a PDF from a built-in template or custom HTML.
func (c *Client) PDF(params *PdfParams) ([]byte, error) {
	return c.postBinary("/v1/pdf", params)
}

// PDFTemplates lists available built-in PDF templates.
func (c *Client) PDFTemplates() ([]PdfTemplateInfo, error) {
	res, err := c.request("GET", "/v1/pdf/templates", nil)
	if err != nil { return nil, err }
	defer res.Body.Close()
	var result struct {
		Templates []PdfTemplateInfo `json:"templates"`
	}
	if err := json.NewDecoder(res.Body).Decode(&result); err != nil {
		return nil, err
	}
	return result.Templates, nil
}

func (c *Client) Extract(targetURL string) (*ExtractResponse, error) {
	q := url.Values{}
	q.Set("url", targetURL)
	res, err := c.request("GET", "/v1/extract?"+q.Encode(), nil)
	if err != nil { return nil, err }
	defer res.Body.Close()
	var result ExtractResponse
	if err := json.NewDecoder(res.Body).Decode(&result); err != nil {
		return nil, err
	}
	return &result, nil
}

// Batch starts an async batch screenshot job.
func (c *Client) Batch(urls []string, params *BatchParams) (*JobResponse, error) {
	type body struct {
		URLs   []string     `json:"urls"`
		Params *BatchParams `json:",omitempty"`
	}
	reqBody := map[string]interface{}{"urls": urls}
	if params != nil {
		reqBody["format"] = params.Format
		reqBody["width"] = params.Width
		reqBody["height"] = params.Height
		reqBody["quality"] = params.Quality
		reqBody["full_page"] = params.FullPage
		reqBody["dark_mode"] = params.DarkMode
		reqBody["block_ads"] = params.BlockAds
		reqBody["stealth"] = params.Stealth
		if params.Device != "" { reqBody["device"] = params.Device }
		if params.CallbackURL != "" { reqBody["callback_url"] = params.CallbackURL }
	}
	res, err := c.request("POST", "/v1/batch", reqBody)
	if err != nil { return nil, err }
	defer res.Body.Close()
	var result JobResponse
	if err := json.NewDecoder(res.Body).Decode(&result); err != nil { return nil, err }
	return &result, nil
}

// Sitemap starts an async sitemap crawl job.
func (c *Client) Sitemap(sitemapURL string, params *SitemapParams) (*JobResponse, error) {
	reqBody := map[string]interface{}{"sitemap_url": sitemapURL}
	if params != nil {
		if params.MaxPages > 0 { reqBody["max_pages"] = params.MaxPages }
		if params.IncludePattern != "" { reqBody["include_pattern"] = params.IncludePattern }
		if params.ExcludePattern != "" { reqBody["exclude_pattern"] = params.ExcludePattern }
		if params.Format != "" { reqBody["format"] = params.Format }
		if params.Width > 0 { reqBody["width"] = params.Width }
		if params.Height > 0 { reqBody["height"] = params.Height }
		reqBody["full_page"] = params.FullPage
		reqBody["dark_mode"] = params.DarkMode
		if params.CallbackURL != "" { reqBody["callback_url"] = params.CallbackURL }
	}
	res, err := c.request("POST", "/v1/sitemap", reqBody)
	if err != nil { return nil, err }
	defer res.Body.Close()
	var result JobResponse
	if err := json.NewDecoder(res.Body).Decode(&result); err != nil { return nil, err }
	return &result, nil
}

// GetJob polls the status of an async job.
func (c *Client) GetJob(jobID string) (*JobResponse, error) {
	res, err := c.request("GET", "/v1/jobs/"+jobID, nil)
	if err != nil { return nil, err }
	defer res.Body.Close()
	var result JobResponse
	if err := json.NewDecoder(res.Body).Decode(&result); err != nil { return nil, err }
	return &result, nil
}

// ListJobs returns a paginated list of the user's async jobs.
func (c *Client) ListJobs(status string, limit, offset int) ([]JobResponse, error) {
	q := url.Values{}
	if status != "" { q.Set("status", status) }
	if limit > 0 { q.Set("limit", strconv.Itoa(limit)) }
	if offset > 0 { q.Set("offset", strconv.Itoa(offset)) }
	path := "/v1/jobs"
	if len(q) > 0 { path += "?" + q.Encode() }

	res, err := c.request("GET", path, nil)
	if err != nil { return nil, err }
	defer res.Body.Close()
	var result struct {
		Jobs []JobResponse `json:"jobs"`
	}
	if err := json.NewDecoder(res.Body).Decode(&result); err != nil { return nil, err }
	return result.Jobs, nil
}

// DownloadJob downloads the ZIP result of a completed batch or sitemap job.
func (c *Client) DownloadJob(jobID string) ([]byte, error) {
	return c.getBinary("/v1/jobs/" + jobID + "/download")
}

// ── Private helpers ────────────────────────────────────────────────────────

func (c *Client) getBinary(path string) ([]byte, error) {
	res, err := c.request("GET", path, nil)
	if err != nil { return nil, err }
	defer res.Body.Close()
	return io.ReadAll(res.Body)
}

func (c *Client) postBinary(path string, body interface{}) ([]byte, error) {
	res, err := c.request("POST", path, body)
	if err != nil { return nil, err }
	defer res.Body.Close()
	return io.ReadAll(res.Body)
}

func (c *Client) request(method, path string, body interface{}) (*http.Response, error) {
	var bodyReader io.Reader
	if body != nil {
		jsonBytes, err := json.Marshal(body)
		if err != nil { return nil, err }
		bodyReader = bytes.NewReader(jsonBytes)
	}

	req, err := http.NewRequest(method, c.BaseURL+path, bodyReader)
	if err != nil { return nil, err }

	req.Header.Set("Authorization", "Bearer "+c.APIKey)
	req.Header.Set("User-Agent", "snapsharp-go/"+sdkVersion)
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	res, err := c.HTTP.Do(req)
	if err != nil { return nil, err }

	if res.StatusCode >= 400 {
		defer res.Body.Close()
		errBody, _ := io.ReadAll(res.Body)

		var errData struct {
			Message string `json:"message"`
			Error   string `json:"error"`
		}
		_ = json.Unmarshal(errBody, &errData)

		msg := errData.Message
		if msg == "" { msg = errData.Error }
		if msg == "" { msg = fmt.Sprintf("HTTP %d", res.StatusCode) }

		switch res.StatusCode {
		case 401:
			return nil, &AuthError{Message: msg}
		case 429:
			retryAfter := 30
			if ra := res.Header.Get("Retry-After"); ra != "" {
				if n, err := strconv.Atoi(ra); err == nil {
					retryAfter = n
				}
			}
			return nil, &RateLimitError{Message: msg, RetryAfter: retryAfter}
		case 504:
			return nil, &TimeoutError{Message: msg}
		default:
			return nil, &APIError{Message: msg, Status: res.StatusCode}
		}
	}

	return res, nil
}

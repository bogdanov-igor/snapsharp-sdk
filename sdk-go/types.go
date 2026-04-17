package snapsharp

// ScreenshotParams holds optional parameters for the Screenshot method.
type ScreenshotParams struct {
	Width          int
	Height         int
	Format         string // "png" | "jpeg" | "webp" | "pdf"
	Quality        int
	FullPage       bool
	Retina         bool
	Delay          int
	WaitFor        string
	WaitUntil      string // "load" | "domcontentloaded" | "networkidle"
	HideSelectors  string
	Click          string
	DarkMode       bool
	BlockAds       bool
	Stealth        bool
	Device         string
	UserAgent      string
	Proxy          string
	Country        string
	CSS            string
	JS             string
	Headers        map[string]string
	Cookies        []Cookie
	Clip           *Clip
	BypassCSP      bool
	Cache          bool
	CacheTTL       int
}

// ImageOptions holds common image options for OG image and HTML-to-image methods.
type ImageOptions struct {
	Width   int
	Height  int
	Format  string // "png" | "jpeg" | "webp"
	Quality int
}

// Template represents an OG image template.
type Template struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	PreviewURL  string   `json:"preview_url"`
	Variables   []string `json:"variables"`
}

// UsageResponse holds API usage statistics.
type UsageResponse struct {
	Plan   string `json:"plan"`
	Period struct {
		Start string `json:"start"`
		End   string `json:"end"`
	} `json:"period"`
	Usage struct {
		Requests   int     `json:"requests"`
		Limit      int     `json:"limit"`
		Remaining  int     `json:"remaining"`
		Percentage float64 `json:"percentage"`
	} `json:"usage"`
	Breakdown struct {
		Screenshot   int `json:"screenshot"`
		OgImage      int `json:"og_image"`
		HtmlToImage  int `json:"html_to_image"`
		SiteAudit    int `json:"site_audit"`
		Extract      int `json:"extract"`
	} `json:"breakdown"`
	CacheHitRate      float64 `json:"cache_hit_rate"`
	AvgResponseTimeMs float64 `json:"avg_response_time_ms"`
}

// Cookie represents a browser cookie for screenshot requests.
type Cookie struct {
	Name   string `json:"name"`
	Value  string `json:"value"`
	Domain string `json:"domain"`
	Path   string `json:"path,omitempty"`
}

// Clip specifies a rectangular area to crop the screenshot to.
type Clip struct {
	X      int `json:"x"`
	Y      int `json:"y"`
	Width  int `json:"width"`
	Height int `json:"height"`
}

// SiteAuditParams holds optional parameters for the SiteAudit method.
type SiteAuditParams struct {
	Format            string   // "json", "png", "pdf"
	IncludeScreenshot bool
	Width             int
	Sections          []string // e.g. ["colors", "fonts", "headings", "stack", "accessibility"]
}

// VideoParams holds optional parameters for the Video and Scroll methods.
type VideoParams struct {
	Format        string  // "mp4" | "webm" | "gif"
	Duration      int     // Recording duration in seconds
	Width         int
	Height        int
	FPS           int
	Scroll        bool
	ScrollSpeed   float64
	DarkMode      bool
	BlockAds      bool
	Stealth       bool
	Delay         int
	WaitUntil     string // "load" | "domcontentloaded" | "networkidle"
	HideSelectors string
	Proxy         string
	Country       string // "US" | "GB" | "DE" | "JP"
}

// PdfMargin holds page margin values.
type PdfMargin struct {
	Top    string `json:"top,omitempty"`
	Right  string `json:"right,omitempty"`
	Bottom string `json:"bottom,omitempty"`
	Left   string `json:"left,omitempty"`
}

// PdfParams holds parameters for the PDF method.
type PdfParams struct {
	Template   string                 `json:"template,omitempty"`
	Data       map[string]interface{} `json:"data,omitempty"`
	HTML       string                 `json:"html,omitempty"`
	Format     string                 `json:"format,omitempty"` // "A4" | "A3" | "Letter" | "Legal"
	Landscape  bool                   `json:"landscape,omitempty"`
	Margin     *PdfMargin             `json:"margin,omitempty"`
	HeaderHTML string                 `json:"header_html,omitempty"`
	FooterHTML string                 `json:"footer_html,omitempty"`
}

// PdfTemplateInfo holds info about a built-in PDF template.
type PdfTemplateInfo struct {
	ID        string   `json:"id"`
	Name      string   `json:"name"`
	Variables []string `json:"variables"`
}

// BatchParams holds parameters for the Batch method.
type BatchParams struct {
	Format      string `json:"format,omitempty"`
	Width       int    `json:"width,omitempty"`
	Height      int    `json:"height,omitempty"`
	Quality     int    `json:"quality,omitempty"`
	FullPage    bool   `json:"full_page,omitempty"`
	DarkMode    bool   `json:"dark_mode,omitempty"`
	BlockAds    bool   `json:"block_ads,omitempty"`
	Stealth     bool   `json:"stealth,omitempty"`
	Device      string `json:"device,omitempty"`
	CallbackURL string `json:"callback_url,omitempty"`
}

// SitemapParams holds parameters for the Sitemap method.
type SitemapParams struct {
	IncludePattern string `json:"include_pattern,omitempty"`
	ExcludePattern string `json:"exclude_pattern,omitempty"`
	MaxPages       int    `json:"max_pages,omitempty"`
	Format         string `json:"format,omitempty"`
	Width          int    `json:"width,omitempty"`
	Height         int    `json:"height,omitempty"`
	Quality        int    `json:"quality,omitempty"`
	FullPage       bool   `json:"full_page,omitempty"`
	DarkMode       bool   `json:"dark_mode,omitempty"`
	BlockAds       bool   `json:"block_ads,omitempty"`
	Stealth        bool   `json:"stealth,omitempty"`
	CallbackURL    string `json:"callback_url,omitempty"`
}

// JobProgress holds progress information for an async job.
type JobProgress struct {
	Total      int `json:"total"`
	Completed  int `json:"completed"`
	Failed     int `json:"failed"`
	Percentage int `json:"percentage"`
}

// JobResponse holds the result of a batch or sitemap job creation/poll.
type JobResponse struct {
	ID          string       `json:"id"`
	Type        string       `json:"type"`
	Status      string       `json:"status"`
	Progress    *JobProgress `json:"progress,omitempty"`
	TotalURLs   int          `json:"total_urls,omitempty"`
	PollURL     string       `json:"poll_url,omitempty"`
	DownloadURL string       `json:"download_url,omitempty"`
	ResultURL   *string      `json:"result_url,omitempty"`
	ExpiresAt   *string      `json:"expires_at,omitempty"`
	Error       *string      `json:"error,omitempty"`
	CreatedAt   string       `json:"created_at,omitempty"`
	StartedAt   *string      `json:"started_at,omitempty"`
	CompletedAt *string      `json:"completed_at,omitempty"`
}

// ExtractResponse holds the page metadata returned by the Extract method.
type ExtractResponse struct {
	URL           string    `json:"url"`
	Title         *string   `json:"title"`
	Description   *string   `json:"description"`
	Image         *string   `json:"image"`
	SiteName      *string   `json:"siteName"`
	OGTitle       *string   `json:"og:title"`
	OGDescription *string   `json:"og:description"`
	OGImage       *string   `json:"og:image"`
	OGURL         *string   `json:"og:url"`
	TwitterCard   *string   `json:"twitter:card"`
	Favicons      []Favicon `json:"favicons"`
}

// Favicon represents a favicon found on the page.
type Favicon struct {
	URL  string `json:"url"`
	Size string `json:"size,omitempty"`
	Type string `json:"type"`
}

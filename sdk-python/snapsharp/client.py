import re
import httpx
from typing import Optional, Dict, List, Any

from .errors import SnapSharpError, AuthError, RateLimitError
from .errors import TimeoutError as SSTimeoutError

DEFAULT_BASE_URL = "https://api.snapsharp.dev"
DEFAULT_TIMEOUT = 30.0


class SnapSharp:
    """Official Python SDK for SnapSharp Screenshot & OG Image API.

    Usage::

        snap = SnapSharp("sk_live_your_api_key")

        # Screenshot
        image = snap.screenshot("https://example.com", width=1920, format="webp")
        with open("screenshot.webp", "wb") as f:
            f.write(image)

        # OG Image
        og = snap.og_image("blog-post", {"title": "Hello", "author": "Jane"})

        # HTML to Image
        card = snap.html_to_image('<div style="color:white">Hello</div>', width=800)

        # Context manager
        with SnapSharp("sk_live_...") as snap:
            image = snap.screenshot("https://example.com")
    """

    def __init__(
        self,
        api_key: str,
        *,
        base_url: str = DEFAULT_BASE_URL,
        timeout: float = DEFAULT_TIMEOUT,
    ):
        if not api_key:
            raise ValueError("API key is required")
        self._api_key = api_key
        self._base_url = base_url.rstrip("/")
        self._client = httpx.Client(
            base_url=self._base_url,
            timeout=timeout,
            headers={
                "Authorization": f"Bearer {api_key}",
                "User-Agent": "snapsharp-python/1.0.0",
            },
        )

    def screenshot(self, url: str, **kwargs: Any) -> bytes:
        """Take a screenshot of a URL. Returns image bytes.

        Args:
            url: The URL to screenshot.
            width: Viewport width (default 1280).
            height: Viewport height (default 720).
            format: Image format — ``png``, ``jpeg``, ``webp``, or ``pdf`` (PDF requires Growth+).
            quality: Image quality 1-100 (jpeg/webp only).
            full_page: Capture the full scrollable page.
            dark_mode: Enable dark mode.
            block_ads: Block ads and trackers.
            device: Device preset, e.g. ``"iPhone 14"``.
            delay: Delay in ms before capturing.
            stealth: Enable stealth mode (Growth+ plan).
            proxy: Proxy URL (Growth+ plan).

        Returns:
            Raw image bytes.
        """
        params = {"url": url, **kwargs}
        api_params = {self._to_snake(k): v for k, v in params.items()}
        has_complex = any(k in kwargs for k in ("headers", "cookies", "css", "js"))
        if has_complex:
            return self._post_binary("/v1/screenshot", json=api_params)
        return self._get_binary("/v1/screenshot", params=api_params)

    def og_image(self, template: str, data: Dict[str, str], **kwargs: Any) -> bytes:
        """Generate an OG image from a template. Returns image bytes."""
        body = {"template": template, "data": data, **kwargs}
        return self._post_binary("/v1/og-image", json=body)

    def html_to_image(self, html: str, **kwargs: Any) -> bytes:
        """Render HTML to an image. Returns image bytes."""
        body = {"html": html, **kwargs}
        return self._post_binary("/v1/html-to-image", json=body)

    def templates(self) -> List[Dict[str, Any]]:
        """List available OG image templates."""
        res = self._client.get("/v1/templates")
        self._handle_response(res)
        return res.json()["templates"]

    def usage(self) -> Dict[str, Any]:
        """Get current usage statistics."""
        res = self._client.get("/v1/usage")
        self._handle_response(res)
        return res.json()

    def health(self) -> Dict[str, Any]:
        """Check API health (no auth required)."""
        res = httpx.get(f"{self._base_url}/health", timeout=5.0)
        return res.json()

    def site_audit(self, url: str, **kwargs: Any) -> Any:
        """Extract design tokens from a website.

        Args:
            url: The URL to audit.
            format: Output format — ``json``, ``png``, or ``pdf`` (default ``json``).
            include_screenshot: Include base64 screenshot (default True).
            width: Viewport width (default 1280).
            sections: List of sections to include (colors, fonts, headings, stack, accessibility).

        Returns:
            Dict for JSON format, bytes for PNG/PDF.
        """
        body = {"url": url, **kwargs}
        fmt = kwargs.get("format", "json")
        if fmt in ("png", "pdf"):
            return self._post_binary("/v1/site-audit", json=body)
        res = self._client.post("/v1/site-audit", json=body)
        self._handle_response(res)
        return res.json()

    def video(self, url: str, **kwargs: Any) -> bytes:
        """Record a webpage as MP4, WebM, or GIF. Returns video bytes.

        Args:
            url: The URL to record.
            format: Output format — ``mp4``, ``webm``, or ``gif`` (default ``mp4``).
            duration: Recording duration in seconds (default 5, max depends on plan).
            width: Viewport width (default 1280).
            height: Viewport height (default 720).
            fps: Frames per second (default 24).
            scroll: Enable auto-scroll during recording (default False).
            scroll_speed: Pixels per frame when scrolling (default 3).
            dark_mode: Enable dark mode emulation.
            block_ads: Block ads and cookie banners.
            stealth: Enable stealth mode.

        Returns:
            Raw video/GIF bytes.
        """
        body = {"url": url, **kwargs}
        return self._post_binary("/v1/video", json=body)

    def scroll(self, url: str, **kwargs: Any) -> bytes:
        """Record an auto-scrolling page as GIF or MP4. Returns video bytes.

        Args:
            url: The URL to record.
            format: Output format — ``gif``, ``mp4``, or ``webm`` (default ``gif``).
            duration: Recording duration in seconds (default 5).
            scroll_speed: Scroll speed 1-10 (default 3).

        Returns:
            Raw video/GIF bytes.
        """
        params = {"url": url, **kwargs}
        return self._get_binary("/v1/scroll", params=params)

    def pdf(self, *, template: Optional[str] = None, data: Optional[Dict[str, Any]] = None, html: Optional[str] = None, **kwargs: Any) -> bytes:
        """Generate a PDF from a template or custom HTML. Returns PDF bytes.

        Args:
            template: Built-in template ID (invoice, certificate, report, receipt, letter).
            data: Template variables as a dict.
            html: Custom HTML to render as PDF (alternative to template).
            format: Page format — A4, A3, Letter, Legal (default A4).
            landscape: Landscape orientation (default False).
            margin: Dict with top, right, bottom, left values (e.g. ``"20mm"``).
            header_html: HTML for page header.
            footer_html: HTML for page footer (supports pageNumber/totalPages classes).

        Returns:
            Raw PDF bytes.
        """
        body: Dict[str, Any] = {**kwargs}
        if template:
            body["template"] = template
        if data is not None:
            body["data"] = data
        if html:
            body["html"] = html
        return self._post_binary("/v1/pdf", json=body)

    def pdf_templates(self) -> List[Dict[str, Any]]:
        """List available built-in PDF templates."""
        res = httpx.get(f"{self._base_url}/v1/pdf/templates", timeout=10.0)
        res.raise_for_status()
        return res.json()["templates"]

    def batch(self, urls: List[str], **kwargs: Any) -> Dict[str, Any]:
        """Start an async batch screenshot job.

        Args:
            urls: List of URLs to screenshot.
            **kwargs: format, width, height, full_page, dark_mode, block_ads, stealth,
                      device, callback_url.

        Returns:
            Dict with job_id, status, poll_url, download_url, expires_at.
        """
        body: Dict[str, Any] = {"urls": urls, **kwargs}
        res = self._client.post("/v1/batch", json=body)
        self._handle_response(res)
        return res.json()

    def sitemap(self, sitemap_url: str, **kwargs: Any) -> Dict[str, Any]:
        """Start an async sitemap crawl job.

        Args:
            sitemap_url: URL of the sitemap.xml.
            **kwargs: max_pages, include_pattern, exclude_pattern, format, width, height,
                      full_page, dark_mode, block_ads, stealth, callback_url.

        Returns:
            Dict with job_id, status, poll_url, download_url, expires_at.
        """
        body: Dict[str, Any] = {"sitemap_url": sitemap_url, **kwargs}
        res = self._client.post("/v1/sitemap", json=body)
        self._handle_response(res)
        return res.json()

    def get_job(self, job_id: str) -> Dict[str, Any]:
        """Poll the status of an async job.

        Args:
            job_id: The UUID of the job.

        Returns:
            Dict with id, type, status, progress, result_url, download_url.
        """
        res = self._client.get(f"/v1/jobs/{job_id}")
        self._handle_response(res)
        return res.json()

    def list_jobs(
        self,
        status: Optional[str] = None,
        limit: int = 20,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        """List the authenticated user's async jobs.

        Returns:
            List of job dicts.
        """
        params: Dict[str, Any] = {"limit": limit, "offset": offset}
        if status:
            params["status"] = status
        res = self._client.get("/v1/jobs", params=params)
        self._handle_response(res)
        return res.json().get("jobs", [])

    def download_job(self, job_id: str) -> bytes:
        """Download the ZIP result of a completed batch or sitemap job.

        Args:
            job_id: The UUID of the job.

        Returns:
            ZIP file bytes.
        """
        res = self._client.get(f"/v1/jobs/{job_id}/download")
        self._handle_response(res)
        return res.content

    def extract(self, url: str) -> Dict[str, Any]:
        """Extract page metadata (OG tags, title, favicons) from a URL.

        Args:
            url: The URL to extract metadata from.

        Returns:
            Dict with title, description, og tags, favicons, etc.
        """
        res = self._client.get("/v1/extract", params={"url": url})
        self._handle_response(res)
        return res.json()

    def close(self) -> None:
        """Close the underlying HTTP client."""
        self._client.close()

    def __enter__(self) -> "SnapSharp":
        return self

    def __exit__(self, *args: Any) -> None:
        self.close()

    # ── Private ───────────────────────────────────────────────────────────────

    def _get_binary(self, path: str, params: dict) -> bytes:
        clean = {k: v for k, v in params.items() if v is not None}
        res = self._client.get(path, params=clean)
        self._handle_response(res)
        return res.content

    def _post_binary(self, path: str, json: dict) -> bytes:
        res = self._client.post(path, json=json)
        self._handle_response(res)
        return res.content

    def _handle_response(self, res: httpx.Response) -> None:
        if res.is_success:
            return
        try:
            body = res.json()
        except Exception:
            body = {}
        msg = body.get("message") or body.get("error") or f"HTTP {res.status_code}"
        if res.status_code == 401:
            raise AuthError(msg)
        if res.status_code == 429:
            retry = int(res.headers.get("Retry-After", "30"))
            raise RateLimitError(msg, retry)
        if res.status_code == 504:
            raise SSTimeoutError(msg)
        raise SnapSharpError(msg, res.status_code)

    @staticmethod
    def _to_snake(name: str) -> str:
        return re.sub(r"(?<=[a-z0-9])([A-Z])", r"_\1", name).lower()

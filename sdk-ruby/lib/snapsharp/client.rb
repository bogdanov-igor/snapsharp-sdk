require "net/http"
require "json"
require "uri"

require_relative "errors"

module SnapSharp
  class Client
    BASE_URL = "https://api.snapsharp.dev"

    # Creates a new SnapSharp client.
    #
    # @param api_key  [String]  Your SnapSharp API key.
    # @param base_url [String]  Override the API base URL (optional).
    # @param timeout  [Integer] Request timeout in seconds (default: 30).
    def initialize(api_key, base_url: BASE_URL, timeout: 30)
      raise ArgumentError, "API key is required" if api_key.nil? || api_key.empty?

      @api_key  = api_key
      @base_url = base_url.chomp("/")
      @timeout  = timeout
    end

    # Take a screenshot. Returns image bytes (String in binary encoding).
    #
    # @param url    [String] The URL to screenshot.
    # @param params [Hash]   Optional parameters (width:, height:, format: [png|jpeg|webp|pdf], etc.)
    # @return [String] Binary image/PDF data.
    def screenshot(url, **params)
      params[:url] = url
      has_complex = %i[headers cookies css js].any? { |k| params.key?(k) }
      if has_complex
        post_binary("/v1/screenshot", params)
      else
        get_binary("/v1/screenshot", params)
      end
    end

    # Generate an OG image. Returns image bytes.
    #
    # @param template [String] Template ID.
    # @param data     [Hash]   Template variables.
    # @param options  [Hash]   Optional: width:, height:, format:, quality:.
    # @return [String] Binary image data.
    def og_image(template, data, **options)
      body = { template: template, data: data }.merge(options)
      post_binary("/v1/og-image", body)
    end

    # Render HTML to an image. Returns image bytes.
    #
    # @param html    [String] HTML string.
    # @param options [Hash]   Optional: width:, height:, format:, quality:.
    # @return [String] Binary image data.
    def html_to_image(html, **options)
      body = { html: html }.merge(options)
      post_binary("/v1/html-to-image", body)
    end

    # List available OG image templates.
    #
    # @return [Array<Hash>]
    def templates
      res = request(:get, "/v1/templates")
      JSON.parse(res.body)["templates"]
    end

    # Get current usage statistics.
    #
    # @return [Hash]
    def usage
      res = request(:get, "/v1/usage")
      JSON.parse(res.body)
    end

    # Check API health (no auth required).
    #
    # @return [Hash]
    def health
      uri  = URI("#{@base_url}/health")
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl    = uri.scheme == "https"
      http.open_timeout = 5
      http.read_timeout = 5
      req = Net::HTTP::Get.new(uri)
      req["User-Agent"] = "snapsharp-ruby/#{SnapSharp::VERSION}"
      res = http.request(req)
      JSON.parse(res.body)
    end

    # Extract design tokens from a website.
    #
    # @param url     [String] The URL to audit.
    # @param params  [Hash]   Optional: format:, include_screenshot:, width:, sections:.
    # @return [Hash, String] Hash for JSON format, binary String for PNG/PDF.
    def site_audit(url, **params)
      body = { url: url }.merge(params)
      fmt = params.fetch(:format, "json")
      if %w[png pdf].include?(fmt.to_s)
        post_binary("/v1/site-audit", body)
      else
        res = request(:post, "/v1/site-audit", body)
        JSON.parse(res.body)
      end
    end

    # Record a webpage as video or GIF. Returns binary video data.
    #
    # @param url    [String] The URL to record.
    # @param params [Hash]   Optional: format: (mp4|webm|gif), duration:, width:, height:,
    #                        fps:, scroll:, scroll_speed:, dark_mode:, block_ads:, stealth:.
    # @return [String] Binary video data.
    def video(url, **params)
      body = { url: url }.merge(params)
      post_binary("/v1/video", body)
    end

    # Record an auto-scrolling page as GIF or MP4. Returns binary video data.
    #
    # @param url    [String] The URL to record.
    # @param params [Hash]   Optional: format: (gif|mp4|webm), duration:, scroll_speed:, width:, height:.
    # @return [String] Binary video data.
    def scroll(url, **params)
      params[:url] = url
      get_binary("/v1/scroll", params)
    end

    # Generate a PDF from a built-in template or custom HTML. Returns binary PDF data.
    #
    # @param params [Hash] Required: template: + data: OR html:
    #                      Optional: format: (A4|A3|Letter|Legal), landscape:, margin:,
    #                                header_html:, footer_html:.
    # @return [String] Binary PDF data.
    def pdf(**params)
      post_binary("/v1/pdf", params)
    end

    # List available built-in PDF templates.
    #
    # @return [Array<Hash>]
    def pdf_templates
      uri  = URI("#{@base_url}/v1/pdf/templates")
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = uri.scheme == "https"
      http.read_timeout = 10
      req = Net::HTTP::Get.new(uri)
      req["User-Agent"] = "snapsharp-ruby/#{SnapSharp::VERSION}"
      res = http.request(req)
      JSON.parse(res.body)["templates"]
    end

    # Extract page metadata (OG tags, title, favicons) from a URL.
    #
    # @param url [String] The URL to extract metadata from.
    # @return [Hash]
    # Start an async batch screenshot job.
    # @param urls [Array<String>] URLs to screenshot.
    # @param params [Hash] format, width, height, full_page, dark_mode, etc.
    # @return [Hash] job_id, status, poll_url, download_url, expires_at.
    def batch(urls, **params)
      body = { urls: urls }.merge(params)
      res  = request(:post, "/v1/batch", body)
      JSON.parse(res.body)
    end

    # Start an async sitemap crawl job.
    # @param sitemap_url [String] URL to sitemap.xml.
    # @param params [Hash] max_pages, include_pattern, exclude_pattern, format, etc.
    # @return [Hash] job_id, status, poll_url, download_url.
    def sitemap(sitemap_url, **params)
      body = { sitemap_url: sitemap_url }.merge(params)
      res  = request(:post, "/v1/sitemap", body)
      JSON.parse(res.body)
    end

    # Poll the status of an async job.
    # @param job_id [String] UUID of the job.
    # @return [Hash] Job status, progress, result_url.
    def get_job(job_id)
      res = request(:get, "/v1/jobs/#{job_id}")
      JSON.parse(res.body)
    end

    # List the user's async jobs.
    # @param status [String, nil] Filter by status.
    # @param limit [Integer] Max results.
    # @param offset [Integer] Pagination offset.
    # @return [Array<Hash>]
    def list_jobs(status: nil, limit: 20, offset: 0)
      params = { limit: limit, offset: offset }
      params[:status] = status if status
      query = URI.encode_www_form(params)
      res   = request(:get, "/v1/jobs?#{query}")
      JSON.parse(res.body)["jobs"] || []
    end

    # Download the ZIP result of a completed batch or sitemap job.
    # @param job_id [String] UUID of the job.
    # @return [String] ZIP binary data.
    def download_job(job_id)
      res = request(:get, "/v1/jobs/#{job_id}/download")
      res.body
    end

    def extract(url)
      res = request(:get, "/v1/extract?url=#{URI.encode_www_form_component(url)}")
      JSON.parse(res.body)
    end

    private

    def get_binary(path, params)
      clean = params.compact
      query = URI.encode_www_form(clean)
      res   = request(:get, "#{path}?#{query}")
      res.body
    end

    def post_binary(path, body)
      res = request(:post, path, body)
      res.body
    end

    def request(method, path, body = nil)
      uri  = URI("#{@base_url}#{path}")
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl      = uri.scheme == "https"
      http.read_timeout = @timeout
      http.open_timeout = 10

      req = case method
            when :get  then Net::HTTP::Get.new(uri)
            when :post then Net::HTTP::Post.new(uri)
            else raise ArgumentError, "Unsupported HTTP method: #{method}"
            end

      req["Authorization"] = "Bearer #{@api_key}"
      req["User-Agent"]    = "snapsharp-ruby/#{SnapSharp::VERSION}"

      if body
        req["Content-Type"] = "application/json"
        req.body = JSON.generate(body)
      end

      res = http.request(req)
      handle_error(res) unless res.is_a?(Net::HTTPSuccess)
      res
    end

    def handle_error(res)
      parsed = JSON.parse(res.body) rescue {}
      msg    = parsed["message"] || parsed["error"] || "HTTP #{res.code}"

      case res.code.to_i
      when 401 then raise AuthError, msg
      when 429
        retry_after = res["Retry-After"]&.to_i || 30
        raise RateLimitError.new(msg, retry_after)
      when 504 then raise TimeoutError, msg
      else raise APIError.new(msg, res.code.to_i)
      end
    end
  end
end

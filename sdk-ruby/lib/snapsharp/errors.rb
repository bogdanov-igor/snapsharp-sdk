module SnapSharp
  # Base error for all SnapSharp API errors.
  class APIError < StandardError
    attr_reader :status

    def initialize(message, status = 0)
      super(message)
      @status = status
    end
  end

  # Raised on 401 Unauthorized responses.
  class AuthError < APIError
    def initialize(message = "Invalid or missing API key")
      super(message, 401)
    end
  end

  # Raised on 429 Too Many Requests responses.
  class RateLimitError < APIError
    attr_reader :retry_after

    def initialize(message = "Rate limit exceeded", retry_after = 30)
      super(message, 429)
      @retry_after = retry_after
    end
  end

  # Raised on 504 Gateway Timeout responses.
  class TimeoutError < APIError
    def initialize(message = "Request timed out")
      super(message, 504)
    end
  end
end

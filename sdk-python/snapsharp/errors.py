class SnapSharpError(Exception):
    def __init__(self, message: str, status: int = 0):
        super().__init__(message)
        self.status = status


class AuthError(SnapSharpError):
    def __init__(self, message: str = "Invalid or missing API key"):
        super().__init__(message, 401)


class RateLimitError(SnapSharpError):
    def __init__(self, message: str = "Rate limit exceeded", retry_after: int = 30):
        super().__init__(message, 429)
        self.retry_after = retry_after


class TimeoutError(SnapSharpError):
    def __init__(self, message: str = "Request timed out"):
        super().__init__(message, 504)

"""SnapSharp — Official Python SDK."""

from .client import SnapSharp
from .errors import SnapSharpError, AuthError, RateLimitError, TimeoutError

__all__ = ["SnapSharp", "SnapSharpError", "AuthError", "RateLimitError", "TimeoutError"]
__version__ = "1.0.0"

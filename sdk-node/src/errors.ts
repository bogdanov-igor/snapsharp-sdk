export class SnapSharpError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = 'SnapSharpError';
    this.status = status;
    this.code = code;
  }
}

export class AuthError extends SnapSharpError {
  constructor(message = 'Invalid or missing API key') {
    super(message, 401, 'unauthorized');
    this.name = 'AuthError';
  }
}

export class RateLimitError extends SnapSharpError {
  retryAfter: number;

  constructor(message = 'Rate limit exceeded', retryAfter = 30) {
    super(message, 429, 'rate_limited');
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

export class TimeoutError extends SnapSharpError {
  constructor(message = 'Request timed out') {
    super(message, 504, 'timeout');
    this.name = 'TimeoutError';
  }
}

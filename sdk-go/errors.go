package snapsharp

import "fmt"

// APIError is the base error type returned by the SnapSharp API.
type APIError struct {
	Message string
	Status  int
}

func (e *APIError) Error() string {
	return fmt.Sprintf("SnapSharp API error %d: %s", e.Status, e.Message)
}

// AuthError is returned for 401 Unauthorized responses.
type AuthError struct {
	Message string
}

func (e *AuthError) Error() string {
	return fmt.Sprintf("SnapSharp auth error: %s", e.Message)
}

// RateLimitError is returned for 429 Too Many Requests responses.
type RateLimitError struct {
	Message    string
	RetryAfter int
}

func (e *RateLimitError) Error() string {
	return fmt.Sprintf("SnapSharp rate limit exceeded (retry after %ds): %s", e.RetryAfter, e.Message)
}

// TimeoutError is returned for 504 Gateway Timeout responses.
type TimeoutError struct {
	Message string
}

func (e *TimeoutError) Error() string {
	return fmt.Sprintf("SnapSharp timeout: %s", e.Message)
}

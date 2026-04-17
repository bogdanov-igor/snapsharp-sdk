<?php

namespace SnapSharp\Errors;

class RateLimitException extends SnapSharpException
{
    private int $retryAfter;

    public function __construct(string $message = 'Rate limit exceeded', int $retryAfter = 30)
    {
        parent::__construct($message, 429);
        $this->retryAfter = $retryAfter;
    }

    public function getRetryAfter(): int
    {
        return $this->retryAfter;
    }
}

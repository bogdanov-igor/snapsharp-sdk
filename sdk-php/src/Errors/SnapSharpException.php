<?php

namespace SnapSharp\Errors;

class SnapSharpException extends \RuntimeException
{
    public function __construct(string $message, int $status = 0, ?\Throwable $previous = null)
    {
        parent::__construct($message, $status, $previous);
    }

    public function getStatus(): int
    {
        return $this->getCode();
    }
}

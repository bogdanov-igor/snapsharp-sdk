<?php

namespace SnapSharp\Errors;

class TimeoutException extends SnapSharpException
{
    public function __construct(string $message = 'Request timed out')
    {
        parent::__construct($message, 504);
    }
}

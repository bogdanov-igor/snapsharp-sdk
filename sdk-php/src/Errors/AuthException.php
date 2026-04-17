<?php

namespace SnapSharp\Errors;

class AuthException extends SnapSharpException
{
    public function __construct(string $message = 'Invalid or missing API key')
    {
        parent::__construct($message, 401);
    }
}

<?php
require 'vendor/autoload.php';
use Illuminate\Support\Facades\Http;

$apiKey = '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';
$response = file_get_contents('https://openrouter.ai/api/v1/models', false, stream_context_create([
    'http' => [
        'header' => "Authorization: Bearer $apiKey\r\n"
    ]
]));

echo $response;

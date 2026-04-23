<?php

$apiKey = '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';
$model = 'google/gemini-flash-1.5-8b:free'; // Using a known likely model

$data = [
    'model' => $model,
    'messages' => [
        [
            'role' => 'system',
            'content' => 'You are a helpful assistant. Respond only in JSON.',
        ],
        [
            'role' => 'user',
            'content' => 'Hello, what is 2+2?',
        ],
    ],
    'response_format' => ['type' => 'json_object']
];

$ch = curl_init('https://openrouter.ai/api/v1/chat/completions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $apiKey,
    'Content-Type: application/json',
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status: $httpCode\n";
echo "Response:\n$response\n";

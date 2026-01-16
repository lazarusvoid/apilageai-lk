<?php
// === CONFIGURATION ===
$openAiKey = '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';

// === Check OpenAI by actually calling gpt-4o ===
function checkOpenAI($key, &$errorMsg) {
    $url = 'https://api.openai.com/v1/chat/completions';
    $headers = [
        'Authorization: Bearer ' . $key,
        'Content-Type: application/json'
    ];

    $postData = json_encode([
        "model" => "gpt-3.5-turbo",
        "messages" => [
            ["role" => "user", "content" => "hi"]
        ],
        "max_tokens" => 1
    ]);

    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => implode("\r\n", $headers),
            'content' => $postData,
            'timeout' => 10
        ]
    ]);

    $response = @file_get_contents($url, false, $context);
    if ($response === FALSE) {
        $errorMsg = "Failed to connect.";
        return false;
    }

    $data = json_decode($response, true);

    if (isset($data['error'])) {
        $errorMsg = $data['error']['message'];
        return false;
    }

    return true;
}

// === Run checks ===
$openaiMsg = "";
$openaiOK = checkOpenAI($openAiKey, $openaiMsg);

// === Build JSON response ===
$result = [
    "openai" => $openaiOK ? "working" : "not working: $openaiMsg"
];

// === Set HTTP status ===
http_response_code($openaiOK ? 200 : 500);

// === Output JSON for chart or frontend ===
header('Content-Type: application/json');
echo json_encode($result, JSON_PRETTY_PRINT);
<?php
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$prompt = $data["prompt"] ?? "";
$context = $data["context"] ?? "";

if (!$prompt || !$context) {
    http_response_code(400);
    echo json_encode(["error" => "Prompt and context are required"]);
    exit;
}

$apiKey = "AIzaSyB4ObTPBr7UpnGrWow5ZcdgdSGASM4YWGk";

$payload = [
    "contents" => [
        [
            "role" => "user",
            "parts" => [
                [
                    "text" => "Generate 3-5 study questions based on this content: $context. $prompt and give answers for the generated contents without explaining, just answers only."
                ]
            ]
        ]
    ]
];

$ch = curl_init("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$apiKey");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    $responseData = json_decode($response, true);
    $text = $responseData['candidates'][0]['content']['parts'][0]['text'] ?? 'No result.';
    echo json_encode(["result" => trim($text)]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Failed to generate content from Gemini."]);
}
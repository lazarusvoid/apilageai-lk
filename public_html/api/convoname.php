<?php
// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

// Get JSON input
$data = json_decode(file_get_contents('php://input'), true);
$message = $data['message'] ?? '';

if (!$message) {
    http_response_code(400);
    echo json_encode(["error" => "Message is required"]);
    exit;
}

// Gemini API Key
$apiKey = "AIzaSyCpCfRv4O5kgI_MAexOWVdyV3_5QaIvmYE";

// Gemini Payload
$payload = [
    "contents" => [[
        "role" => "user",
        "parts" => [[
            "text" => "Give a short meaningful title for this chat:\n\"$message\"\nOnly return the title. Output only the title name and keep it under 30 characters only letters no numbers. Don't include quotes or punctuation. Only output the title text. Conversation title must be English."
        ]]
    ]]
];

$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$apiKey";
$ch = curl_init($url);
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
    if (
        !isset($responseData['candidates'][0]['content']['parts'][0]['text'])
    ) {
        echo json_encode(["title" => "Untitled Conversation"]);
        exit;
    }
    $title = $responseData['candidates'][0]['content']['parts'][0]['text'] ?? '';
    $title = trim($title);

    // Enforce max 30 characters
    if (mb_strlen($title) > 30) {
        $title = mb_substr($title, 0, 30);
    }

    echo json_encode(["title" => $title]);
} else {
    http_response_code(500);
    echo json_encode(["title" => "Untitled Conversation"]);
}
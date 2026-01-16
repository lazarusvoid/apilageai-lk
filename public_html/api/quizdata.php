<?php
header("Content-Type: application/json");

$input = json_decode(file_get_contents('php://input'), true);
$subject = $input['subject'] ?? '';
$grade = $input['grade'] ?? '';
$language = $input['language'] ?? 'English';
$difficulty = $input['difficulty'] ?? 'Medium';

$optionCount = $grade === 'A/L (Advanced Level)' ? 5 : 4;

$prompt = "Generate a 5-question multiple-choice quiz in the {$language} language for a student in {$grade}. The quiz must be about the subject \"{$subject}\" with a difficulty level of \"{$difficulty}\". It must strictly follow the official Sri Lankan Ministry of Education syllabus. For each question, provide {$optionCount} options. For each question, also provide a brief explanation in {$language} for why the correct answer is right. Ensure the entire output is a valid JSON object.";

$schema = [
    "type" => "OBJECT",
    "properties" => [
        "questions" => [
            "type" => "ARRAY",
            "items" => [
                "type" => "OBJECT",
                "properties" => [
                    "question" => ["type" => "STRING"],
                    "options" => ["type" => "ARRAY", "items" => ["type" => "STRING"]],
                    "correctAnswerIndex" => ["type" => "INTEGER"],
                    "explanation" => ["type" => "STRING"]
                ],
                "required" => ["question", "options", "correctAnswerIndex", "explanation"]
            ]
        ]
    ],
    "required" => ["questions"]
];

$payload = json_encode([
    "contents" => [
        ["role" => "user", "parts" => [["text" => $prompt]]]
    ],
    "generationConfig" => [
        "responseMimeType" => "application/json",
        "responseSchema" => $schema
    ]
]);

$apiKey = "AIzaSyAJLaX4BksgYBxMJXpsUp0mkTgwnDw7SRA";
$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={$apiKey}";

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS => $payload
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    http_response_code($httpCode);
    echo json_encode(["error" => "API error", "details" => $response]);
    exit;
}

$result = json_decode($response, true);
$text = $result['candidates'][0]['content']['parts'][0]['text'] ?? null;

if (!$text) {
    http_response_code(500);
    echo json_encode(["error" => "Invalid response from API"]);
    exit;
}

echo $text;
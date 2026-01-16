<?php
// gemini_suggest.php

// Allow requests from any domain
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Read request payload
$data = json_decode(file_get_contents('php://input'), true);
if (!$data || !isset($data['conversation_context'])) {
    echo json_encode(['suggestions' => []]);
    exit;
}

// Gemini API configuration
$api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
$api_key = "AIzaSyBjjzjDzp5ruIzuMg_FEJLjrmoOydsKSSg"; // securely store your key

$messages = $data['conversation_context'];
$max_suggestions = $data['max_suggestions'] ?? 5;

// Build Gemini request
$payload = [
    "prompt" => [
        [
            "content" => "Suggest $max_suggestions possible next user messages based on this conversation:\n$messages",
            "type" => "TEXT"
        ]
    ],
    "temperature" => 0.7,
    "candidateCount" => $max_suggestions,
    "maxOutputTokens" => 150
];

// Send request to Gemini
$ch = curl_init($api_url . "?key={$api_key}");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$suggestions = [];
if ($httpcode === 200 && $response) {
    $json = json_decode($response, true);
    if (isset($json['candidates'])) {
        foreach ($json['candidates'] as $candidate) {
            if (!empty($candidate['content'])) {
                $suggestions[] = $candidate['content'];
            }
        }
    }
}

// Return JSON
echo json_encode(['suggestions' => $suggestions]);